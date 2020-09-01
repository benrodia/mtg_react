import axios from "axios"
import * as A from "./types"
import {newMsg, setPage, getDecks} from "./mainActions"
import {openDeck} from "./deckActions"
import utilities from "../utilities"

const {cache, collapseDeckData, INIT_DECK_STATE, config, createSlug} = utilities

// export const loadUser = _ => (dispatch, getState) => {
// 	dispatch({type: A.USER_LOADING})

// 	axios
// 		.get("/auth/user", config(getState))
// 		.then(res =>
// 			dispatch({
// 				type: A.USER_LOADED,
// 				val: res.data,
// 			})
// 		)
// 		.catch(err => {
// 			dispatch(newMsg(err.response.data))
// 			dispatch(returnErrors(err.response.data, err.response.status))
// 			dispatch({type: A.AUTH_ERROR})
// 		})
// }

export const register = ({name, email, password}) => (dispatch, getState) => {
	const slug = createSlug(name, getState().main.users)
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

export const updateUser = (_id, data = {}) => (dispatch, getState) => {
	// VALIDATE USERNAME AND GET NEW SLUG
	axios
		.patch(`/api/users/${_id}`, config(getState), data)
		.then(res => console.log(res.data))
		.catch(err => console.error(err))
}

export const deleteUser = _id => (dispatch, getState) => {
	if (_id === getState().auth.user_id && window.confirm("Are you super duper sure you want to delete your account??")) {
		axios
			.patch(`/api/users/${_id}`, config(getState))
			.then(res => console.log(res.data))
			.catch(err => console.error(err))
	}
}

export const canEdit = author => (dispatch, getState) =>
	getState().auth.isAuthenticated && getState().auth.user._id === author

export const updateDeck = deck => {
	axios
		.patch(`/api/decks/${deck._id}`, {...deck, list: collapseDeckData(deck.list), updated: Date.now}, config())
		.then(res => {
			console.log(res.data)
			// dispatch(newMsg("SAVED DECK", "success"))
		})
		.catch(err => console.error(err))
}

export const newDeck = (author, {name, format, list}) => (dispatch, getState) => {
	if (author) {
		const slug = createSlug(name, getState().main.decks)
		axios
			.post(`/api/decks`, {author, name, format, list, slug})
			.then(res => {
				dispatch(newMsg("CREATED DECK", "success"))
				dispatch(getDecks())
				dispatch(openDeck(res.data))
			})
			.catch(err => console.error("COULD NOT CREATE DECK", err))
	}
}

export const cloneDeck = author => (dispatch, getState) => {
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
		axios
			.delete(`/api/decks/${_id}`, config(getState))
			.then(res => {
				dispatch(getDecks())
				cache(A.DECK, "all", INIT_DECK_STATE)
				dispatch({type: A.DECK, val: INIT_DECK_STATE})
				dispatch(newMsg("DELETED DECK"))
				dispatch(setPage("Dash"))
			})
			.catch(err => dispatch(newMsg("Problem deleting deck.", "error")))
	}
}
