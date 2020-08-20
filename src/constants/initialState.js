import {v4 as uuidv4} from  'uuid'
import * as A from './actionNames'
import {COLORS,MAIN_BOARD} from './definitions'
import {SINGLETON} from './greps'
import {CARD_SLEEVES,PLAYMATS} from './data'
import recieveCards from '../functions/recieveCards'

export const INIT_SETTINGS_STATE = {
	userName: 'User',
	scale: 100,
	showSubTitle: true,
	gameLog: true,
	sleeves: Object.values(CARD_SLEEVES)[0],
	playmat: Object.values(PLAYMATS)[0],
	stacktions: ['Action','Spell','Activated Ability','Triggered Ability'],
	useStack: [],
	manaTolerance: 3,
	
}

export const INIT_DECK_STATE = {
	key: uuidv4(),
	name:'New Deck',
	format: 'casual',
	desc:"",
	list:[],
	colors: [],
	color_identity: [],
}

export const INIT_FILTERS_STATE = {
	board: MAIN_BOARD,
	view: 'list',
	sortBy: 'Type',
	customFields: [],
	focus: {key:null,val:null},
	advanced: {
		colors: COLORS('symbol').map(s=>true),
		all:false,
		only:false,
		terms: [],
		searchBy:'oracle_text',
		cmc: 0,
		cmcOp: 'any',
	},
	showIllegal: false,
	showTypes: false,
	showPrice: false,
}

export const INIT_MAIN_STATE = {
	cardData: [],
	legalCards: [],
	sets: [],
	tokens: [],
	noteLog:[],
	modal: null,
	page: 'Dash',
} 


export const INIT_PLAYTEST_STATE = (list,format,num) => {return {
    number: num||0,
    size: {cols:1,rows:1},
    deck: recieveCards(list||[]),
    life: SINGLETON(format)?40:20,
    eLife: SINGLETON(format)?40:20,
    poison: 0,
    turn: 0,
    mana: COLORS().map(C=>0),
    phase: 'Beginning',
    look: 0,
    reveal: false,
    history: [],
    current: 0,
    stack: [],
}}


const loadCache = (obj,init) => Object.assign({...init},JSON.parse(
	localStorage.getItem(obj)||
	'{}'
	))
const loadSession = (obj,init) => Object.assign({...init},JSON.parse(
	sessionStorage.getItem(obj)||
	'{}'
	))

const initialState = {
	main: INIT_MAIN_STATE,
	settings: loadCache(A.SETTINGS,INIT_SETTINGS_STATE),
	deck: loadCache(A.DECK,INIT_DECK_STATE),
	filters: loadSession(A.FILTERS,INIT_FILTERS_STATE),
	playtest: INIT_PLAYTEST_STATE([],null,0)
}

export default initialState