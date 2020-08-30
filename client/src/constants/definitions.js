export const HOME_DIR = "/reactmtg"
export const PROXY = ``
// export const PROXY = `https://localhost:5000/`

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
export const CARD_TYPES = [CREATURE, INSTANT, SORCERY, ARTIFACT, ENCHANTMENT, PLANESWALKER, LAND]

export const MAIN_BOARD = "Main"
export const SIDE_BOARD = "Side"
export const MAYBE_BOARD = "Maybe"
export const BOARDS = [MAIN_BOARD, SIDE_BOARD, MAYBE_BOARD]

const size_mod = 3
export const CARD_SIZE = {
	w: 16 * 2.5 * size_mod,
	h: 16 * 3.5 * size_mod,
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
			fill: "#E8795B",
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
	return key !== undefined && colors[0][key] !== undefined ? colors.map(c => c[key]) : colors
}
