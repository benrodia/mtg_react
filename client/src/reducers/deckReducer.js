import * as A from "../actions/types"
import {INIT_DECK_STATE} from "../constants/initialState"

export default function deck(deck = INIT_DECK_STATE, action) {
	const {type, obj, key, val} = action
	switch (type) {
		case A.DECK:
			return {...deck, ...val}
		default:
			return deck
	}
}
