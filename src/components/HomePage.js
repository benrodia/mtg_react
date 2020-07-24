import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect,Switch } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {v4 as uuidv4} from  'uuid'

import PropTypes from 'prop-types'

import {HOME_DIR,COLORS,SINGLETON} from '../constants/definitions'
import {
  DEFAULT_SETTINGS,
  DEFAULT_DECKINFO,
  DEFAULT_FILTERS,
  CARD_SLEEVES,
  PLAYMATS
} from '../constants/data_objects'

//Functions
import {Q,isLegal,audit} from '../functions/cardFunctions'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'
import '../functions/utility'

// COMPONENTS
import Nav from './Nav'
import Notifications from './Notifications'
import Modal from './Modal'
import Loading from './Loading'

import Page_User from './Page_User'
import Page_Builder from './Page_Builder'
import Page_Tester from './Page_Tester'


export default function HomePage(props) {  
  return null
}
