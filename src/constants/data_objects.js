import {v4 as uuidv4} from  'uuid'
import {CARD_TYPES,COLORS,SINGLETON} from './definitions'

function importAll(r) {
  let images = {}
  r.keys().map(item => { images[item.replace('./', '')] = r(item) })
  return images
}


export const ItemTypes = {
	CARD: 'CARD',
	COMMANDER: 'COMMANDER'
}

export const CARD_SLEEVES = importAll(require.context('../../public/images/sleeves', false, /\.(png|jpe?g|svg)$/))
export const PLAYMATS = importAll(require.context('../../public/images/playmats', false, /\.(png|jpe?g|svg)$/))

export const NUMBER_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
export const SPECIAL_SYMBOLS = [
'0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','100','1000000',
'w','u','b','r','g','x','y','z','p','wp','up','bp','rp','gp','s','c','e',
'wu','wb','rw','gw','2w','ub','ur','wu','gu','2u','br','bg','wb','ub','2b','rw','rg','ur','br','2r','gw','gu','bg','rg','2g','2w','2u','2b','2r','2g',
'energy','tap','untap','tap-alt','chaos','1-2','infinity',
'artifact','creature','enchantment','instant','land','planeswalker','sorcery','multiple',
'loyalty-up','loyalty-down','loyalty-zero','loyalty-start','flashback','dfc-night','dfc-day','dfc-ignite','dfc-spark','dfc-emrakul','dfc-moon','dfc-enchantment','power','toughness','artist-brush','artist-nib',
'guild-azorius','guild-boros','guild-dimir','guild-golgari','guild-gruul','guild-izzet','guild-orzhov','guild-rakdos','guild-selesnya','guild-simic',
'clan-abzan','clan-jeskai','clan-mardu','clan-sultai','clan-temur','clan-atarka','clan-dromoka','clan-kolaghan','clan-ojutai','clan-silumgar',
'polis-setessa','polis-akros','polis-meletis',
]

export const DEFAULT_SETTINGS = {
	userName: 'User',
	scale: 100,
	subtitle: true,
	manaTolerance: 3,//0-3
	gameLog: true,
	sleeves: Object.values(CARD_SLEEVES)[0],
	playmat: Object.values(PLAYMATS)[0],
}

export const DEFAULT_DECKINFO = {
	key: uuidv4(),
	name:'New Deck',
	format: 'casual',
	desc:"",
	list:[],
	colors: [],
	color_identity: [],
}

export const INIT_GAME_STATE = format => {return {
    deck: [],
    life: SINGLETON(format)?40:20,
    eLife: SINGLETON(format)?40:20,
    poison: 0,
    turn: 0,
    mana: COLORS().map(C=>0),
    phase: 'untap',
    look: 0,
    reveal: false,
}}

export const DEFAULT_FILTERS = {
	...Object.assign(...COLORS('symbol').map(s=>({[s]: true}))),
	all:false,
	only:false,
	keys: ['name','oracle_text'],
	types: [],
	customFields: []
}


export const FILTER_TERMS = [
	{
		name: "Type",
		key: "type_line",
		vals: CARD_TYPES
	},
	{
		name: "Custom",
		key: "customField",
		other: 'unsorted'
	},
	{
		name: "CMC",
		key: "cmc",
		vals: [...Array(20)].map((a,i)=>i),
		valNames: NUMBER_WORDS.map(n=>n+" drop"),
	},
	{
		name: "Color",
		key: "colors",
		vals: COLORS('symbol'),
		valNames: COLORS('name'),
		other: 'multicolor'
	},
	{
		name: "Price (USD)",
		key: "prices",
		subKey: 'usd',
		vals: [2,10,50,100,500,10000],
		valNames: ['bulk','moderate','valuable','expensive','sends a message','filthy blood money'],
		other: 'missing USD price',
	},
	{
		name: "Price (TIX)",
		key: "prices",
		subKey: 'tix',
		vals: [2,10,50,100,500,10000],
		valNames: ['bulk','moderate','valuable','expensive','sends a message','filthy blood money'],
		other: 'missing TIX price',
	},
	{
		name: "Artist",
		key: "artist",
	},
	{
		name: "Set",
		key: "set_name",
	},
	{
		name: "Frame",
		key: "frame",
	},
	{
		name: "Rarity",
		key: "rarity",
		vals: [
		'mythic',
		'rare',
		'uncommon',
		'common',
		]
	},
]



