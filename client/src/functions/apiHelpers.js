import store from "../store"
import axios from "axios"
import slugify from "slugify"
import uniqueSlug from "unique-slug"
import * as A from "../actions/types"
import {INIT_DECK_STATE, INIT_SETTINGS_STATE} from "../constants/initialState"
import {SINGLETON} from "../constants/greps"
import {isLegal} from "./cardFunctions"
import {itemizeDeckList} from "./receiveCards"
import {titleCaps} from "./text"

export async function getDecks(flags = [], params = {}) {
	const decks = await axios.get("/api/decks", {params}).then(res => res.data)
	return decks
}

export const canEdit = owner => {
	const {
		auth: {user, isAuthenticated},
		deck: {author},
	} = store.getState()

	return isAuthenticated && owner ? user._id === owner : user._id === author
}

export const canSuggest = _ => {
	const {
		deck: {author, allow_suggestions},
		auth: {user, isAuthenticated},
	} = store.getState()
	return (
		(isAuthenticated && user._id !== author && allow_suggestions > 1) ||
		(allow_suggestions === 1 && areFriends(author))
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

	return (
		(_id
			? users.find(u => u._id === _id)
			: users.find(u => u._id === author)) || {failed: true}
	)
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
			lower: true,
			locale: "en",
		})
		const existing = from ? from.filter(f => f.slug === named).length : 0
		return !existing ? named : named + "-" + existing
	} else return uniqueSlug()
}

export const resetCache = _ => {
	console.log("resetCache")
	localStorage.removeItem(A.SETTINGS)
	sessionStorage.removeItem(A.SETTINGS)
	localStorage.removeItem(A.FILTERS)
	sessionStorage.removeItem(A.FILTERS)
	localStorage.removeItem(A.DECK)
	sessionStorage.removeItem(A.DECK)
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

export const completeness = ({list, format, name, desc}) => {
	const main = list.filter(c => c.board === "Main")
	const coms = list.filter(c => c.commander)
	const iden = coms.length
		? coms
				.unique("color_identity")
				.map(c => c.color_identity)
				.flat()
		: null
	console.log("iden", iden)
	const legalled = itemizeDeckList(list)
		.map(it => {
			const num = isLegal(it[0], format, iden && !iden.length ? ["C"] : iden)
			if (num < it.length) return `${it.length - num} ${it[0].name}`
			return null
		})
		.filter(l => !!l)

	const checklist = [
		{
			l: "Named deck",
			v: name.length > 3,
			f: "Name too short",
		},
		{
			l: "Chose commander(s)",
			v: coms.length,
			f: "Pick a commander!",
			s: !SINGLETON(format),
		},
		{
			l: "Legal number of cards",
			v:
				main.length >= (SINGLETON(format) ? 100 : 60) &&
				main.length <= (SINGLETON(format) ? 100 : 999),
			f: `${titleCaps(format)} decks must have ${
				SINGLETON(format) ? "exactly" : "at least"
			} ${SINGLETON(format) ? 100 : 60} cards, you have ${main.length}`,
		},
		{
			l: "All cards legal",
			v: !legalled.length,
			f: `Contains illegal cards/quantities, remove:
          ${legalled}`,
		},
		{
			l: "Added description",
			v: `${desc}`.trim().split(" ").length >= 10,
			f: "C'mon, be a little more descriptive! (10+ words)",
		},
	]
	return checklist
}
