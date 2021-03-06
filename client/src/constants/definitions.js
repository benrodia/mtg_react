export const HOME_DIR = "/"
export const PROXY = ``
export const BREAKPOINTS = [
	600, //mobile
	1200, //tablet
	1800, //laptop
	2400, //desktop
	3000, //tv
]

export const LIBRARY = "Library"
export const HAND = "Hand"
export const BATTLEFIELD = "Battlefield"
export const GRAVEYARD = "Graveyard"
export const EXILE = "Exile"
export const COMMAND = "Command"
export const ZONES = [LIBRARY, HAND, BATTLEFIELD, GRAVEYARD, EXILE, COMMAND]

export const UNTAP = "Untap"
export const UPKEEP = "Upkeep"
export const DRAW = "Draw"
export const MAIN_ONE = "Main One"
export const COMBAT = "Combat"
export const MAIN_TWO = "Main Two"
export const END = "End"
export const PHASES = [UNTAP, UPKEEP, DRAW, MAIN_ONE, COMBAT, MAIN_TWO, END]

export const CREATURE = "Creature"
export const INSTANT = "Instant"
export const SORCERY = "Sorcery"
export const ARTIFACT = "Artifact"
export const ENCHANTMENT = "Enchantment"
export const PLANESWALKER = "Planeswalker"
export const LAND = "Land"
export const CARD_TYPES = [
	CREATURE,
	INSTANT,
	SORCERY,
	ARTIFACT,
	ENCHANTMENT,
	PLANESWALKER,
	LAND,
]

export const MAIN_BOARD = "Main"
export const SIDE_BOARD = "Side"
export const MAYBE_BOARD = "Maybe"
export const BOARDS = [MAIN_BOARD, SIDE_BOARD, MAYBE_BOARD]

// const size_mod = 3
// export const CARD_SIZE = {
// 	w: 16 * 2.5 * size_mod,
// 	h: 16 * 3.5 * size_mod,
// }
export const CARD_SIZE = {
	w: 100,
	h: 140,
}

export const RARITY_COLOR = {
	common: "#000000",
	uncommon: "#879795",
	rare: "#B9974E",
	mythic: "#F34800",
}

export const COLORS = key => {
	const colors = [
		{
			name: "White",
			symbol: "W",
			basic: "Plains",
			fill: "#F0F0E6",
		},
		{
			name: "Blue",
			symbol: "U",
			basic: "Island",
			fill: "#64B8ED",
		},
		{
			name: "Black",
			symbol: "B",
			basic: "Swamp",
			fill: "#2A1630",
		},
		{
			name: "Red",
			symbol: "R",
			basic: "Mountain",
			fill: "#e34c3b",
		},
		{
			name: "Green",
			symbol: "G",
			basic: "Forest",
			fill: "#6CB572",
		},
		{
			name: "Colorless",
			symbol: "C",
			basic: "Wastes",
			fill: "#888899",
		},
	]
	return key !== undefined && colors[0][key] !== undefined
		? colors.map(c => c[key])
		: colors
}

export const cardScriptTemp = [
	{
		cost: [{tap: true, sac: true, mana: "{2}{W}"}],
		select: {
			amt: 1,
			min: 0,
			of: {
				zone: ["Battlefield"],
				type_line: ["creature"],
				controller: "opponent",
				owner: null,
				colors: [],
				power: {val: 4, op: ">="},
				toughness: {val: null, op: null},
				cmc: {val: null, op: null},
			},
			and: "exile",
		},
	},
]