export const EXAMPLE_DECK_NAMES = [
	"Timmy's BIG Surprise",
	"Roon's War Crimes",
	"Kaput",
	"Septa",
	"Something Clever",
	"Lord of Shit Mountain",
	"Johnny Cash Money"
]

export const EXAMPLE_DECK_DESCS = [
	"I'm a new and impressionable deck that needs guidance and a good description.",
	"Hey there, I'm new in town.",
	"This is my dumb stupid aggro deck. Here's how it works:\n T3: AAAAAAAAAAHHH!",
	"T1 swamp, T2 swamp, T3 swamp, T4 swamp, T5 swamp Sidisi, T6 swamp ad naus dark sphere rit sickening dreams GG",
	"Just gonna leave this here...",
	"This list comes to you shamelessly copied and pasted from a more talented deck builder"
]
export const COUNTERS = [
	"PlusOne",
	"Loyalty",
	"Fade",
	"Deathtouch",
	"Double strike",
	"Flying",
	"Hexproof",
	"Indestrucible",
	"Level",
	"Lifelink",
	"Menace",
	"Poison",
	"Quest",
	"Reach",
	"Time",
	"Trample",
	"Vigilance",
	"Acorn",
	"Age",
	"Aim",
	"Arrow",
	"Arrowhead",
	"Awakening",
	"Blaze",
	"Blood",
	"Bounty",
	"Bribery",
	"Brick",
	"Cage",
	"Carrion",
	"Charge",
	"Coin",
	"CRANK!",
	"Credit",
	"Corpse",
	"Crystal",
	"Cube",
	"Currency",
	"Death",
	"Delay",
	"Depletion",
	"Despair",
	"Devotion",
	"Divinity",
	"Doom",
	"Dream",
	"Echo",
	"Egg",
	"Elixir",
	"Energy",
	"Eon",
	"Experience",
	"Eyeball",
	"Eyestalk",
	"Fate",
	"Feather",
	"Fetch",
	"Filibuster",
	"First strike",
	"Flood",
	"Fungus",
	"Fuse",
	"Gem",
	"Glyph",
	"Gold",
	"Growth",
	"Hatchling",
	"Healing",
	"Hit",
	"Hoofprint",
	"Hour",
	"Hourglass",
	"Hunger",
	"Ice",
	"Incubation",
	"Infection",
	"Intervention",
	"Isolation",
	"Javelin",
	"Ki",
	"Knowledge",
	"Lore",
	"Luck",
	"Magnet",
	"Manabond",
	"Manifestation",
	"Mannequin",
	"Mask",
	"Matrix",
	"Mine",
	"Mining",
	"Mire",
	"Music",
	"Muster",
	"Net",
	"Omen",
	"Ore",
	"Page",
	"Pain",
	"Paralyzation",
	"Petal",
	"Petrification",
	"Phylactery",
	"Pin",
	"Plague",
	"Polyp",
	"Pressure",
	"Prey",
	"Pupa",
	"Rust",
	"Scream",
	"Shell",
	"Shield",
	"Silver",
	"Shred",
	"Sleep",
	"Sleight",
	"Slime",
	"Slumber",
	"Soot",
	"Soul",
	"Spark",
	"Spore",
	"Storage",
	"Strife",
	"Study",
	"Task",
	"Theft",
	"Tide",
	"Tower",
	"Training",
	"Trap",
	"Treasure",
	"Velocity",
	"Verse",
	"Vitality",
	"Volatile",
	"Wage",
	"Winch",
	"Wind",
	"Wish",
]