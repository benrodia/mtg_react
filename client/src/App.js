import React, {useEffect, useRef} from "react"
import {Route, Redirect, Switch, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import actions from "./actions"
import utilities from "./utilities"

import BGImg from "./components/BGImg"
import Notifications from "./components/Notifications"
import Modal from "./components/Modal"
import Loading from "./components/Loading"
import Footer from "./components/Footer"
import Nav from "./components/Nav"
import ScrollToTop from "./components/ScrollToTop"

import Dash from "./components/_Page_Dash"
import User from "./components/_Page_User"
import Deck from "./components/_Page_Deck"
import Playtest from "./components/_Page_Playtest"
import PlaytestLobby from "./components/_Page_Playtest_Lobby"
import CardSearch from "./components/_Page_Card_Search"
import Login from "./components/Login"
import DeckSearch from "./components/_Page_Deck_Search"
import NewDeck from "./components/_Page_Deck_New"
import Settings from "./components/Settings"
import Combos from "./components/Combos"
import AdvancedCart from "./components/AdvancedCart"
import Tilt from "react-tilt"

const {HOME_DIR, DECK_ID, rnd, getArt} = utilities
export default connect(
  ({
    main: {modal, users, decks, sets},
    auth: {
      isAuthenticated,
      user: {_id},
    },
    deck: {format},
    settings: {scale, random_playmat, playmat},
  }) => {
    return {
      modal,
      users,
      decks,
      isAuthenticated,
      _id,
      sets,
      format,
      scale,
      random_playmat,
      playmat,
    }
  },
  actions
)(
  ({
    modal,
    scale,
    random_playmat,
    playmat,
    format,
    tokens,
    users,
    decks,
    isAuthenticated,
    _id,
    sets,
    loadAppData,
    getMousePos,
    changeSettings,
    loadUser,
    loadDecks,
    getCardData,
    getSetData,
    getUsers,
    openModal,
    setCombos,
    logout,
  }) => {
    const wrapper = useRef(0)
    const param = useLocation().pathname.split("/").slice(-1)[0]

    useEffect(_ => {
      const pos = ({x, y}) =>
        getMousePos([x, y, window.innerWidth, window.innerHeight])

      window.removeEventListener("mousemove", pos)
      window.addEventListener("mousemove", pos)
      return _ => window.removeEventListener("mousemove", pos)
    }, [])

    useEffect(
      _ => {
        openModal()
        random_playmat &&
          !playmat &&
          getArt().then(art => changeSettings("playmat", art))
        if (users.length) {
          setCombos(users.map(u => u.cardCombos).flat())
          !isAuthenticated && _id && logout()
        } else getUsers()
        decks.length || loadDecks()
        sets.length || getSetData()
      },
      [users, decks, sets, useLocation().pathname]
    )
    const routes = (
      <ScrollToTop>
        <Switch>
          <Route exact path={`${HOME_DIR}/dash`} component={Dash} />
          <Route
            exact
            path={`${HOME_DIR}/deck/:slug`}
            component={
              param === "search" ? DeckSearch : param === "new" ? NewDeck : Deck
            }
          />
          <Route
            exact
            path={`${HOME_DIR}/playtest/:slug`}
            component={param === "lobby" ? PlaytestLobby : Playtest}
          />

          <Route exact path={`${HOME_DIR}/user/:slug`} component={User} />
          <Route path={`${HOME_DIR}/card/:slug`} component={CardSearch} />
          <Route exact path={`${HOME_DIR}/login`} component={Login} />
          <Route exact path={`${HOME_DIR}/settings`} component={Settings} />
          <Route exact path={`${HOME_DIR}/combos`} component={Combos} />
          <Route>
            <Redirect to={`${HOME_DIR}/dash`} />
          </Route>
        </Switch>
      </ScrollToTop>
    )

    return (
      <div ref={wrapper} className="wrapper" style={{fontSize: scale + "%"}}>
        <Nav />
        <BGImg />
        <Notifications />
        <Modal />
        {routes}
        {useLocation().pathname.includes("/playtest") ? null : <Footer />}
      </div>
    )
  }
)
// <AdvancedCart />
