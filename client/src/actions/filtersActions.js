// Constants
import store from "../store"
import * as A from "./types"

import utilities from "../utilities"

const {cache} = utilities

export const changeFilters = (key, val) => dispatch => {
	cache(A.FILTERS, key, val)
	dispatch({type: A.FILTERS, key, val})
}

export const changeAdvanced = assign => dispatch => {
	const {advanced} = store.getState().filters
	const terms = assign.terms ? assign.terms.unique("id") : advanced.terms
	const interested = assign.interested
		? assign.interested.unique("id").slice(0, 150)
		: advanced.interested
	const newAdvanced = {
		...advanced,
		...assign,
		terms,
		interested,
	}

	dispatch(changeFilters("advanced", newAdvanced))
}
// export const viewUser = user => dispatch => {
// 	dispatch({type: A.FILTERS, key: "viewUser", val: user})
// }
