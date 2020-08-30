import * as A from "../actions/types"
import {INIT_FILTERS_STATE} from "../constants/initialState"

export default function filters(filters = INIT_FILTERS_STATE, action) {
	const {type, obj, key, val} = action
	switch (type) {
		case A.FILTERS:
			return {...filters, [key]: val}
		default:
			return filters
	}
}
