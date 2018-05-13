
import koa from 'koa'
import Router from 'koa-router'
import middleware from './middleware'
import koaStatic from 'koa-static'
import React from 'react'
import ReactDOM from 'react-dom/server'
import App from './components/App';
import Html from './components/Html';
import appRouter from './router';
import chunks from './chunk-manifest.json';

let log = console
let port = 3002

const app = new koa()
const router = new Router()

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  const message = `${ctx.method} ${decodeURIComponent(ctx.url)} ${ctx.status} - ${ms}ms`
  log[ctx.status == 200 ? 'info' : 'warn'](message)
})

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(middleware())

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
router.get('*', async (ctx, next) => {
  try {
    const css = new Set()

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      styles.forEach(style => css.add(style._getCss()))
    }

    const context = {
      insertCss,
      fetch: '',
      // The twins below are wild, be careful! 
      // for universal-router
      pathname: ctx.path,
      query: ctx.query,
    }

    const route = await appRouter.resolve(context)
    
    if (route.redirect) {
      ctx.status = route.status || 302
      ctx.redirect(route.redirect)
      return
    }

    const data = route
    data.children = ReactDOM.renderToString(
      <App context={context}>{route.component}</App>
    )
    data.styles = [{ id: 'css', cssText: [...css].join('') }]

    const scripts = new Set()
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset))
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`)
      }
    }

    addChunk('client')
    if (route.chunk) addChunk(route.chunk)
    if (route.chunks) route.chunks.forEach(addChunk)

    data.scripts = Array.from(scripts)
    data.app = {
      apiUrl: process.env.API_CLIENT_URL || '',
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
    ctx.body = `<!doctype html>${html}`
  } catch (error) {
    log.error(error)
    next(error)
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

//
// 启动服务
// -----------------------------------------------------------------------------
if (!module.hot) {
  app.listen(port, () => {
    console.info(`The server is running at http://localhost:${port}/`);
  });
}

//
// 模块热重载 HMR
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default {
  app: app,
  router: router
};