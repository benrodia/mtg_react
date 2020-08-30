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
import Page_Dash from "./components/Page_Dash"
import Page_User from "./components/Page_User"
import Page_Builder from "./components/Page_Builder"
import Page_Tester from "./components/Page_Tester"

const {HOME_DIR, DECK_ID, rnd} = utilities
export default connect(
  ({
    auth,
    main: {page, cardData, legalCards, tokens},
    deck: {format},
    settings: {scale, randomPlaymat, randomSleeves},
  }) => {
    return {auth, page, cardData, legalCards, tokens, format, scale, randomSleeves, randomPlaymat}
  },
  actions
)(
  ({
    auth,
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
  }) => {
    useEffect(
      _ => {
        if (cardData.length) {
          !tokens.length && getTokens(cardData)
          !legalCards.length && getLegalCards(cardData, format)

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
        <Route exact path={HOME_DIR} component={Page_Dash} />
        <Route path={`${HOME_DIR}/build`} component={Page_Builder} />
        <Route path={`${HOME_DIR}/test`} component={Page_Tester} />
        <Route path={`${HOME_DIR}/user`} component={Page_User} />
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
        {page === "Test" ? null : <Footer />}
      </>
    )
  }
)
