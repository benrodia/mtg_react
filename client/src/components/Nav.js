import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {Link, useLocation} from "react-router-dom"
import {PieChart} from "react-minimal-pie-chart"

import utilities from "../utilities"
import Settings from "./Settings"

const {HOME_DIR, subTitle, COLORS, sum} = utilities

export default connect(({auth: {user, isAuthenticated}, deck, settings: {showSubTitle}}) => {
  return {user, isAuthenticated, deck, showSubTitle}
}, actions)(({user, isAuthenticated, deck, showSubTitle, userName, openModal, openUser}) => {
  const path = useLocation().pathname
  const colorData = COLORS().map(color => {
    const value = sum(deck.list.map(c => c.mana_cost.split("").filter(i => i === color.symbol).length))
    return {label: color.name, value, color: color.fill}
  })

  const deckTitle = (
    <div className="deck-nav bar mini-spaced-bar even">
      <span>|</span>
      <Link to={`${HOME_DIR}/deck/${deck.slug}`} className={`navItem ${path === `${HOME_DIR}/build` && "active"}`}>
        <p className="sub-title bar mini-spaced-bar">
          {deck.name || "New Deck"} {!showSubTitle ? null : <div>{subTitle(deck)}</div>}
          <span className="icon">
            <PieChart data={colorData} startAngle={270} />
          </span>
        </p>
      </Link>
      <Link to={`${HOME_DIR}/deck/${deck.slug}/playtest`}>
        <button className="small-button">Playtest</button>
      </Link>
    </div>
  )

  const toProfile = (
    <Link to={`${HOME_DIR}/user/${user.slug}`}>
      <button className="smaller-button bar">
        <p>{user.name}</p>
        <span className=" icon-user" />
      </button>
    </Link>
  )

  return (
    <nav className="main-header">
      <div className="title">
        <Link to={HOME_DIR}>ReactMTG</Link>
        {deck.name ? deckTitle : null}
      </div>
      <div className="nav">
        {isAuthenticated ? toProfile : null}
        <span
          className="clicky-icon icon-cog cog"
          onClick={_ => openModal({title: "Settings", content: <Settings />})}></span>
      </div>
    </nav>
  )
})
