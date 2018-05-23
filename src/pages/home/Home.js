import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Home.styl'
import Link from '@/Link'

class Home extends React.Component {
  static propTypes = {
    posts: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        content: PropTypes.string,
      })
    ).isRequired
  }

  render() {
    return (
      <main className={s.root}>
        <div className={s.container}>
          <h2>Articles</h2>
          {this.props.posts.map(post => (
            <article key={post.link} className={s.postItem}>
              <h1 className={s.postTitle}>
                <Link to={`/posts/${post.link}`}>{post.title}</Link>
              </h1>
              <div
                className={s.postDesc}
                dangerouslySetInnerHTML={{ __html: post.content}}
              />
            </article>
          ))}
        </div>
      </main>
    )
  }
}

export default withStyles(s)(Home)
