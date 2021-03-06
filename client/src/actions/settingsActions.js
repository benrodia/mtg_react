import * as A from "./types"

import {INIT_SETTINGS_STATE} from "../constants/initialState"

import {cache} from "../functions/utility"

export const changeSettings = (key, val) => dispatch => {
	if (key === "clear" && window.confirm("Revert to Default Settings?")) {
		cache(A.SETTINGS, "all", INIT_SETTINGS_STATE)
		dispatch({type: A.SETTINGS_ALL, val: INIT_SETTINGS_STATE})
	}
	if (key === "all") {
		cache(A.SETTINGS, "all", INIT_SETTINGS_STATE)
		dispatch({type: A.SETTINGS_ALL, val})
	} else {
		cache(A.SETTINGS, key, val)
		dispatch({type: A.SETTINGS, key, val})
	}
}
