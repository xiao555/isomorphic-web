import React from 'react'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Footer.styl'
import Link from '../Link'

class Footer extends React.Component {
  render() {
    return (
      <footer className={s.root}>
        <div className={s.container}>
          <span className={s.text}>© Xiao555</span>
          <span className={s.spacer}>·</span>
          <a 
            className={s.link} 
            href="https://github.com/xiao555"
            target="_blank"
            >
            Github
          </a>
        </div>
      </footer>
    )
  }
}

export default withStyles(s)(Footer)