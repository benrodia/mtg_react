// Constants
import store from "../store"
import * as A from "./types"

import utilities from "../utilities"

const {cache} = utilities

export const changeFilters = (key, val) => dispatch => {
	cache(A.FILTERS, key, val, true)
	dispatch({type: A.FILTERS, key, val})
}

export const changeAdvanced = assign => dispatch => {
	const {advanced} = store.getState().filters
	assign.terms = assign.terms.unique("id")
	dispatch(changeFilters("advanced", {...advanced, ...assign}))
}
// export const viewUser = user => dispatch => {
// 	dispatch({type: A.FILTERS, key: "viewUser", val: user})
// }
