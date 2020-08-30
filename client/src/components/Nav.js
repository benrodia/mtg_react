import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {Link, useLocation} from "react-router-dom"
import {PieChart} from "react-minimal-pie-chart"

import utilities from "../utilities"
import Settings from "./Settings"

const {HOME_DIR, subTitle, COLORS, sum} = utilities

export default connect(({auth: {user}, deck, settings: {showSubTitle}}) => {
  return {user, deck, showSubTitle}
}, actions)(({user, deck, showSubTitle, userName, openModal, viewUser}) => {
  const path = useLocation().pathname
  const colorData = COLORS().map(color => {
    const value = sum(deck.list.map(c => c.mana_cost.split("").filter(i => i === color.symbol).length))
    return {label: color.name, value, color: color.fill}
  })

  console.log("deckID", deck)

  const deckTitle = (
    <div className="deck-nav bar">
      <Link to={`${HOME_DIR}/build/${deck.url}`} className={`navItem ${path === `${HOME_DIR}/build` && "active"}`}>
        <p className="sub-title">
          | {deck.name || "New Deck"}
          {!showSubTitle ? null : subTitle(deck)}
          <span className="icon">
            <PieChart data={colorData} startAngle={270} />
          </span>
        </p>
      </Link>
    </div>
  )

  const toProfile = (
    <Link to={`${HOME_DIR}/user/${user.slug}`}>
      <button className="smaller-button bar" onClick={_ => viewUser(user)}>
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
        <span
          className="clicky-icon icon-cog cog"
          onClick={_ => openModal({title: "Settings", content: <Settings />})}></span>
      </div>
    </nav>
  )
})
