import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {connect} from 'react-redux'
import {HOME_DIR} from '../constants/definitions'
import {subTitle} from '../functions/formattingLogic'

function Nav(props) {
  const {deck,subtitle,userName} = props
  const path = useLocation().pathname

	return (
    <nav className="main-header">
      <div className="title">
        <Link to={HOME_DIR} className="navbar-brand">ReactMTG |</Link>
        <Link to={HOME_DIR+'/user'} className="navbar-brand">{userName|| "User"} |</Link>
        <Link to={HOME_DIR+'/build'} className='deckTitle'>
          {deck.name||"New Deck"} 
          <span className='subtitle'>{!subtitle?null:subTitle(deck)}</span>
          <span className="icon-pencil"/>
        </Link>
      </div>

      <div className="nav">
        <Link to={`${HOME_DIR}/user`} className={`navItem ${path===`${HOME_DIR}/user`&&'active'}`}>User</Link>
        <Link to={`${HOME_DIR}/build`} className={`navItem ${path===`${HOME_DIR}/build`&&'active'}`}>Build</Link>
        <Link to={`${HOME_DIR}/test`} className={`navItem ${path===`${HOME_DIR}/test`&&'active'}`}>Test</Link>
      </div>
    </nav>
  )
}

const select = state => {
  return {
    deck: state.deck,
    userName: state.settings.userName,
    subTitle: state.settings.subTitle,
  }
}

export default connect(select,null)(Nav)