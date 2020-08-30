import axios from "axios"
import * as A from "./types"

import {newMsg, openModal, setPage} from "./mainActions"
import utilities from "../utilities"

const {cache, expandDeckData, collapseDeckData, INIT_DECK_STATE} = utilities

export const loadUser = _ => (dispatch, getState) => {
	dispatch({type: A.USER_LOADING})

	axios
		.get("/auth/user", tokenConfig(getState))
		.then(res =>
			dispatch({
				type: A.USER_LOADED,
				val: res.data,
			})
		)
		.catch(err => {
			dispatch(newMsg(err.response.data))
			dispatch(returnErrors(err.response.data, err.response.status))
			dispatch({type: A.AUTH_ERROR})
		})
}

export const register = ({name, email, password}) => dispatch => {
	const config = {
		headers: {
			"Content-type": "application/json",
		},
	}

	axios
		.post("/api/users", JSON.stringify({name, email, password}), config)
		.then(res => {
			dispatch(newMsg(`Nice to meet you, ${res.data.name}!`))
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
	const config = {
		headers: {
			"Content-type": "application/json",
		},
	}
	axios
		.post("/api/auth", JSON.stringify({email, password}), config)
		.then(res => {
			console.log("SUCCESS", res)
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

export const tokenConfig = getState => {
	console.log("getState().auth.token", getState().auth.token)
	const config = {
		headers: {
			"Content-type": "application/json",
		},
	}
	const token = getState().auth.token
	if (token) config["x-auth-token"] = token
	return config
}

export const updateUserName = (_id, name = "") => dispatch => {
	// VALIDATE USERNAME AND GET NEW SLUG
	axios
		.put(`/api/users/${_id}`, {name})
		.then(res => console.log(res.data))
		.catch(err => console.error(err))
}

export const updateUserPassword = (_id, password = "") => {
	// VALIDATE PASSWORD
	axios
		.put(`/api/users/${_id}`, {password})
		.then(res => console.log(res.data))
		.catch(err => console.error(err))
}

export const openDeck = deck => (dispatch, getState) => {
	console.log("openDeck", deck)
	dispatch({type: A.DECK, val: {...deck, list: expandDeckData(deck.list, getState().main.cardData)}})
}

export const canEdit = _id => (dispatch, getState) => getState().auth.isAuthenticated && getState().auth._id === _id

export const updateDeck = deck => {
	axios
		.put(`/api/decks/${deck._id}`, {...deck, list: collapseDeckData(deck.list), updated: Date.now})
		.then(res => console.log(res.data))
		.catch(err => console.error(err))
}

export const newDeck = author => dispatch => {
	axios
		.post(`/api/decks`, {author})
		.then(res => {
			dispatch(getDecks())
			dispatch(openDeck(res.data))
		})
		.catch(err => console.error("COULD NOT CREATE DECK", err))
}

export const cloneDeck = _ => (dispatch, getState) => {
	const author = getState().auth.user._id
	const {name, format, list} = getState().deck
	axios
		.post(`/api/decks`, {name, format, list, author, desc: "Cloned Deck"})
		.then(res => {
			dispatch(getDecks())
			dispatch(openDeck(res.data))
		})
		.catch(err => console.error("COULD NOT CLONE DECK", err))
}

export const deleteDeck = _id => (dispatch, getState) => {
	if (window.confirm("Delete Deck?")) {
		axios.delete(`/api/decks/${_id}`).then(res => dispatch(getDecks()))
		cache(A.DECK, "all", INIT_DECK_STATE)
		dispatch({type: A.DECK, val: INIT_DECK_STATE})
		dispatch(newMsg("DELETED DECK"))
		dispatch(setPage("Dash"))
	}
}

export const getDecks = _ => dispatch => {
	axios
		.get("/api/decks")
		.then(res => dispatch({type: A.MAIN, key: "decks", val: res.data}))
		.catch(err => console.error(err))
}
