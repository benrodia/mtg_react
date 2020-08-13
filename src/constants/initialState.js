import {v4 as uuidv4} from  'uuid'
import * as A from './actionNames'
import {COLORS} from './definitions'
import {SINGLETON} from './greps'
import {CARD_SLEEVES,PLAYMATS} from './data'
import recieveCards from '../functions/recieveCards'

export const INIT_SETTINGS_STATE = {
	userName: 'User',
	scale: 100,
	subtitle: true,
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
	view: 'list',
	sortBy: 'Type',
	...Object.assign(...COLORS('symbol').map(s=>({[s]: true}))),
	all:false,
	only:false,
	keys: ['name'],
	types: [],
	customFields: []
}

export const INIT_MAIN_STATE = {
	cardData: [],
	legalCards: [],
	sets: [],
	tokens: [],
	noteLog:[],
	modal: null,
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


const loadCache = (obj,init) => Object.assign({...init},
	// {}
	JSON.parse(localStorage.getItem(obj)||'{}')
	)

const initialState = {
	main: INIT_MAIN_STATE,
	settings: loadCache(A.SETTINGS,INIT_SETTINGS_STATE),
	deck: loadCache(A.DECK,INIT_DECK_STATE),
	filters: loadCache(A.FILTERS,INIT_FILTERS_STATE),
	playtest: INIT_PLAYTEST_STATE([],null,0)
}

export default initialState