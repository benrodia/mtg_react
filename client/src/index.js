import React from 'react'
import ReactDOM from 'react-dom'
import {Provider,connect} from 'react-redux'
import { BrowserRouter, Route, Redirect,Switch } from 'react-router-dom'
import store from "./store"
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

//Styles
import './styles/css/styles.css'
import './styles/css/mana.css'
import './styles/css/icons.css'



import App from './App'


ReactDOM.render(
  <React.StrictMode>
  	<Provider store={store}>
	  <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
    	  <App/>
	    </DndProvider>
	  </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

