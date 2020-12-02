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

import DeckNav from "./components/DeckNav"
import Dash from "./components/_Page_Dash"
import User from "./components/_Page_User"
import View from "./components/_Page_Deck_View"
import Build from "./components/_Page_Deck_Build"
import Playtest from "./components/_Page_Deck_Playtest"

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
    screenSize,
  }) => {
    const wrapper = useRef(0)

    useEffect(
      _ => {
        if (wrapper.current) {
          console.log(wrapper.current)
          screenSize(wrapper.current.clientWidth)
        }
      },
      [wrapper.current]
    )

    useEffect(_ => {
      random_playmat && getArt().then(art => changeSettings("playmat", art))
      loadDecks()
      getUsers()
      getSetData()
    }, [])

    const routes = (
      <Switch>
        <Route exact path={HOME_DIR} component={Dash} />
        <Route exact path={`${HOME_DIR}/advanced`} component={Build} />
        <Route path={`${HOME_DIR}/deck`}>
          <Route exact path={`${HOME_DIR}/deck/:slug`} component={View} />
          <Route
            exact
            path={`${HOME_DIR}/deck/:slug/playtest`}
            component={Playtest}
          />
        </Route>

        <Route exact path={`${HOME_DIR}/user/:slug`} component={User} />
        <Route>
          <Redirect to={HOME_DIR} />
        </Route>
      </Switch>
    )

    return (
      <>
        <div
          ref={wrapper}
          className="wrapper"
          style={{fontSize: scale + "%", overflowY: modal && "hidden"}}>
          <Nav />
          <BGImg />
          <Notifications />
          <Modal />
          {routes}
        </div>
        {useLocation().pathname.includes("playtest") ? null : <Footer />}
      </>
    )
  }
)
