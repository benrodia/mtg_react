import * as A from "../actions/types"
import {INIT_SETTINGS_STATE} from "../constants/initialState"

export default function settings(settings = INIT_SETTINGS_STATE, action) {
	const {type, obj, key, val} = action
	switch (type) {
		case A.SETTINGS:
			return {...settings, [key]: val}
		default:
			return settings
	}
}
