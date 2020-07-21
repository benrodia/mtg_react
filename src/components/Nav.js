import React from 'react'
import {Link, Router, Route, useLocation} from 'react-router-dom'
import {subTitle} from '../functions/formattingLogic'

export default function Nav(props) {
  const {pages,deckInfo,home,settings} = props
      const pathname = useLocation().pathname


  	return <nav className="main-header">
        <div className="title">
          <Link to={home||'/'} className="navbar-brand">Magictouch |</Link>
          <Link to={'/user'} className="navbar-brand">{settings.userName|| "User"} |</Link>
          <Link to={'/build'} className='deckTitle'>
            {deckInfo.name?deckInfo.name:"New Deck"} 
            {!settings.subtitle?null:subTitle(deckInfo)}
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

