import axios from "axios"
import * as A from "./types"
import {newMsg, setPage, getDecks, getUsers} from "./mainActions"
import utilities from "../utilities"

const {cache, collapseDeckData, INIT_DECK_STATE, config, createSlug, testEmail, testPassword} = utilities

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
	const slug = createSlug(name, getState().main.users)
	if (!testEmail(email)) return dispatch(newMsg("Please enter a valid email address.", "error"))
	if (!testPassword(password)) return dispatch(newMsg("Choose a stronger password.", "error"))
	axios
		.post("/api/users", {name, email, password, slug}, config())
		.then(res => {
			dispatch(newMsg(`Nice to meet you, ${res.data.user.name}!`))
			dispatch({
				type: A.REGISTER_SUCCESS,
				val: res.data,
			})
		})
		.catch(err => {
			dispatch(newMsg(err.response.data.msg, "warning"))
			dispatch(returnErrors(err.response.data, err.response.status, "REGISTER_FAIL"))
			dispatch({type: A.REGISTER_FAIL})
		})
}

export const login = ({email, password}) => dispatch => {
	axios
		.post("/api/auth", JSON.stringify({email, password}), config())
		.then(res => {
			dispatch(newMsg(`Welcome back, ${res.data.user.name}!`))
			dispatch({
				type: A.LOGIN_SUCCESS,
				val: res.data,
			})
		})
		.catch(err => {
			dispatch(newMsg(err.response.data, "warning"))
			dispatch(returnErrors(err.response.data, err.response.status, "REGISTER_FAIL"))
			dispatch({type: A.LOGIN_FAIL})
		})
}

export const logout = _ => dispatch => {
	dispatch(newMsg("Seeya later!"))
	dispatch({type: A.LOGOUT_SUCCESS})
}

export const returnErrors = (msg, status, id) => dispatch => {
	return {
		type: A.GET_ERRORS,
		val: {msg, status, id},
	}
}
export const clearErrors = _ => dispatch => {
	return {type: A.CLEAR_ERRORS}
}

export const updateUser = (_id, {name, password, email}) => (dispatch, getState) => {
	let data = {}
	if (name) {
		data.name = name
		data.slug = createSlug(name, getState().main.users)
	}
	if (password) data.password = password
	if (email) data.email = email
	axios
		.patch(`/api/users/${_id}`, data)
		.then(res => {
			dispatch(newMsg(`UPDATED USER`))
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
