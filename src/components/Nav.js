import React from 'react'
import {Link, Router, Route, useLocation} from 'react-router-dom'

export default function Nav(props) {
      const pathname = useLocation().pathname
  		const navItems = props.pages.map(n=>{
  			return (
    				<Link 
            to={n.path}
            key={n.name+"Link"}
    				className= {`navItem ${pathname===n.path&&'active'}`} 
    				>{n.name}</Link>
  			)
  		})

  	return (
      <nav className="main-header">
        <div className="title">
          <Link to="/info" className="navbar-brand">ReactMTG |</Link>
          <Link to="/info" className='deckTitle'>
           {props.deckInfo.name?props.deckInfo.name:"New Deck"} ({props.deckInfo.format})
          </Link>
        </div>
        <div className="nav">
            {navItems}
        </div>
      </nav>
  		)
}

