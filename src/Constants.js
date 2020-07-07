export const BOARDS = [ 
	"Main",
	"Side",
	"Maybe",
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

export const BASIC_LANDS = [
	'Plains',
	'Island',
	'Swamp',
	'Mountain',
	'Forest',
	'Wastes',
]

const size_mod = 3

export const CARD_SIZE = {
	w: 16*2.5*size_mod,
	h: 16*3.5*size_mod
}


export const FILTER_TERMS = [
	{
		name: "Type",
		prop: "type_line",
		vals: CARD_TYPES
	},
	{
		name: "CMC",
		prop: "cmc",
	},
	{
		name: "Artist",
		prop: "artist",
	},
	{
		name: "Set",
		prop: "set_name",
	},
	{
		name: "Color",
		prop: "colors",
	},
	{
		name: "Frame",
		prop: "frame",
	},
	{
		name: "Rarity",
		prop: "rarity",
		vals: [
		'mythic',
		'rare',
		'uncommon',
		'common',
		]
	},
]


function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); })
  return images
}

export const CARD_SLEEVES = importAll(require.context('../public/images/sleeves', false, /\.(png|jpe?g|svg)$/))
