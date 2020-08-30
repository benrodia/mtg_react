import React from "react"
import * as definitions from "./constants/definitions"
import * as data from "./constants/data"
import * as greps from "./constants/greps"
import * as initialState from "./constants/initialState"
import * as cardFunctions from "./functions/cardFunctions"
import * as attack from "./functions/attack"
import * as gameLogic from "./functions/gameLogic"
import * as payMana from "./functions/payMana"
import * as text from "./functions/text"
import * as utility from "./functions/utility"
import * as recieveCards from "./functions/recieveCards"

const utilities = {
	...definitions,
	...data,
	...greps,
	...initialState,
	...cardFunctions,
	...attack,
	...gameLogic,
	...payMana,
	...text,
	...utility,
	...recieveCards,
}

export default utilities
