import axios from "axios"
import * as A from "./types"
import {newMsg, setPage, getDecks, getUsers} from "./mainActions"
import {changeSettings} from "./settingsActions"
import utilities from "../utilities"

const {
	cache,
	collapseDeckData,
	INIT_DECK_STATE,
	config,
	createSlug,
	testEmail,
	badPassword,
	rnd,
	getArt,
	creator,
} = utilities

export const loadUser = _ => (dispatch, getState) => {
	dispatch({type: A.USER_LOADING})

	axios
		.get("/auth/user", config(getState))
		.then(res =>
			dispatch({
				type: A.USER_LOADED,
				val: res.data,
			})
		)
		.catch(err => {
			console.error(err.response)
			dispatch({type: A.AUTH_ERROR})
		})
}

export const register = ({name, email, password}) => (dispatch, getState) => {
	if (!testEmail(email))
		return dispatch(newMsg("Please enter a valid email address.", "error"))
	if (!!badPassword(password))
		return dispatch(newMsg("Password Fail: " + badPassword(password), "error"))
	else {
		const {users, cardData} = getState().main
		const slug = createSlug(name, users)
		const image = rnd(getArt(cardData, {type_line: "Planeswalker"}))
		axios
			.post("/api/users", {name, email, password, slug, image}, config())
			.then(res => {
				dispatch(newMsg(`Nice to meet you, ${res.data.user.name}!`))
				dispatch({
					type: A.REGISTER_SUCCESS,
					val: res.data,
				})
				dispatch(getUsers())
			})
			.catch(err => {
				dispatch(newMsg(err.response.data.msg, "warning"))
				dispatch(
					returnErrors(err.response.data, err.response.status, "REGISTER_FAIL")
				)
				dispatch({type: A.REGISTER_FAIL})
			})
	}
}

export const login = ({email, password}) => dispatch => {
	axios
		.post("/api/auth", {email, password}, config())
		.then(res => {
			dispatch(newMsg(`Welcome back, ${res.data.user.name}!`))
			dispatch({
				type: A.LOGIN_SUCCESS,
				val: res.data,
			})
			dispatch(updateUser({last_login: new Date()}))
			dispatch(changeSettings("all", res.data.user.settings))
		})
		.catch(err => {
			dispatch(newMsg(err.response.data, "warning"))
			dispatch(
				returnErrors(err.response.data, err.response.status, "REGISTER_FAIL")
			)
			dispatch({type: A.LOGIN_FAIL})
		})
}

export const logout = _ => dispatch => dispatch({type: A.LOGOUT_SUCCESS})

export const returnErrors = (msg, status, id) => dispatch => {
	return {
		type: A.GET_ERRORS,
		val: {msg, status, id},
	}
}
export const clearErrors = _ => dispatch => {
	return {type: A.CLEAR_ERRORS}
}

export const updateUser = (data = {}) => (dispatch, getState) => {
	const {
		auth: {
			user: {_id},
		},
	} = getState()
	axios
		.patch(`/api/users/${_id}`, data)
		.then(res => {
			console.log("updateUser", _id, data)
			dispatch({type: A.UPDATE_USER, val: data})
			dispatch(getUsers())
		})
		.catch(err => console.error(err))
}

export const deleteAccount = _ => (dispatch, getState) => {
	const {
		auth: {
			user: {_id, name},
		},
		main: {decks},
	} = getState()

	axios
		.delete(`/api/users/${_id}`, config(getState))
		.then(res => {
			dispatch(getUsers())
			dispatch(logout())
			dispatch(newMsg(`Farewell, ${name}`))
			const decksToDel = decks.filter(d => d.author === _id)
			for (var i = 0; i < decksToDel.length; i++) {
				axios.delete(`/api/decks/${decksToDel[i]._id}`, config(getState))
			}
		})
		.catch(err => console.error(err))
}

export const followUser = (_id, block) => (dispatch, getState) => {
	const {user} = getState().auth
	let followed = user.followed
	if (!followed.includes(_id) && !creator(_id).blocked.includes(user._id)) {
		followed = [...followed, _id]
		dispatch(newMsg(`Followed ${creator(_id).name}`, "success"))
	} else {
		followed = followed.filter(f => f !== _id)
		dispatch(newMsg(`Unfollowed ${creator(_id).name}`))
	}
	dispatch(updateUser({followed}))
}
