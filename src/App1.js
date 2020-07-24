import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect,Switch } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {v4 as uuidv4} from  'uuid'

import PropTypes from 'prop-types'

import {HOME_DIR,USER_DIR,COLORS,SINGLETON} from './constants/definitions'
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
import UserDash from './components/UserDash'
import HomePage from './components/HomePage'
import Nav from './components/Nav'
import Notifications from './components/Notifications'
import Modal from './components/Modal'
import Loading from './components/Loading'



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
      filters: localStorage.getItem('filters') ? 
      JSON.parse(localStorage.getItem('filters')) : DEFAULT_FILTERS,
      deckData: localStorage.getItem('deckData') ? 
      JSON.parse(localStorage.getItem('deckData')) : [DEFAULT_DECKINFO],
      activeDeck: 0,
      pages: [
        {component: HomePage, name: 'Home', path: `${HOME_DIR}/`},
        {component: UserDash, name: 'User', path: `${USER_DIR}/`},
      ],
      cardData: [],
      legalCards: [],
      tokens: [],
      noteLog: [],
      modal: null,
    }

    this.fetchAPI = this.fetchAPI.bind(this)    
    this.openModal = this.openModal.bind(this)
    this.newMsg = this.newMsg.bind(this)
  }

  render() {
    return <div className="wrapper" style={{fontSize:this.state.settings.scale+"%"}}>
      <div className="bg-img"><div className="playmat" style={{backgroundImage: "url('"+this.state.settings.playmat+"')"}}/></div>
        <Notifications home={'/build'} noteLog={this.state.noteLog} newMsg={this.newMsg}/>
        <Modal openModal={this.openModal}>{this.state.modal}</Modal>
        <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <Nav deckInfo={this.state.deckData[this.state.activeDeck]} {...this.state}/>
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
              this.setState({tokens: Q(this.state.cardData,'type_line','Token')})
            }
          })
      })    
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

}

function cache(key,val) {localStorage.setItem(key,JSON.stringify(val))}
