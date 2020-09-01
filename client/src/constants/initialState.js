import {v4 as uuidv4} from "uuid"
import * as A from "../actions/types"
import {COLORS, MAIN_BOARD} from "./definitions"
import {SINGLETON} from "./greps"
import {CARD_SLEEVES, PLAYMATS} from "./data"
import {loadCache} from "../functions/utility"
import {receiveCards} from "../functions/receiveCards"

export const INIT_AUTH_STATE = {
	token: localStorage.getItem("token"),
	isAuthenticated: !!localStorage.getItem("token"),
	isLoading: true,
	user: loadCache("user", {}),
	errors: {
		msg: {},
		status: null,
		id: null,
	},
}

export const INIT_MAIN_STATE = {
	cardData: [],
	legalCards: [],
	sets: [],
	tokens: [],
	decks: [],
	users: [],
	noteLog: [],
	modal: null,
	page: "Dash",
}

export const INIT_SETTINGS_STATE = {
	scale: 100,
	showSubTitle: true,
	gameLog: true,
	sleeves: Object.values(CARD_SLEEVES)[0],
	randomSleeves: true,
	playmat: Object.values(PLAYMATS)[0],
	randomPlaymat: true,
	stacktions: ["Action", "Spell", "Activated Ability", "Triggered Ability"],
	useStack: [],
	manaTolerance: 3,
}

export const INIT_DECK_STATE = {
	name: "New Deck",
	format: "casual",
	desc: "",
	list: [],
	changes: false,
}

export const INIT_FILTERS_STATE = {
	board: MAIN_BOARD,
	view: "list",
	sortBy: "Type",
	customFields: [],
	focus: {},
	basic: {
		by: "name",
	},
	advanced: {
		colors: COLORS("symbol").map(s => true),
		all: false,
		only: false,
		terms: [],
		searchBy: "oracle_text",
		cmc: 0,
		cmcOp: "any",
	},
	showIllegal: false,
	showTypes: false,
	showPrice: false,
	viewUser: {},
}

export const INIT_PLAYTEST_STATE = (list, format, num) => {
	return {
		number: num || 0,
		size: {cols: 1, rows: 1},
		deck: receiveCards(list || []),
		life: SINGLETON(format) ? 40 : 20,
		eLife: SINGLETON(format) ? 40 : 20,
		poison: 0,
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
	settings: loadCache(A.SETTINGS, INIT_SETTINGS_STATE),
	deck: loadCache(A.DECK, INIT_DECK_STATE),
	filters: loadCache(A.FILTERS, INIT_FILTERS_STATE, true),
	playtest: INIT_PLAYTEST_STATE([], null, 0),
}

export default initialState
