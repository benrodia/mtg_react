import * as auth from "./authActions"
import * as main from "./mainActions"
import * as deck from "./deckActions"
import * as settings from "./settingsActions"
import * as filters from "./filtersActions"
import * as playtest from "./playtestActions"

const actions = {
	...auth,
	...main,
	...deck,
	...settings,
	...filters,
	...playtest,
}
export default actions
