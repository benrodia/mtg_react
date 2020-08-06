import {SETTINGS} from '../constants/actionNames'
import {INIT_SETTINGS_STATE} from '../constants/initialState'


export default function settings(settings = INIT_SETTINGS_STATE, action) {
	const {type,obj,key,val} = action
	switch (type) {
		case SETTINGS: return val
		default: return settings
	}
}
