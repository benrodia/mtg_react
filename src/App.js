import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

//Styles
import Styles from './styles/css/styles.css'
import ManaSymbols from './styles/css/mana.css'

//Functions
import {isLegal} from './functions/cardFunctions'
import './functions/math'

//Components
import Nav from './components/Nav'
import Notifications from './components/Notifications'
import Modal from './components/Modal'

import DeckInfo from './components/DeckInfo'
import DeckBuilder from './components/DeckBuilder'
import DeckTester from './components/DeckTester'





export default class App extends React.Component {
  
  componentDidMount() {this.loadCardData()}
  
  constructor(props) {
  	super(props)
  	this.state = {
      deckInfo: localStorage.getItem('cachedDeckInfo') ? 
      JSON.parse(localStorage.getItem('cachedDeckInfo')) : 
      {
        name:'New Deck',
        desc:"",
        format: 'casual',
        list:[]
      },
      pages: [
        {component: DeckInfo, name: 'Info', path: '/info'},
        {component: DeckBuilder, name: 'Build', path: '/build'},
        {component: DeckTester, name: 'Test', path: '/test'},
      ],
      cardData: [],
      legalCards: [],
      noteLog:[],
      modal: null,
    }

    this.loadCardData = this.loadCardData.bind(this)
    this.findLegalCards = this.findLegalCards.bind(this)
    this.changeDeck = this.changeDeck.bind(this)
    this.openModal = this.openModal.bind(this)
    this.newMsg = this.newMsg.bind(this)
  }

  render() {
    return (
      <div className="wrapper">
        <Notifications noteLog={this.state.noteLog} newMsg={this.newMsg}/>
        <Modal openModal={this.openModal}>{this.state.modal}</Modal>
        <BrowserRouter>
        <DndProvider backend={HTML5Backend}>

          <Nav {...this.state}/>
          {this.state.pages.map(R=>{
            return (
              <Route key={R.name} path={R.path}>
                <R.component 
                    {...this.state} 
                    changeDeck={this.changeDeck}
                    openModal={this.openModal}
                    newMsg={this.newMsg}
                />
              </Route>
            )
          })}
        </DndProvider>
        </BrowserRouter>
      </div>
    )
  }


  loadCardData() {
    this.newMsg('Loading MtG Card Data...','info')

    return fetch("https://api.scryfall.com/bulk-data")
      .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
      .then(uri=>{
        const newURI = uri.data[1].download_uri // unique art only
        fetch(newURI)
          .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
          .then(data=>{
                this.newMsg(data.length+" cards loaded!",'success')
                console.log('it loaded',data)
                this.setState({cardData:data})
                this.findLegalCards(data,this.state.deckInfo.format)
          }).catch('loadFail')
      }).catch('loadFail')    
  }

  changeDeck(prop,val) {
    let update = {...this.state.deckInfo}
    if (prop==='format' && val!== this.state.deckInfo.format) this.findLegalCards(this.state.cardData,val) 
    if (prop==='list') val = val.sort((a,b)=>a.name>b.name?1:-1)
    update[prop] = val
    this.setState({deckInfo: update})
    cacheDeckInfo(update)
  }

  newMsg(message,type) {
    this.setState({noteLog: [
      {
        key: type + Math.random(),
        message: message,
        type: type
      },
      ...this.state.noteLog.slice(0,3),
    ]})
  }

  openModal(target) {
    console.log('openModal',target)
    this.setState({modal: target})
  }


  findLegalCards(cards,format) {
    let legal = cards.filter(c=>isLegal(c,format))
    this.newMsg(legal.length +" cards legal in "+ format,'success')
    this.setState({legalCards:legal})
  }

}


function cacheDeckInfo(deckInfo) {
  localStorage.setItem('cachedDeckInfo',JSON.stringify(deckInfo)) 
}


