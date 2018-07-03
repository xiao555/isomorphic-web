import path from 'path'
import koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import compose from 'koa-compose'
import middleware from './middleware'
import nodeFetch from 'node-fetch'
import React from 'react'
import ReactDOM from 'react-dom/server'
import App from './components/App'
import Html from './components/Html'
import appRouter from './router'
import chunks from './chunk-manifest.json'
import createFetch from './createFetch'
import { graphql } from 'graphql'
import schema from './data/schema'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import config from '../config'
import log from './utils/log'

const router = new Router()

router.all('/graphql', graphqlKoa({ schema }))

router.get(
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql', // a POST endpoint that GraphiQL will make the actual requests to
  }),
);

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

    // Universal HTTP client
    const fetch = createFetch(nodeFetch, {
      baseUrl: config.api.serverUrl,
      cookie: ctx.cookie,
      schema,
      graphql,
    });

    const context = {
      insertCss,
      fetch: fetch,
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
    data.styles = [{ id: 'css', cssText: [...css].join('').replace(/(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g, '').replace(/\n/g, ' ').replace(/ +/g, ' ') }]

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
      apiUrl: config.api.clientUrl,
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
    ctx.body = `<!doctype html>${html}`
  } catch (error) {
    log.error(error)
    next(error)
  }
})

function start() {
  const app = new koa()
  const port = process.env.PORT || config.prod.port

  // Timer
  app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    const message = `${ctx.method} ${decodeURIComponent(ctx.url)} ${ctx.status} - ${ms}ms`
    log[ctx.status == 200 ? 'info' : 'warn'](message)
  })

  // Register Node.js middleware
  app.use(koaStatic(path.resolve(__dirname, 'static')))
  app.use(middleware())

  // Register Node.js router
  app
    .use(router.routes())
    .use(router.allowedMethods())

  app.listen(port, () => {
    console.info(`The server is running at http://localhost:${port}/`);
  });
}

//
// Start server
// -----------------------------------------------------------------------------
if (!module.hot) {
  start()
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  module.hot.accept('./router');
}

export default {
  hot: module.hot,
  router: compose([
    router.routes(),
    router.allowedMethods()
  ])
};