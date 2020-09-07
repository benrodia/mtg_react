import store from "../store"
import axios from "axios"
import slugify from "slugify"
import uniqueSlug from "unique-slug"

import {INIT_DECK_STATE, INIT_SETTINGS_STATE} from "../constants/initialState"
import {expandDeckData, collapseDeckData} from "./receiveCards"

export async function getDecks(flags = [], params = {}) {
	const decks = await axios.get("/api/decks", {params}).then(res => res.data)
	return decks
}

export const canEdit = author => {
	const {auth, deck} = store.getState()
	return auth.isAuthenticated && author ? auth.user._id === author : auth.user._id === deck.author
}

export const canSuggest = _ => {
	const {
		deck: {author, helpWanted},
		auth: {user, isAuthenticated},
	} = store.getState()
	return (isAuthenticated && user._id !== author && helpWanted > 1) || (helpWanted === 1 && areFriends(author))
}
export const areFriends = _id => {
	const {
		auth: {user},
	} = store.getState()

	return user.followed.includes(_id) && creator(_id).followed.includes(user._id)
}

export const creator = _id => {
	const {
		deck: {author},
		main: {users},
	} = store.getState()

	return _id ? users.filter(u => u._id === _id)[0] : users.filter(u => u._id === author)[0] || {}
}

export const config = getState => {
	// console.log("getState().auth.token", getState().auth.token)
	const config = {
		headers: {
			"Content-type": "application/json",
			"x-auth-token": (getState && getState().auth.token) || undefined,
		},
	}
	return config
}

export const createSlug = (name = "", from) => {
	if (name && name.length) {
		const named = slugify(name, {
			replacement: "-",
			strict: true,
			locale: "en",
		})
		const existing = from ? from.filter(f => f.slug === named).length : 0
		return !existing ? named : named + "-" + existing
	} else return uniqueSlug()
}

export const resetCache = _ => {
	localStorage.setItem("settings", INIT_SETTINGS_STATE)
	localStorage.setItem("deck", INIT_DECK_STATE)
	localStorage.removeItem("user")
}

export const testEmail = (email = "") => {
	const regex = RegExp(
		"^[a-z0-9][-_.+!#$%&'*/=?^`{|]{0,1}([a-z0-9][-_.+!#$%&'*/=?^`{|]{0,1})*[a-z0-9]@[a-z0-9][-.]{0,1}([a-z][-.]{0,1})*[a-z0-9].[a-z0-9]{1,}([.-]{0,1}[a-z]){0,}[a-z0-9]{0,}$"
	)
	return regex.test(email)
}

export const testPassword = (password = "") =>
	RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&]{8,}").test(password)
