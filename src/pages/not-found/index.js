import React from 'react'
import Layout from '../../components/Layout'
import Post from '../../components/Post'

function action() {
  const notFound = {
    title: "404",
    html: "Sorry, the page you were trying to view does not exist.",
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