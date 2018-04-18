import React from 'react'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Footer.css'
import Link from '../Link'

class Footer extends React.Component {
  render() {
    return (
      <footer className={s.root}>
        <div className={s.container}>
          <span className={s.text}>© Xiao555</span>
          <span className={s.spacer}>·</span>
          <Link 
            className={s.link} 
            to="https://github.com/xiao555"
            target="_blank"
            >
            Github
          </Link>
        </div>
      </footer>
    )
  }
}