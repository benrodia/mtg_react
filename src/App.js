import React,{useEffect} from 'react'
import {Route, Redirect, Switch} from 'react-router-dom'
import {connect} from 'react-redux'
import * as actions from './actionCreators'
import utilities from './utilities'

import Nav from './components/Nav'
import BGImg from './components/BGImg'
import Notifications from './components/Notifications'
import Modal from './components/Modal'
import Loading from './components/Loading'
import Page_Builder from './components/Page_Builder'
import Page_Tester from './components/Page_Tester'


const {HOME_DIR} = utilities

export default connect(({
  main:{cardData,legalCards,tokens},
  deck:{format},
  settings:{scale}
})=>{return {cardData,legalCards,tokens,format,scale}},actions)
(({
  cardData,
  legalCards,
  scale,
  format,
  tokens,
  loadAppData,
  getLegalCards,
  getTokens
})=> { 

  useEffect(_=>{
    if(cardData.length) {
      !tokens.length && getTokens(cardData)
      !legalCards.length && getLegalCards(cardData,format)
    } 
    else loadAppData()
  },[cardData])

  const routes = 
    <Switch>
      <Route exact path={HOME_DIR}><Redirect to={`${HOME_DIR}/build`} /></Route>
      <Route exact path={`${HOME_DIR}/build`} component={Page_Builder}/>
      <Route exact path={`${HOME_DIR}/test`} component={Page_Tester}/>
      <Route component={_=><Loading anim={'none'} message={'Sorry, No Page Here'}/>}/>
    </Switch>

  return <div className="wrapper" style={{fontSize:scale+"%"}}>
      <Nav/>
      <BGImg/>
      <Notifications/>
      <Modal/> 
      {cardData.length 
        ? routes 
        : <Loading full message='Loading card data...'/>
      }
    </div>
})


