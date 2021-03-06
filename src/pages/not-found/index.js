import React from 'react'
import Layout from '@/Layout'
import Post from '@/Post'

function action() {
  const notFound = {
    title: "404",
    content: "Sorry, the page you were trying to view does not exist.",
  }

  return {
    chunks: ['not-found'],
    title: notFound.title,
    component: (
      <Layout>
        <Post {...notFound} />
      </Layout>
    ),
    status: 404,
  }
}

export default action