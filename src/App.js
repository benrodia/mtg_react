import React,{useEffect} from 'react'
import ReactDOM from 'react-dom'
import {Route, Redirect, Switch} from 'react-router-dom'
import {connect} from 'react-redux'
import * as actions from './actionCreators'
import {HOME_DIR} from './constants/definitions'

//Components
import Nav from './components/Nav'
import BGImg from './components/BGImg'
import Notifications from './components/Notifications'
import Modal from './components/Modal'
import Loading from './components/Loading'

import Page_User from './components/Page_User'
import Page_Builder from './components/Page_Builder'
import Page_Tester from './components/Page_Tester'


function App(props) { 
  const {cardData,legalCards,scale,format,tokens,loadAppData,getLegalCards,getTokens} = props

  useEffect(_=>loadAppData(),[])
  useEffect(_=>{if(cardData.length && !legalCards.length) getLegalCards(cardData,format)},[cardData])
  useEffect(_=>{if(cardData.length && !tokens.length) getTokens(cardData)},[cardData])

  const routes = 
    <Switch>
      <Route exact path={HOME_DIR}><Redirect to={`${HOME_DIR}/build`} /></Route>
      <Route exact path={`${HOME_DIR}/user`} component={Page_User}/>
      <Route exact path={`${HOME_DIR}/build`} component={Page_Builder}/>
      <Route exact path={`${HOME_DIR}/test`} component={Page_Tester}/>
      <Route component={_=><Loading anim={'none'} message={'Sorry, No Page Here'}/>}/>
    </Switch>

  return (
    <div className="wrapper" style={{fontSize:scale+"%"}}>
      <Nav/>
      <BGImg/>
      <Notifications/>
      <Modal/> 
      {cardData.length ? routes : <Loading message='Loading card data...'/>}
    </div>
  )
}

const select = state => {
  return {
    cardData: state.main.cardData,
    legalCards: state.main.legalCards,
    tokens: state.main.tokens,
    format: state.deck.format,
    scale: state.settings.scale,
  }
}

export default connect(select,actions)(App)