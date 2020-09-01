import React, {useEffect} from "react"
import {Route, Redirect, Switch} from "react-router-dom"
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

const {HOME_DIR, DECK_ID, rnd} = utilities
export default connect(
  ({main: {page, cardData, legalCards, tokens}, deck: {format}, settings: {scale, randomPlaymat, randomSleeves}}) => {
    return {page, cardData, legalCards, tokens, format, scale, randomSleeves, randomPlaymat}
  },
  actions
)(
  ({
    page,
    cardData,
    legalCards,
    scale,
    randomSleeves,
    randomPlaymat,
    format,
    tokens,
    loadAppData,
    getLegalCards,
    getTokens,
    changeSettings,
    getDecks,
  }) => {
    useEffect(
      _ => {
        if (cardData.length) {
          !tokens.length && getTokens(cardData)
          !legalCards.length && getLegalCards(cardData, format)
          getDecks()

          const randImg = _ =>
            rnd(cardData.map(c => c.highres_image && c.image_uris && c.image_uris.art_crop).filter(c => !!c))
          randomPlaymat && changeSettings("playmat", randImg())
          randomSleeves && changeSettings("sleeves", randImg())
        } else loadAppData()
      },
      [cardData]
    )

    const routes = (
      <Switch>
        <Route exact path={HOME_DIR}>
          <Dash />
          <Footer />
        </Route>
        <Route exact path={`${HOME_DIR}/deck/:slug`}>
          <Deck />
          <Footer />
        </Route>
        <Route exact path={`${HOME_DIR}/deck/:slug/playtest`}>
          <Playtest />
        </Route>
        <Route exact path={`${HOME_DIR}/user/:slug`}>
          <User />
          <Footer />
        </Route>
        <Route>
          <Redirect to={HOME_DIR} />
        </Route>
      </Switch>
    )

    return (
      <>
        <div className="wrapper" style={{fontSize: scale + "%"}}>
          <Nav />
          <BGImg />
          <Notifications />
          <Modal />
          {cardData.length ? routes : <Loading full message="Loading card data..." />}
        </div>
      </>
    )
  }
)
