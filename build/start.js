import koa from 'koa'
import opn from 'opn'
import path from 'path'
import chalk from 'chalk'
import clean from './clean'
import webpack from 'webpack'
import config from '../config'
import run, { format } from './run'
import clientConfig from './webpack.client.config'
import serverConfig from './webpack.server.config'
import koaDevMiddleware from 'koa-webpack-dev-middleware'
import koaHotMiddleware from 'koa-webpack-hot-middleware'
import middleware from '../src/middleware'
import koaStatic from 'koa-static'
import convert from 'koa-convert'

const isDebug = !process.argv.includes('--release')
// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  // ignored: /node_modules/,
}

function createCompilationPromise(name, compiler, config, options) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date()
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date()
      !options.silent && console.info(`[${chalk.green(format(timeStart))}] Compiling '${chalk.green(name)}'...`)
    })

    compiler.hooks.done.tap(name, stats => {
      options.showStats && console.info(stats.toString(config.stats))
      const timeEnd = new Date()
      const time = timeEnd.getTime() - timeStart.getTime()
      if (stats.hasErrors()) {
        !options.silent && console.info(
          `[${chalk.red(format(timeEnd))}] Failed to compile '${chalk.red(name)}' after ${chalk.red(time)} ms`,
        )
        reject(new Error('Compilation failed!'))
      } else {
        !options.silent && console.info(
          `[${chalk.green(format(
            timeEnd,
          ))}] Finished '${chalk.green(name)}' compilation after ${chalk.green(time)} ms`,
        )
        resolve(stats)
      }
    })
  })
}

let app

async function start(options = {
  silent: false,
  showStats: true,
  autoOpenBrowser: true,
}) {
  if (app) return app
  app = new koa()

  // Configure client-side hot module replacement
  clientConfig.entry.client = [`webpack-hot-middleware/client`, ...clientConfig.entry.client]
  clientConfig.module.rules = clientConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure server-side hot module replacement
  serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  serverConfig.output.hotUpdateChunkFilename =
    'updates/[id].[hash].hot-update.js';
  serverConfig.module.rules = serverConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure compilation
  await run(clean, options)
  const clientCompiler = webpack(clientConfig)
  const serverCompiler = webpack(serverConfig)
  const clientPromise = createCompilationPromise(
    'client',
    clientCompiler,
    clientConfig,
    options,
  );
  const serverPromise = createCompilationPromise(
    'server',
    serverCompiler,
    serverConfig,
    options,
  );

  // https://github.com/yiminghe/koa-webpack-dev-middleware
  let devMiddleware = koaDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent',
    noInfo: true,
    watchOptions,
  })
  app.use(devMiddleware)

  // https://github.com/octatone/koa-webpack-hot-middleware
  app.use(koaHotMiddleware(clientCompiler, { log: false }));

  // server.js
  let server

  function checkForUpdate(fromUpdate) {
    const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';
    if (!server.hot) {
      throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
    }
    if (server.hot.status() !== 'idle') {
      return Promise.resolve();
    }
    return server.hot
      .check(true)
      .then(updatedModules => {
        if (!updatedModules) {
          if (fromUpdate) {
            console.info(`${hmrPrefix}Update applied.`);
          }
          return;
        }
        if (updatedModules.length === 0) {
          console.info(`${hmrPrefix}Nothing hot updated.`);
        } else {
          console.info(`${hmrPrefix}Updated modules:`);
          updatedModules.forEach(moduleId =>
            console.info(`${hmrPrefix} - ${moduleId}`),
          );
          checkForUpdate(true);
        }
      })
      .catch(error => {
        if (['abort', 'fail'].includes(server.hot.status())) {
          console.warn(`${hmrPrefix}Cannot apply update.`);
          delete require.cache[require.resolve('../dist/server')];
          // eslint-disable-next-line global-require, import/no-unresolved
          server = require('../dist/server').default;
          console.warn(`${hmrPrefix}Server has been reloaded.`);
        } else {
          console.warn(
            `${hmrPrefix}Update failed: ${error.stack || error.message}`,
          );
        }
      });
  }

  serverCompiler.watch(watchOptions, (error, stats) => {
    if (server && !error && !stats.hasErrors()) {
      checkForUpdate()
    }
  });

  // Wait until both client-side and server-side bundles are ready
  await clientPromise;
  await serverPromise;

  const timeStart = new Date();
  !options.silent && console.info(`[${chalk.green(format(timeStart))}] Launching server...`);

  // Load compiled src/server.js as a middleware
  // eslint-disable-next-line global-require, import/no-unresolved
  server = require('../dist/server').default

  // Timer
  !options.silent && app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    const message = `${ctx.method} ${decodeURIComponent(ctx.url)} ${ctx.status} - ${ms}ms`
    console[ctx.status == 200 ? 'info' : 'warn'](message)
  })

  // Register Node.js middleware
  app.use(koaStatic(path.resolve(__dirname, '../static')))
  app.use(middleware())

  // Register server-side-render router 
  app.use(async (ctx, next) => {
    await server.router(ctx, next)
  })
  
  const uri = `http://localhost:${port}`

  devMiddleware.waitUntilValid(() => {
    const timeEnd = new Date();
    const time = timeEnd.getTime() - timeStart.getTime();
    !options.silent && console.info(`[${chalk.green(format(timeEnd))}] Server launched at ${chalk.cyan(uri)} after ${chalk.green(time)} ms`);
    // when env is testing, don't need open it
    if (options.autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
  })
  
  return app.listen(port)
}

export default start;