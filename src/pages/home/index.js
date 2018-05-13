import React from 'react'
import Home from './Home'
import Layout from '@/Layout'

async function action() {
  const posts = [
    {
      title: 'Hello World',
      link: '/post/hello-world',
      content: 'echo "Hello World!"'
    }
  ]

  return {
    title: 'Isomorphic Web App',
    chunks: ['home'],
    component: (
      <Layout>
        <Home posts={posts} />
      </Layout>
    )
  }
}

export default action