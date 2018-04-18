import UniversalRouter from 'universal-router'

const routes = {
  path: '',
  // 把每个路由当做中间件处理，通过next调用
  children: [
    {
      path: '',
      load: () => import(/* webpackChunkName: 'home' */ './pages/home')
    },
    {
      path: '',
      load: () => import(/* webpackChunkName: 'about' */ './pages/about')
    },
    // 通配符路由，必须放到最后
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found')
    }
  ],
  // 默认调用匹配路由的action方法
  async action({ next }) {
    // 依次执行子路由直到命中返回结果
    const route = await next()

    // 提供 title, description 的默认值
    route.title = `${route.title || 'Untitled Page'} - isomorphic web`
    route.description = route.description || ''

    return route
  }
}

export default new UniversalRouter(routes, {
  // 自定义路由处理逻辑
  resolveRoute(context, params) {
    if (typeof context.route.load === 'function') {
      return context.route
        .load()
        .then(action => action.default(context, params))
    }
    if (typeof context.route.action === 'function') {
      return context.route.action(context, params)
    }
    return undefined // 进入下一个路由中间件
  }
})