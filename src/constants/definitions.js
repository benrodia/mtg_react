export const HOME_DIR = '/reactmtg'
export const USER_DIR = '/user'


export const FORMATS = ['brawl','commander','duel','future','legacy','modern','oldschool','pauper','penny','standard','vintage','casual']

export const PHASES = ['untap','upkeep','draw','main1','combat','main2','end']


const size_mod = 3
export const CARD_SIZE = {
	w: 16*2.5*size_mod,
	h: 16*3.5*size_mod
}

export const ZONES = [
	'Library',
	'Hand',
	'Battlefield',
	'Graveyard',
	'Exile',
	'Command',
]


export const CARD_TYPES = [
	'Creature',
	'Instant',
	'Sorcery',
	'Artifact',
	'Enchantment',
	'Planeswalker',
	'Land'
]

export const COLORS = key =>{
const colors = [
	{
		name: 'White',
		symbol: 'W',
		basic: 'Plains'
	},
	{
		name: 'Blue',
		symbol: 'U',
		basic: 'Island'
	},
	{
		name: 'Black',
		symbol: 'B',
		basic: 'Swamp'
	},
	{
		name: 'Red',
		symbol: 'R',
		basic: 'Mountain'
	},
	{
		name: 'Green',
		symbol: 'G',
		basic: 'Forest'
	},
	{
		name: 'Colorless',
		symbol: 'C',
		basic: 'Wastes'
	},
]
	return key!==undefined && colors[0][key]!==undefined
	?colors.map(c=>c[key]) 
	:colors
} 


export const RARITY_COLOR = {
	common: '#000000',
	uncommon: '#879795',
	rare: '#B9974E',
	mythic: '#F34800',
}

export const SINGLETON = format => format === 'commander' || format === 'brawl'