import {Q} from "../functions/cardFunctions"
import {matchStr} from "../functions/utility"
import {COUNTERS, NUMBER_WORDS} from "./data"
import {COLORS, CARD_TYPES} from "./definitions"

let _

export const TOKEN_NAME = t => {
	const color =
		COLORS("name")[COLORS("symbol").indexOf(t.color_identity[0])] || "colorless"
	return !t.power
		? t.name
		: `${t.power}/${t.toughness} ${color.toLowerCase()} ${t.name}`
}
export const SINGLETON = format => format === "commander" || format === "brawl"

export const MANA = {
	source: card => !!Q(card, "oracle_text", ["{T}", "add "], true),
	any: card => !!Q(card, "oracle_text", ["mana", "of", "any"], true),
	amt: (card, co) =>
		((card.oracle_text || "").match(new RegExp(`{${co}}`, "g")) || []).length,
}

export const CAN_TAP = card =>
	card.zone === "Battlefield" &&
	!card.tapped &&
	(!Q(card, "type_line", "creature") ||
		Q(card, "oracle_text", "haste") ||
		!card.sickness)

export const DUAL_COMMANDER = [
	"name",
	[" and ", "triad", "sisters", "brothers", "ruric", "stangg"],
]
export const EXTRA_LAND_DROP = [
	"oracle_text",
	["you can play", "additional land"],
	true,
]
export const LAND_DROPS = deck =>
	1 +
	Q(
		deck.filter(c => c.zone === "Battlefield"),
		...EXTRA_LAND_DROP
	).length

export const TUTOR = types => {
	const type = types && Array.isArray(types) ? types : types ? [types] : [""]
	return ["oracle_text", ["search your library for", ...type, "shuffle"], true]
}

export const NUMBERS = [...Array(100)].map((_, i) => i)

export const NUM_FROM_WORD = (text, single) =>
	single && matchStr(text, [single])
		? 1
		: Math.max(
				0,
				NUMBER_WORDS.indexOf(NUMBER_WORDS.filter(N => matchStr(text, [N]))[0]),
				NUMBERS.indexOf(NUMBERS.filter(N => matchStr(text, [N]))[0])
		  )

export const BASIC_ABILITIES = (text = "") => {
	const m = (arr = [], single, all) =>
		matchStr(text, arr, all) ? NUM_FROM_WORD(text, single) : 0
	return {
		damage: m(["deal", "damage", "to", "target"], _, true),
		look: m(["look at the top", "reveal the top", "scry"], " the top card "),
		draw: m(["draw"], "a card"),
		mill: m(["mill"], "a card"),
		life:
			m(["you", "gain", "life"], _, true) ||
			-1 * m(["you", "lose", "life"], _, true),
		eLife:
			m(["opponent", "gains", "life"], _, true) ||
			-1 * m(["opponent", "lose", "life"], _, true) ||
			-1 * m(["player", "loses", "life"], _, true),
		token: m(["create", "token"], " a "),
	}
}

export const snippet = (text = "", start = "", end = ".") => {
	let snip,
		line = ""
	const lines = text.split("\n")
	for (let i = 0; i < lines.length; i++)
		if (matchStr(lines[i], [start, end], true)) {
			snip = (
				lines[i].slice(
					lines[i].indexOf(start) + start.length,
					lines[i].indexOf(end)
				) || ""
			).trim()
			line = lines[i]
			break
		}
	return {snip, line}
}

export const WHEN = (card = {}, phrase) => {
	const text = card.oracle_text || ""
	const src = card.name || ""
	const targets = snippet(text, "When", phrase).snip
	return {
		src,
		text: snippet(text, phrase).line,
		effect: BASIC_ABILITIES(snippet(text, phrase).snip),
		self: matchStr(targets, ["this", src]),
		youControl: matchStr(text, ["you", "control"], true),
		types: CARD_TYPES.filter(T => matchStr(targets, [T])),
	}
}

export const ENTERS_TAPPED = card =>
	matchStr(card.oracle_text, [`${card.name} enters the battlefield tapped`])

export const ENTERS_COUNTERS = card => {
	const counters = NUM_FROM_WORD(card.oracle_text, " a ")
	return counters && card.oracle_text.includes("counter")
		? {
				[COUNTERS.filter(C => matchStr(card.oracle_text, [C]))[0] ||
				"PlusOne"]: counters,
		  }
		: {}
}

export const FOR_EACH = (text = "", cards = [{type_line: "", zone: ""}]) => {
	let result = 0
	const check = [
		{grep: "you control", zone: "Battlefield"},
		{grep: "in your hand", zone: "Hand"},
		{grep: "in your graveyard", zone: "graveyard"},
	]
	for (var i = 0; i < check.length; i++) {
		const targets = snippet(text, "for each", check[i].grep).snip
		if (targets)
			result = cards.filter(
				c => c.zone === check[i].zone && matchStr(c.type_line, [targets])
			).length
		console.log("FOR_EACH", targets, result)
	}
	return result
}

export const NO_QUANT_LIMIT = (card = {}) =>
	Q(card, "name", COLORS("basic")) ||
	Q(card, "oracle_text", "A deck can have any number of cards named")

export const SAC_AS_COST = name => [
	"oracle_text",
	["sacrifice", name, ":"],
	true,
]

