import React from 'react'
import Home from './Home'
import Layout from '../../components/Layout'

async function action({ fetch }) {
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