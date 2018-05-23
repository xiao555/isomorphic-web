import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Post.styl'

class Post extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }

  render() {
    const { title, content } = this.props
    return (
      <div className={s.root}>
        <div className={s.container}>
          <article className={s.postItem}>
            <h2>{title}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        </div>
      </div>
    )
  }
}

export default withStyles(s)(Post)
