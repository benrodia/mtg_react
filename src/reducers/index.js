import { combineReducers } from 'redux'

import main from './main'
import deck from './deck'
import settings from './settings'
import filters from './filters'
import playtest from './playtest'

export default combineReducers({
	main,
	deck,
	settings,
	filters,
	playtest,
})
