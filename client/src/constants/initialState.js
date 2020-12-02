import {v4 as uuidv4} from "uuid"
import * as A from "../actions/types"
import {COLORS, MAIN_BOARD} from "./definitions"
import {SINGLETON} from "./greps"
import {CARD_SLEEVES, PLAYMATS} from "./data"
import {loadCache} from "../functions/utility"
import {prepForPlaytest} from "../functions/receiveCards"

export const INIT_MAIN_STATE = {
	cardData: [],
	legalCards: [],
	sets: [],
	tokens: [],
	decks: [],
	users: [],
	noteLog: [],
	modal: null,
}

export const INIT_SETTINGS_STATE = {
	scale: 100,
	darken: 40,
	game_log: true,
	playmat: Object.values(PLAYMATS)[0],
	random_playmat: true,
	use_stack: ["Action", "Spell", "Activated Ability", "Triggered Ability"],
	mana_tolerance: 3,
}

export const INIT_AUTH_STATE = {
	token: localStorage.getItem("token"),
	isAuthenticated: !!localStorage.getItem("token"),
	isLoading: true,
	user: loadCache("user", {
		settings: INIT_SETTINGS_STATE,
	}),
	errors: {
		msg: {},
		status: null,
		id: null,
	},
}

export const INIT_DECK_STATE = {
	name: "Untitled",
	format: "casual",
	desc: "",
	list: [],
	preChanges: [],
	colors: [0, 0, 0, 0, 0, 1],
	editing: false,
}

// console.log("INIT_DECK_STATE", INIT_DECK_STATE)

export const INIT_FILTERS_STATE = {
	board: MAIN_BOARD,
	view: "list",
	sortBy: "Type",
	customFields: [],
	focus: {},
	showPrice: false,
	basic: {
		by: "name",
		asc: false,
	},
	advanced: {
		interested: [],
		terms: [],
		by: "name",
		asc: false,
		nameEntry: "",
	},
	deckFilters: [],
	deckParams: [],
}

export const INIT_PLAYTEST_STATE = (list, format, num) => {
	return {
		number: num || 0,
		size: {cols: 1, rows: 1},
		deck: prepForPlaytest(list || []),
		life: SINGLETON(format) ? 40 : 20,
		eLife: SINGLETON(format) ? 40 : 20,
		poison: 0,
		ePoison: 0,
		turn: 0,
		mana: COLORS().map(C => 0),
		phase: "Beginning",
		look: 0,
		reveal: false,
		hideHand: false,
		history: [],
		current: 0,
		stack: [],
	}
}

const initialState = {
	auth: INIT_AUTH_STATE,
	main: INIT_MAIN_STATE,
	deck: loadCache(A.DECK, INIT_DECK_STATE),
	settings: loadCache(A.SETTINGS, INIT_SETTINGS_STATE),
	filters: loadCache(A.FILTERS, INIT_FILTERS_STATE),
	playtest: INIT_PLAYTEST_STATE([], null, 0),
}

export default initialState
