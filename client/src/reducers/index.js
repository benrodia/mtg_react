import {combineReducers} from "redux"
import auth from "./authReducer"
import main from "./mainReducer"
import deck from "./deckReducer"
import settings from "./settingsReducer"
import filters from "./filtersReducer"
import playtest from "./playtestReducer"

export default combineReducers({
	auth,
	main,
	deck,
	settings,
	filters,
	playtest,
})
