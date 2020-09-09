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
  ({main: {modal, cardData, legalCards, tokens, refresh}, deck: {format}, settings: {scale, random_playmat}}) => {
    return {modal, cardData, legalCards, tokens, refresh, format, scale, random_playmat}
  },
  actions
)(
  ({
    modal,
    cardData,
    legalCards,
    refresh,
    scale,
    random_playmat,
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
    useEffect(
      _ => {
        if (cardData.length) {
          !tokens.length && getTokens(cardData)
          !legalCards.length && getLegalCards(cardData, format)
          random_playmat && changeSettings("playmat", rnd(getArt(cardData)).image)
          loadDecks()
        } else {
          getCardData()
          getSetData()
          getUsers()
        }
      },
      [cardData]
    )
    const {pathname} = useLocation()

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
        <div className="wrapper" style={{fontSize: scale + "%", overflowY: modal && "hidden"}}>
          <Nav />
          <BGImg />
          <Notifications />
          <Modal />
          {cardData.length ? routes : <Loading full message="Loading card data..." />}
        </div>
        {pathname.includes("playtest") ? null : <Footer />}
      </>
    )
  }
)
