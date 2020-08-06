import * as A from '../constants/actionNames'
import {INIT_MAIN_STATE} from '../constants/initialState'


export default function main(main = INIT_MAIN_STATE, action) {
	const {type,obj,key,val} = action
	switch (type) {
		case A.MAIN: return {...main,[key]:val}
		case A.NEW_MSG: return {...main, noteLog: [val,...main.noteLog.slice(0,3)]}		
		default: return main
	}
}

