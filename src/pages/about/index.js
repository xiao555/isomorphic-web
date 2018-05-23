import React from 'react'
import Layout from '@/Layout'
import Post from '@/Post'

function action() {
  const about = {
    title: "About Us",
    content: "<p>Isomorphic Web App By React and Koa.</p>",
  }

  return {
    chunks: ['about'],
    title: about.title,
    component: (
      <Layout>
        <Post {...about} />
      </Layout>
    ),
  }
}

export default action