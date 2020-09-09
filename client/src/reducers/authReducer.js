import * as A from "../actions/types"
import {INIT_AUTH_STATE} from "../constants/initialState"

export default function auth(auth = INIT_AUTH_STATE, {type, key, val}) {
	switch (type) {
		case A.USER:
			return {...auth, user: {...auth.user, [key]: val}}
		case A.USER_LOADING:
			return {...auth, isLoading: true}
		case A.USER_LOADED:
			return {...auth, isLoading: false, isAuthenticated: true, user: val}
		case A.LOGIN_SUCCESS:
		case A.REGISTER_SUCCESS:
			localStorage.setItem("user", JSON.stringify(val.user))
			localStorage.setItem("token", val.token)
			return {...auth, ...val, isLoading: false, isAuthenticated: true}
		case A.AUTH_ERROR:
		case A.LOGIN_FAIL:
		case A.LOGOUT_SUCCESS:
		case A.REGISTER_FAIL:
			localStorage.removeItem("token")
			localStorage.removeItem("user")
			return {...INIT_AUTH_STATE, user: {}, token: null, isAuthenticated: false}

		case A.GET_ERRORS:
			return {...auth, errors: val}
		case A.CLEAR_ERRORS:
			return {...auth, errors: INIT_AUTH_STATE.errors}
		case A.UPDATE_USER:
			return {...auth, user: {...auth.user, ...val}}
		default:
			return auth
	}
}
