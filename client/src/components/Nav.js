import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {Link, useLocation} from "react-router-dom"
import {PieChart} from "react-minimal-pie-chart"

import BasicSearch from "./BasicSearch"
import NewDeck from "./NewDeck"
import Login from "./Login"

import utilities from "../utilities"
const {HOME_DIR, subTitle, COLORS, sum} = utilities

export default connect(
  ({
    auth: {user, isAuthenticated},
    main: {users, decks},
    deck,
    settings: {showSubTitle},
  }) => {
    return {user, isAuthenticated, users, decks, deck}
  },
  actions
)(({user, isAuthenticated, users, decks, deck, openModal}) => {
  const {pathname} = useLocation()

  const deckTitle = _ => {
    if (deck._id) {
      return (
        <div className="deck-nav bar mini-spaced-bar even">
          <span>|</span>
          <Link to={`${HOME_DIR}/deck/${deck.slug}`} className={""}>
            <p className="icon-layers sub-title bar mini-spaced-bar">
              {deck.name || "New Deck"}
              <span className="icon">
                <PieChart
                  data={COLORS("fill").map((color, i) => {
                    return {value: deck.colors[i], color}
                  })}
                  startAngle={270}
                />
              </span>
            </p>
          </Link>
          <Link to={`${HOME_DIR}/deck/${deck.slug}/playtest`}>
            <button className="icon-play small-button">Playtest</button>
          </Link>
        </div>
      )
    } else return null
  }

  return (
    <nav className="main-header">
      <div className="title bar even mini-spaced-bar">
        <Link to={HOME_DIR}>MTG Grip</Link>
        {deckTitle()}
      </div>
      <div className="nav bar even mini-spaced-bar">
        <BasicSearch
          searchable
          preview
          defImg=<span className="icon-search" />
          placeholder="Search Site"
          options={[...users, ...decks]}
          renderAs={({object, name, slug}) => (
            <div className="bar even">
              <Link to={`${HOME_DIR}/${object}/${slug}`}>
                <span
                  className={`icon-${object === "user" ? "user" : "layers"}`}>
                  {name}
                </span>
              </Link>
            </div>
          )}
        />
        {isAuthenticated ? (
          <button
            className="success-button smaller-button new-deck bar even"
            onClick={_ => openModal({title: "New Deck", content: <NewDeck />})}>
            <span className="icon-plus" />
            <div>New Deck</div>
          </button>
        ) : null}

        {isAuthenticated ? (
          <div className="to-profile">
            <Link to={`${HOME_DIR}/user/${user.slug}`}>
              <p>{user.name}</p>
              <span className="icon-user-circle-o"></span>
            </Link>
          </div>
        ) : (
          <div className="log-in-nav">
            <div className="bar center mini-spaced-bar">
              <button
                className={`inverse-button smaller-button`}
                onClick={_ =>
                  openModal({
                    title: "Log In or Sign Up",
                    content: <Login inModal />,
                  })
                }>
                Log In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
})
