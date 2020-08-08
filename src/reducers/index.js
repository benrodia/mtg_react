import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import main from './main'
import deck from './deck'
import settings from './settings'
import filters from './filters'
import playtest from './playtest'
import * as A from '../constants/actionNames'

export default combineReducers({
	main,
	deck,
	settings,
	filters,
	playtest,
})
