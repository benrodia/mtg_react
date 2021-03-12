import * as A from "../actions/types"
import {INIT_DECK_STATE} from "../constants/initialState"
import {mapColors} from "../functions/cardFunctions"

export default function deck(deck = INIT_DECK_STATE, {type, val, clear}) {
	switch (type) {
		case A.DECK:
			return clear ? INIT_DECK_STATE : {...deck, ...val}
		case A.SAVE_DECK:
			return {
				...deck,
				...val,
				unsaved: {},
				colors: mapColors(deck.list),
			}
		default:
			return deck
	}
}
