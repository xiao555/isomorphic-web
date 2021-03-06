import React from 'react'
import Home from './Home'
import Layout from '@/Layout'

async function action({ fetch }) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: 
        `{
          articles {
            title
            link
            author
            content
          }
        }`
    })
  })
  const { data } = await resp.json()
  

  return {
    title: 'Isomorphic Web App',
    chunks: ['home'],
    component: (
      <Layout>
        <Home posts={data.articles} />
      </Layout>
    )
  }
}

export default action