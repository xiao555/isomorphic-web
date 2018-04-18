
import koa from 'koa'
import middleware from './middleware'
import log from './utils/log'
import koaStatic from 'koa-static'
import React from 'react'
import ReactDOM from 'react-dom/server'
import App from './components/App'

const app = new koa()

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  const message = `${ctx.method} ${decodeURIComponent(ctx.url)} ${ctx.status} - ${ms}ms`
  log[ctx.status == 200 ? 'info' : 'warn'](message)
})

app.use(middleware())

//
// 注册服务端渲染中间件
// -----------------------------------------------------------------------------
app.get('*', async (ctx, next) => {
  try {
    const css = new Set()

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      styles.forEach(style => css.add(style._getCss()))
    }

    const context = {
      insertCss,
      // The twins below are wild, be careful! 
      // for universal-router
      pathname: req.path,
      query: req.query,
    }

    const route = await router.resolve(context)
    
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

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
    ctx.body = `<!doctype html>${html}`
  } catch (error) {
    next(err)
  }
})

//
// 启动服务
// -----------------------------------------------------------------------------
const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
  promise.then(() => {
    app.listen(config.port, () => {
      console.info(`The server is running at http://localhost:${config.port}/`);
    });
  });
}

//
// 模块热重载 HMR
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;