import * as A from "../actions/types"
import {INIT_SETTINGS_STATE} from "../constants/initialState"

export default function settings(settings = INIT_SETTINGS_STATE, {type, key, val}) {
	switch (type) {
		case A.SETTINGS:
			return {...settings, [key]: val}
		case A.SETTINGS_ALL:
			return {...settings, ...val}
		default:
			return settings
	}
}
