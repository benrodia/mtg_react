import * as definitions from "./constants/definitions"
import * as data from "./constants/data"
import * as greps from "./constants/greps"
import * as initialState from "./constants/initialState"
import * as cardFunctions from "./functions/cardFunctions"
import * as attack from "./functions/attack"
import * as apiHelpers from "./functions/apiHelpers"
import * as gameLogic from "./functions/gameLogic"
import * as payMana from "./functions/payMana"
import * as text from "./functions/text"
import * as utility from "./functions/utility"
import * as receiveCards from "./functions/receiveCards"

const utilities = {
	...definitions,
	...data,
	...greps,
	...initialState,
	...cardFunctions,
	...apiHelpers,
	...attack,
	...gameLogic,
	...payMana,
	...text,
	...utility,
	...receiveCards,
}

export default utilities
