import {v4 as uuidv4} from  'uuid'
import {COLORS,SINGLETON} from './definitions'
import {CARD_SLEEVES,PLAYMATS} from './data_objects'
import {prepCardsForTest} from '../functions/cardFunctions'

export const INIT_SETTINGS_STATE = {
	userName: 'User',
	scale: 100,
	subtitle: true,
	manaTolerance: 3,//0-3
	gameLog: true,
	sleeves: Object.values(CARD_SLEEVES)[0],
	playmat: Object.values(PLAYMATS)[0],
	useStack: 1
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
    deck: prepCardsForTest(list||[]),
    life: SINGLETON(format)?40:20,
    eLife: SINGLETON(format)?40:20,
    poison: 0,
    turn: 0,
    mana: COLORS().map(C=>0),
    phase: 'untap',
    look: 0,
    reveal: false,
    history: [],
    future: [],
    stack: [],
}}


const initialState = {
	main: INIT_MAIN_STATE,
	settings: JSON.parse(localStorage.getItem('settings')) || INIT_SETTINGS_STATE,
	deck: JSON.parse(localStorage.getItem('deck')) || INIT_DECK_STATE,
	filters: !JSON.parse(localStorage.getItem('filters')) || INIT_FILTERS_STATE,
	playtest: INIT_PLAYTEST_STATE([],null,0)
}
export default initialState