import {DECK} from '../constants/actionNames'
import {INIT_DECK_STATE} from '../constants/initialState'


export default function deck(deck = INIT_DECK_STATE, action) {
	const {type,obj,key,val} = action
	switch (type) {
		case DECK: return val
		default: return deck
	}
}
