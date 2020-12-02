import * as A from "../actions/types"
import {INIT_DECK_STATE} from "../constants/initialState"

export default function deck(deck = INIT_DECK_STATE, {type, val, clear}) {
	switch (type) {
		case A.DECK:
			return clear ? INIT_DECK_STATE : {...deck, ...val}
		case A.SAVE_DECK:
			return {
				...deck,
				...val,
				unsaved: false,
				preChanges: deck.list,
				updated: val,
			}
		default:
			return deck
	}
}
