import React, {useEffect} from "react"
import {Route, Redirect, Switch, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import actions from "./actions"
import utilities from "./utilities"

import Nav from "./components/Nav"
import BGImg from "./components/BGImg"
import Notifications from "./components/Notifications"
import Modal from "./components/Modal"
import Loading from "./components/Loading"
import Footer from "./components/Footer"
import Dash from "./components/_Page_Dash"
import User from "./components/_Page_User"
import Deck from "./components/_Page_Deck"
import Playtest from "./components/_Page_Playtest"

const {HOME_DIR, DECK_ID, rnd, getArt} = utilities
export default connect(
  ({
    main: {modal, legalCards, tokens, refresh},
    deck: {format},
    settings: {scale, random_playmat, playmat},
  }) => {
    return {
      modal,
      legalCards,
      tokens,
      refresh,
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
    legalCards,
    refresh,
    scale,
    random_playmat,
    playmat,
    format,
    tokens,
    loadAppData,
    getLegalCards,
    getTokens,
    changeSettings,
    loadUser,
    loadDecks,
    getCardData,
    getSetData,
    getUsers,
  }) => {
    useEffect(_ => {
      random_playmat && getArt().then(art => changeSettings("playmat", art))
      loadDecks()
      getUsers()
      getSetData()
    }, [])
    const {pathname} = useLocation()

    console.log("playmat", playmat)
    const routes = (
      <Switch>
        <Route exact path={HOME_DIR}>
          <Dash />
        </Route>
        <Route exact path={`${HOME_DIR}/deck/:slug`}>
          <Deck />
        </Route>
        <Route exact path={`${HOME_DIR}/deck/:slug/playtest`}>
          <Playtest />
        </Route>
        <Route exact path={`${HOME_DIR}/user/:slug`}>
          <User />
        </Route>
        <Route>
          <Redirect to={HOME_DIR} />
        </Route>
      </Switch>
    )

    return (
      <>
        <div
          className="wrapper"
          style={{fontSize: scale + "%", overflowY: modal && "hidden"}}>
          <Nav />
          <BGImg />
          <Notifications />
          <Modal />
          {routes}
        </div>
        {pathname.includes("playtest") ? null : <Footer />}
      </>
    )
  }
)
