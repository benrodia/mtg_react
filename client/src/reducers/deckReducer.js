import * as A from "../actions/types"
import {INIT_DECK_STATE} from "../constants/initialState"

export default function deck(deck = INIT_DECK_STATE, {type, val}) {
	switch (type) {
		case A.DECK:
			return {...deck, ...val, changes: true}
		case A.SAVE_DECK:
			return {...deck, changes: false}
		default:
			return deck
	}
}
