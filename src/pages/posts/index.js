import React from 'react'
import Layout from '@/Layout'
import Post from '@/Post'

async function action({ fetch, params }) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query:
        `{
          article(id: "${params.id}") {
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
    chunks: ['posts'],
    title: data.title,
    component: (
      <Layout>
        <Post {...data.article} />
      </Layout>
    ),
  }
}

export default action