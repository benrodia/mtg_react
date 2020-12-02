import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {Link, useLocation} from "react-router-dom"
import {PieChart} from "react-minimal-pie-chart"

import Hamburger from "./Hamburger"
import BasicSearch from "./BasicSearch"
import NewDeck from "./NewDeck"
import DeckFeed from "./DeckFeed"
import Login from "./Login"
import DeckNav from "./DeckNav"

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
)(({user, isAuthenticated, users, decks, deck, openModal, openDeck}) => {
  const {pathname} = useLocation()

  return (
    <nav className="main-header">
      <div className="title bar even ">
        <div className="nav bar even mini-spaced-bar">
          <Link to={HOME_DIR}>MTG Grip</Link>
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
        </div>
        <div className="right bar even spaced-bar">
          {isAuthenticated ? (
            <div className="bar even">
              <div className="bar">
                <button
                  className="small-button bar even"
                  onClick={_ =>
                    openModal({title: "New Deck", content: <NewDeck />})
                  }>
                  <span className="icon-plus" />
                </button>
                <button
                  className="small-button bar even"
                  onClick={_ =>
                    openModal({title: "Open Deck", content: <DeckFeed you />})
                  }>
                  <span className="icon-folder-open" />
                </button>
              </div>
            </div>
          ) : null}
          {!deck._id ? null : <DeckNav />}

          {isAuthenticated ? (
            <div className="to-profile">
              <Link to={`${HOME_DIR}/user/${user.slug}`}>
                <p className="bar even">
                  {user.name}
                  <span className="icon-user-circle-o" />
                </p>
              </Link>
            </div>
          ) : (
            <div className="log-in-nav">
              <div className="bar center mini-spaced-bar">
                <button
                  className={`inver-button smaller-button`}
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
      </div>
    </nav>
  )
})
// <Link to={`${HOME_DIR}/advanced`}>
//   <button
//     className={`small-button icon-cog ${
//       pathname.includes("/advanced") && "selected"
//     }`}>
//     Advanced Search
//   </button>
// </Link>

// const deckNav = _ => {
//   const deckName = (
//     <p className="sub-title bar mini-spaced-bar">
//       <span className="icon">
//         <PieChart
//           data={COLORS("fill").map((color, i) => {
//             return {value: deck.colors[i], color}
//           })}
//           startAngle={270}
//         />
//       </span>
//       {deck.name || "Untitled"}
//     </p>
//   )

//   const deckOptions = (
//     <Hamburger vert size={"all"} drop={"down"} before={deckName}>
//       <Link to={`${HOME_DIR}/deck/${deck.slug}`}>
//         <button className="icon-eye small-button">View</button>
//       </Link>
//       <Link to={`${HOME_DIR}/build`}>
//         <button className="icon-cog small-button">Build</button>
//       </Link>
//       <Link to={`${HOME_DIR}/deck/${deck.slug}/playtest`}>
//         <button className="icon-play small-button">Playtest</button>
//       </Link>
//       <Link to={`${HOME_DIR}`}>
//         <button
//           className="icon-cancel small-button"
//           onClick={_ => openDeck(null)}>
//           Close
//         </button>
//       </Link>
//     </Hamburger>
//   )

//   if (deck._id) {
//     return (
//       <div className="deck-nav bar mini-spaced-bar even">{deckOptions}</div>
//     )
//   } else return null
// }