export const IS_SPELL = card =>
	card &&
	(card.zone === "Hand" || card.zone === "Command") &&
	!card.type_line.includes("Land")
export const IS_PERMANENT = card =>
	card && !Q(card, "type_line", ["instant", "sorcery"])
export const HAS_FLASH = card =>
	card &&
	(!!Q(card, "type_line", "instant") || !!Q(card, "oracle_text", "flash"))

const CEAL = ["creature", "artifact", "enchantment", "land"]

export const ADVANCED_GREPS = [
	{
		name: "ETB Trigger",
		grep: {
			Text: {
				AND: ["when", "[CARDNAME]", "enters the battlefield,"],
			},
		},
	},
	{
		name: "Death Trigger",
		grep: {
			Text: {AND: ["when", "creature", "dies,"]},
		},
	},
	{
		name: "Mana Fixer",
		grep: {
			Colors: {AND: ["C"]},
			Text: {AND: ["add "], OR: ["} or {", "}, or {", "of any"]},
		},
	},
	{
		name: "Mana Rock",
		grep: {
			CMC: {"<=": [4]},
			Types: {AND: ["artifact"]},
			Text: {AND: ["{T}: add "], OR: ["} or {", "}, or {", "of any", "{C}{C}"]},
		},
	},
	{
		name: "Counter Spell",
		grep: {
			Types: {AND: ["instant"]},
			Colors: {AND: ["U"]},
			Text: {AND: ["counter target", "spell"]},
		},
	},
	{
		name: "Spot Removal",
		grep: {
			CMC: {"<=": [4]},
			Types: {AND: ["instant"]},
			Text: {
				AND: ["target creature"],
				OR: ["destroy", "exile", "to its owner's hand"],
			},
		},
	},
	{
		name: "Board Wipe",
		grep: {
			Text: {
				AND: ["destroy all"],
				OR: [
					"creatures",
					"lands",
					"planeswalkers",
					"artifacts",
					"enchantments",
				],
			},
		},
	},
	{
		name: "Flying Men",
		grep: {
			CMC: {"<=": [2]},
			Types: {AND: ["creature"]},
			Keywords: {OR: ["flying", "shadow", "fear", "intimidate"]},
		},
	},
	{
		name: "Commander",
		grep: {
			Types: {AND: ["Legendary"], OR: ["Creature"]},
			Colors: {OR: COLORS("symbol")},
		},
	},
	{
		name: "Cantrip",
		grep: {
			Types: {OR: ["instant", "sorcery"]},
			CMC: {"<=": [2]},
			Text: {AND: ["draw a card"]},
		},
	},
	{
		name: "Wheel",
		grep: {
			Text: {
				AND: ["each player", "discards", "hand", "draws", "cards"],
				OR: ["seven", "equal to"],
			},
		},
	},
	{
		name: "Sac Outlet",
		grep: {
			Types: {OR: CEAL},
			Text: {AND: ["sacrifice a", "creature", ":"]},
		},
	},
	{
		name: "Fetchland",
		grep: {
			Types: {AND: ["land"]},
			Text: {
				AND: ["{T}, pay 1 life, sacrifice", "search your library"],
			},
		},
	},
	{
		name: "Mana Dork",
		grep: {
			CMC: {"<=": [3]},
			Types: {AND: ["creature"]},
			Text: {AND: ["{T}: add"]},
		},
	},
	{
		name: "Win the Game",
		grep: {
			Text: {AND: ["you win the game"]},
		},
	},
	{
		name: "Lose the Game",
		grep: {
			Text: {AND: ["you lose the game"]},
		},
	},
	{
		name: "Card Fall",
		grep: {
			Text: {
				AND: ["whenever", " enters the battlefield under your control"],
				OR: CEAL,
			},
		},
	},
	{
		name: "Blink",
		grep: {
			Text: {
				AND: ["exile target creature", "return", "to the battlefield"],
			},
		},
	},
	{
		name: "Bolt Test",
		grep: {
			Toughness: {">=": [4]},
		},
	},
	{
		name: "Bolt",
		grep: {
			Colors: {AND: ["R"]},
			Text: {AND: ["deal", "3 damage", "target"]},
		},
	},
	{
		name: "Clone",
		grep: {
			Types: {OR: CEAL},
			Text: {
				AND: ["enter", "as a copy of"],
				OR: CEAL,
			},
		},
	},
	{
		name: "Create Token",
		grep: {
			Text: {
				AND: ["create", "token"],
				OR: [],
			},
		},
	},
	{
		name: "Tutor",
		grep: {
			Text: {
				AND: ["search your library", "card", "hand"],
				OR: ["a", ...CEAL, "basic"],
			},
		},
	},
	{
		name: "Gain Life",
		grep: {
			Text: {AND: ["you gain life"]},
		},
	},
	{
		name: "Combat Trick",
		grep: {
			Types: {AND: ["instant"]},
			Text: {
				AND: ["gets", "/", "until end"],
				OR: ["target", "creatures"],
			},
		},
	},
	{
		name: "Extra Turn",
		grep: {
			Text: {AND: ["take an extra turn"]},
		},
	},
	{
		name: "Anthem",
		grep: {
			Text: {AND: ["creatures you control get", " +1/+1"]},
			Types: {OR: ["enchantment", "creature"]},
		},
	},
]
