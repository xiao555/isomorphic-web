import React from 'react'
import Layout from '../../components/Layout'
import Post from '../../components/Post'

function action() {
  const about = {
    title: "About Us",
    html: "<p>Isomorphic Web App By React and Koa.</p>",
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