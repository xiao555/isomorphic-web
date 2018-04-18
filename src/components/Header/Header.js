import React from 'react'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Header.css'
import Link from '../Link'
import Navigation from '../Navigation'

class Header extends React.Component {
  render() {
    return (
      <header>
        <div className={s.container}>
          <Navigation />
          <Link className={s.brand} to="/">
            <span className={s.brandTxt}>Logo</span>
          </Link>
        </div>
        <div className={s.banner}>
          <h1 className={s.bannerTitle}>Isomorphic Web App</h1>
          <Link 
            className={s.bannerLink} 
            to="https://github.com/xiao555/isomorphic-web"
            target="_blank"
            >
            Github
          </Link>
        </div>
      </header>
    )
  }
}

export default withStyles(s)(Header)