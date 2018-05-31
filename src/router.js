import UniversalRouter from 'universal-router'

const routes = {
  path: '',
  //  Keep in mind, routes are evaluated in order
  children: [
    {
      path: '',
      load: () => import(/* webpackChunkName: 'home' */ './pages/home')
    },
    {
      path: '/about',
      load: () => import(/* webpackChunkName: 'about' */ './pages/about')
    },
    {
      path: '/posts/:id',
      load: () => import(/* webpackChunkName: 'posts' */ './pages/posts')
    },
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ './pages/not-found')
    }
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next()
    
    //  Provide default values for title, description etc.
    route.title = `${route.title || 'Untitled Page'} - isomorphic web`
    route.description = route.description || ''

    return route
  }
}

export default new UniversalRouter(routes, {
  resolveRoute(context, params) {
    if (typeof context.route.load === 'function') {
      return context.route
        .load()
        .then(action => action.default(context, params))
    }
    if (typeof context.route.action === 'function') {
      return context.route.action(context, params)
    }
    return undefined
  }
})