import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect,Switch } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {v4 as uuidv4} from  'uuid'

import PropTypes from 'prop-types'

import {HOME_DIR,COLORS,SINGLETON} from './constants/definitions'
import {
  DEFAULT_SETTINGS,
  DEFAULT_DECKINFO,
  DEFAULT_FILTERS,
  CARD_SLEEVES,
  PLAYMATS
} from './constants/data_objects'
//Styles
import './styles/css/styles.css'
import './styles/css/mana.css'
import './styles/css/icons.css'


//Functions
import {Q,isLegal,audit} from './functions/cardFunctions'
import {chooseCommander,legalCommanders} from './functions/gameLogic'
import './functions/utility'

//Components
import Nav from './components/Nav'
import Notifications from './components/Notifications'
import Modal from './components/Modal'
import Loading from './components/Loading'

import Page_User from './components/Page_User'
import Page_Builder from './components/Page_Builder'
import Page_Tester from './components/Page_Tester'


export default class App extends React.Component {  
  componentDidMount() {
    this.fetchAPI('cardData',"https://api.scryfall.com/bulk-data/unique_artwork")
    this.fetchAPI('sets',"https://api.scryfall.com/sets")
  }
  
  constructor(props) {
  	super(props)
  	this.state = {
      settings: localStorage.getItem('settings') ? 
      JSON.parse(localStorage.getItem('settings')) : DEFAULT_SETTINGS,
      deckInfo: localStorage.getItem('deckInfo') ? 
      JSON.parse(localStorage.getItem('deckInfo')) : DEFAULT_DECKINFO,
      filters: localStorage.getItem('filters') ? 
      JSON.parse(localStorage.getItem('filters')) : DEFAULT_FILTERS,
      pages: [
        {component: Page_User, name: 'User', path: `${HOME_DIR}/user`},
        {component: Page_Builder, name: 'Build', path: `${HOME_DIR}/build`},
        {component: Page_Tester, name: 'Test', path: `${HOME_DIR}/test`},
      ],
      cardData: [],
      legalCards: [],
      tokens: [],
      noteLog:[],
      modal: null,
    }

    this.fetchAPI = this.fetchAPI.bind(this)
    this.findLegalCards = this.findLegalCards.bind(this)
    
    this.changeState = this.changeState.bind(this)
    this.addCard = this.addCard.bind(this)
    
    this.openModal = this.openModal.bind(this)
    this.newMsg = this.newMsg.bind(this)
  }

  render() {
    return <div className="wrapper" style={{fontSize:this.state.settings.scale+"%"}}>
      <div className="bg-img"><div className="playmat" style={{backgroundImage: "url('"+this.state.settings.playmat+"')"}}/></div>
        <Notifications home={'/build'} noteLog={this.state.noteLog} newMsg={this.newMsg}/>
        <Modal openModal={this.openModal}>{this.state.modal}</Modal>
        {!this.state.cardData.length
        ?<Loading message='Loading card data...'/>
        :<BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <Nav {...this.state}/>
          <Switch>
            <Route exact path={HOME_DIR}><Redirect to={`${HOME_DIR}/build`} /></Route>
            {this.state.pages.map(R=>
              <Route exact key={R.name} path={R.path}>
                <R.component 
                {...this.state} 
                changeState={this.changeState}
                openModal={this.openModal}
                newMsg={this.newMsg}
                addCard={this.addCard}
                />  
              </Route>
            )}
            <Route component={_=><Loading anim={'none'} message={'Sorry, No Page Here'}/>}/>
          </Switch>
        </DndProvider>
        </BrowserRouter>
        }
      </div>
  }

  fetchAPI(key,uri) {
    fetch(uri)
      .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
      .then(data=>{
        if (data.data) {this.setState({[key]:data.data})}
        else fetch(data.download_uri)
          .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
          .then(data=>{
            this.setState({[key]:data})
            if (key==='cardData') {
              this.findLegalCards(data,this.state.deckInfo.format)
              this.setState({tokens: Q(this.state.cardData,'type_line','Token')})
            }
          })
      })    
  }
  changeState(state,key,val) {
    let update = {...this.state[state]}
    if (key==='format' && val!== update.format) {
      this.findLegalCards(this.state.cardData,val) 
      if (!SINGLETON(val)) update.list = update.list.filter(c=>c.board!=='Command')
    }
    else if (key==='list') {
      update.colors = getColorIdentity(Q(update.list,'board','Main'),'colors')
      update.color_identity = getColorIdentity(Q(update.list,'board','Command'),'color_identity')     
      val = val.sort((a,b)=>a.name>b.name?1:-1)
    }
    if (key==='clear'&&window.confirm(`Clear ${state}?`)) update = 
      state==='deckInfo'? DEFAULT_DECKINFO:
      state==='settings'? DEFAULT_SETTINGS:
      state==='filters'? DEFAULT_FILTERS:{}

    else update[key] = val
    this.setState({[state]: update})
    cache(state,update)
  }

  addCard(card,board,remove) {
    console.log('addCard',card,board,remove)
    let list = [...this.state.deckInfo.list]
    if(!audit(card)) return null
    const existing = list.filter(c=>c.name===card.name)

     if(!existing.length||(!remove && (1+existing.length)<=isLegal(card,this.state.deckInfo.format))) {
      list = [...list,{...card,
        board: board||'Main',
        customField: existing[0]&&existing[0].customField||'unsorted',
        key: legalCommanders(this.state.deckInfo.format,this.state.legalCards).filter(c=>c.name===card.name)[0]
        ? "CommanderID__"+uuidv4()
        : "CardID__"+uuidv4()
      }]
    } 
    else if (remove) list = list.filter(c=>c.key!==card.key)       
    this.changeState('deckInfo','list',list)
  }




  newMsg(message,type) {
    this.setState({noteLog: [{
        key: type + Math.random(),
        message: message,
        type: type
      },...this.state.noteLog.slice(0,3),
    ]})
  }

  openModal(target) {this.setState({modal: target})}


  findLegalCards(cards,format) {
    const legal = cards.filter(c=>isLegal(c,format,null)>0)
    this.newMsg(legal.length +" cards legal in "+ format,'success')
    this.setState({legalCards:legal})
  }

}

function cache(key,val) {localStorage.setItem(key,JSON.stringify(val))}


function getColorIdentity(list,key) {
  let colors = []
  for (var i = 0; i < list.length; i++) {
    if (list[i][key]) {
      for (var j = 0; j < list[i][key].length; j++) {
        if (!colors.includes(list[i][key][j])) colors.push(list[i][key][j])
      }
    }
  }
  return colors
}