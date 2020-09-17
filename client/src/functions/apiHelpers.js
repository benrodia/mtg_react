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

export const canEdit = _id => {
	const {
		auth: {user, isAuthenticated},
		deck: {author},
	} = store.getState()

	return isAuthenticated && _id ? user._id === _id : user._id === author
}

export const canSuggest = _ => {
	const {
		deck: {author, helpWanted},
		auth: {user, isAuthenticated},
	} = store.getState()
	return (
		(isAuthenticated && user._id !== author && helpWanted > 1) ||
		(helpWanted === 1 && areFriends(author))
	)
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

	return _id
		? users.filter(u => u._id === _id)[0]
		: users.filter(u => u._id === author)[0] || {}
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
	console.log("resetCache")
	// localStorage.removeItem("user")
	// localStorage.removeItem("token")
	localStorage.removeItem("settings")
	localStorage.removeItem("deck")
	setTimeout(_ => window.location.reload(), 500)
}

export const testEmail = (email = "") => {
	const regex = RegExp(
		"^[a-z0-9][-_.+!#$%&'*/=?^`{|]{0,1}([a-z0-9][-_.+!#$%&'*/=?^`{|]{0,1})*[a-z0-9]@[a-z0-9][-.]{0,1}([a-z][-.]{0,1})*[a-z0-9].[a-z0-9]{1,}([.-]{0,1}[a-z]){0,}[a-z0-9]{0,}$"
	)
	return regex.test(email)
}

export const badPassword = (password = "") => {
	return !RegExp("^(?=.{8,})").test(password)
		? "Too Short"
		: !RegExp("^(?=.*[a-z])").test(password)
		? "Needs a lower case letter"
		: !RegExp("^(?=.*[A-Z])").test(password)
		? "Needs a upper case letter"
		: !RegExp("^(?=.*[0-9])").test(password)
		? "Needs a number"
		: !RegExp("^(?=.*[!@#$%^&*-_().,/;:])").test(password)
		? "Needs a special character"
		: false

	RegExp(
		"^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&]{8,}"
	).test(password)
}
