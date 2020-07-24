import React from 'react'
import {Link, Router, Route, useLocation} from 'react-router-dom'
import {HOME_DIR} from '../constants/definitions'
import {subTitle} from '../functions/formattingLogic'

export default function Nav(props) {
  const {pages,deckInfo,home,settings} = props
      const pathname = useLocation().pathname


  	return <nav className="main-header">
        <div className="title">
          <Link to={HOME_DIR} className="navbar-brand">ReactMTG |</Link>
          <Link to={HOME_DIR+'/user'} className="navbar-brand">{settings.userName|| "User"} |</Link>
          <Link to={HOME_DIR+'/build'} className='deckTitle'>
            {deckInfo.name?deckInfo.name:"New Deck"} 
            <span className='subtitle'>{!settings.subtitle?null:subTitle(deckInfo)}</span>
            <span className="icon-pencil"/>
          </Link>
        </div>

        <div className="nav">{pages.map(n=><Link 
            to={n.path}
            key={n.name+"Link"}
            className= {`navItem ${pathname===n.path&&'active'}`} 
            >{n.name}</Link>
          )}
        </div>
      </nav>
}

