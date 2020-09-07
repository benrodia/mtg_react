import * as A from "../actions/types"
import {INIT_DECK_STATE} from "../constants/initialState"

export default function deck(deck = INIT_DECK_STATE, {type, val}) {
	switch (type) {
		case A.DECK:
			return {...deck, ...val}
		default:
			return deck
	}
}
