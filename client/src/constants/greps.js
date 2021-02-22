import {Q} from "../functions/cardFunctions"
import {matchStr} from "../functions/utility"
import {pluralize, titleCaps} from "../functions/text"
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
export const SINGLETON = format =>
	["commander", "brawl", "duel"].includes(format)

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

const CAEL = ["creature", "artifact", "enchantment", "land"]

export const TRIGGERS = [
	"enter",
	"leave",
	"attack",
	"block",
	"die",
	"discard",
	"mill",
	"sacrifice",
	"draw",
	"exile",
	"play",
	"of untap",
	"upkeep",
	"draw step",
	"main phase",
	"combat",
	"post-combat main",
	"end step",
	"end of turn",
]

export const SUBJECTS = [
	"~",
	"you",
	"player",
	"opponent",
	...CARD_TYPES,
	"permanent",
]

export const EFFECTS = []

const factions = [
	{
		n: "Azorius",
		c: ["W", "U"],
	},
	{
		n: "Orzhov",
		c: ["W", "B"],
	},
	{
		n: "Boros",
		c: ["W", "R"],
	},
	{
		n: "Selesnya",
		c: ["W", "G"],
	},
	{
		n: "Dimir",
		c: ["U", "B"],
	},
	{
		n: "Izzet",
		c: ["U", "R"],
	},
	{
		n: "Simic",
		c: ["U", "G"],
	},
	{
		n: "Rakdos",
		c: ["B", "R"],
	},
	{
		n: "Golgari",
		c: ["B", "G"],
	},
	{
		n: "Gruul",
		c: ["R", "G"],
	},
	{
		n: "Bant",
		c: ["W", "U", "G"],
	},
	{
		n: "Esper",
		c: ["W", "U", "B"],
	},
	{
		n: "Grixis",
		c: ["U", "B", "R"],
	},
	{
		n: "Jund",
		c: ["B", "R", "G"],
	},
	{
		n: "Naya",
		c: ["W", "R", "G"],
	},
	{
		n: "Mardu",
		c: ["W", "R", "B"],
	},
	{
		n: "Temur",
		c: ["U", "R", "G"],
	},
	{
		n: "Abzan",
		c: ["W", "B", "G"],
	},
	{
		n: "Jeskai",
		c: ["W", "U", "R"],
	},
	{
		n: "Sultai",
		c: ["U", "B", "G"],
	},
	{
		n: "Chaos",
		c: ["U", "B", "R", "G"],
	},
	{
		n: "Aggression",
		c: ["W", "B", "R", "G"],
	},
	{
		n: "Altruism",
		c: ["W", "U", "R", "G"],
	},
	{
		n: "Growth",
		c: ["W", "U", "B", "G"],
	},
	{
		n: "Artifice",
		c: ["W", "U", "B", "R"],
	},
	{
		n: "Rainbow",
		c: ["W", "U", "B", "R", "G"],
	},
]

const FACTIONS = ({n, c}) => {
	return {
		name: `${titleCaps(n)} (${c.join("")})`,
		type: "faction",
		grep: {
			"Color Identity": {
				AND: c,
				NOT: COLORS("symbol").filter(CO => !c.includes(CO) && CO !== "C"),
			},
		},
	}
}

export const tribes = [
	"Elf",
	"Dragon",
	"Zombie",
	"Goblin",
	"Vampire",
	"Wizard",
	"Sliver",
	"Dinosaur",
	"Human",
	"Cat",
	"Knight",
	"Eldrazi",
	"Angel",
	"Elemental",
	"Merfolk",
	"Pirate",
	"Rogue",
	"Warrior",
	"Shapeshifter",
	"Wall",
	"Spirit",
	"God",
	"Demon",
	"Ally",
	"Cleric",
	"Faerie",
	"Soldier",
	"Bird",
	"Wolf",
	"Beast",
	"Avatar",
	"Shaman",
	"Rebel",
	"Devil",
	"Skeleton",
	"Dog",
]
export const TRIBE = (t = "") => {
	const ves = ["Wolf", "Werewolf", "Elf"]
	const noplu = ["Merfolk", "Eldrazi"]
	const plued = ves.includes(t)
		? t.slice(0, t.length - 1) + "ves"
		: pluralize(t, noplu.filter(n => n === t).length)
	return {
		name: titleCaps(plued),
		type: "tribe",
		grep: {
			Types: {OR: [t, "instant", "sorcery", "artifact", "enchantment", "land"]},
			Text: {
				AND: [t],
				OR: [
					"put a +1/+1 counter on",
					"you control get",
					"for each",
					`whenever a`,
					"search your library for ",
				],
			},
		},
	}
}

export const ADVANCED_GREPS = [
	...factions.map(f => FACTIONS(f)),
	// ...tribes.map(t => TRIBE(t)),
	{
		name: "Mana Fix",
		type: "archetype",
		grep: {
			Text: {
				OR: ["} or {", "}, or {", "of any color"],
				NOT: ["paid with either"],
			},
		},
	},
	{
		name: "Mana Rock",
		type: "archetype",
		grep: {
			Types: {AND: ["artifact"]},
			Text: {AND: ["{T}: add "], OR: ["} or {", "}, or {", "of any", "{C}{C}"]},
		},
	},
	{
		name: "ETB",
		alias: ["enters the battlefield"],
		desc: "Has an ability that triggers when it enters the battlefield",
		type: "trigger",
		grep: {
			Text: {
				AND: ["when ~ enters the battlefield"],
			},
		},
	},
	{
		name: "Upkeep",
		type: "trigger",
		grep: {
			Text: {
				AND: ["upkeep"],
				OR: ["beginning of", "end of"],
			},
		},
	},
	{
		name: "Death",
		type: "trigger",
		grep: {
			Text: {OR: ["creature dies", "~ dies"]},
		},
	},
	{
		name: "Enter Tapped",
		type: "modifier",
		grep: {
			Text: {AND: ["~ enters the battlefield tapped"]},
		},
	},
	{
		name: "Untap",
		type: "effect",
		grep: {
			Text: {
				OR: ["untap ~", "untap target", "untap each", "untap all"],
				NOT: ["doesn't untap", "not to untap"],
			},
		},
	},
	{
		name: "Grower",
		alias: ["self buff", "reinforce"],
		type: "archetype",
		grep: {
			Text: {
				OR: ["~ gets +", "~ gains", "counter on ~", "counters on ~"],
			},
		},
	},
	{
		name: "Counter",
		desc: "Counter target spell/ability",
		type: "effect",
		grep: {
			Text: {AND: ["counter target"], OR: ["spell", "activated", "triggered"]},
		},
	},
	{
		name: "Destroy",
		type: "effect",
		grep: {
			// CMC: {"<=": [4]},
			// Types: {AND: ["instant"]},
			Text: {
				AND: ["destroy target"],
				OR: [...CAEL, "planeswalker", "permanent"],
			},
		},
	},
	// {
	// 	name: "Naturalize",
	// 	type: "effect",
	// 	grep: {
	// 		Text: {
	// 			AND: ["target", "artifact", "enchantment"],
	// 			OR: ["destroy", "exile", "to its owner's hand"],
	// 		},
	// 	},
	// },
	{
		name: "Land Hate",
		type: "effect",
		grep: {
			Text: {
				AND: [" land"],
				OR: ["destroy target", "destroy all", "sacrifices", "don't untap"],
			},
		},
	},
	{
		name: "Discard",
		type: "effect",
		grep: {
			Colors: {OR: ["B"]},
			Text: {
				AND: ["discard"],
				OR: ["look at", "a card", "two cards", "at random"],
			},
		},
	},
	{
		name: "Board Wipe",
		type: "effect",
		grep: {
			Text: {
				AND: ["destroy all"],
				OR: ["creatures", "enchantments", "artifacts", "planeswalkers"],
			},
		},
	},
	{
		name: "Amplifier",
		type: "modifier",
		grep: {
			Text: {
				OR: ["double", , "triple", "an additional", "twice", "three times"],
				NOT: ["double strike", "pay an additional", "an additional cost"],
			},
		},
	},
	{
		name: "Additional Cost",
		type: "modifier",

		grep: {
			Text: {
				OR: ["as an additional cost"],
			},
		},
	},
	{
		name: "Alternate Cost",
		type: "modifier",
		grep: {
			Text: {
				AND: ["cost"],
				OR: ["cast this spell for ", "instead of paying", "rather than pay"],
			},
		},
	},
	{
		name: "+1 Counter",
		type: "effect",
		grep: {
			Text: {
				AND: ["put", "+1/+1 counter"],
				OR: [
					"a +1",
					"two +1",
					"three +1",
					"four +1",
					"that many +1",
					"equal to",
				],
			},
		},
	},
	{
		name: "-1 Counter",
		type: "effect",
		grep: {
			Text: {
				AND: ["put", "-1/-1 counter"],
				OR: [
					"a -1",
					"two -1",
					"three -1",
					"four -1",
					"that many -1",
					"equal to",
				],
			},
		},
	},
	{
		name: "Tax",
		type: "archetype",
		grep: {
			Text: {
				OR: ["unless that player pays", "more to cast"],
				NOT: ["you pay", "this spell costs"],
			},
		},
	},
	{
		name: "Pain Draw",
		type: "effect",
		grep: {
			Text: {
				AND: ["lose", "life"],
				OR: ["draw", "put into hand"],
			},
		},
	},
	{
		name: "Cost Reduction",
		type: "modifier",
		grep: {
			Text: {
				AND: ["cost", "less to cast"],
			},
		},
	},
	// {
	// 	name: "Evasion",
	// 	grep: {
	// 		Types: {AND: ["creature"]},
	// 		Keywords: {
	// 			OR: [
	// 				"flying",
	// 				"shadow",
	// 				"fear",
	// 				"intimidate",
	// 				"skulk",
	// 				"menace",
	// 				"protection",
	// 				"horsemanship",
	// 			],
	// 		},
	// 	},
	// },
	{
		name: "Ritual",
		type: "archetype",

		grep: {
			Types: {OR: ["instant", "sorcery"]},
			Text: {AND: ["Add ", "mana"], NOT: ["token"]},
		},
	},
	{
		name: "Cantrip",
		type: "archetype",
		grep: {
			// Types: {OR: ["instant", "sorcery"]},
			Text: {
				OR: [
					"draw a card.",
					"Draw a card at the beginning of next turn's upkeep",
				],
				NOT: ["cycling"],
			},
		},
	},
	{
		name: "Dig",
		type: "effect",
		grep: {
			Text: {OR: ["scry", "look at the top", "then discard", "surveil"]},
		},
	},
	{
		name: "Replacement",
		type: "modifier",
		grep: {
			Text: {AND: ["would", "instead"]},
		},
	},
	{
		name: "Redirect",
		type: "effect",
		grep: {
			Text: {AND: ["change", "target"]},
		},
	},
	// {
	// 	name: "Self Improvement",
	// 	type: "archetype",
	// 	grep: {
	// 		Text: {OR: ["counter on ~", "counters on ~", "~ gains", "~ gets +"]},
	// 	},
	// },
	// {
	// 	name: "Buff",
	// 	grep: {
	// 		Text: {AND: ["creature"], OR: ["gain", "gets +"]},
	// 	},
	// },
	// {
	// 	name: "Debuff",
	// 	grep: {
	// 		Text: {AND: ["creature"], OR: ["lose", "/-"]},
	// 	},
	// },

	{
		name: "Burn",
		type: "archetype",
		grep: {
			Text: {
				AND: ["~ deals"],
				OR: ["creature", "player", "planeswalker", "any target"],
			},
			Types: {
				OR: ["instant", "sorcery"],
			},
		},
	},
	{
		name: "Pinger",
		type: "archetype",
		grep: {
			Text: {
				AND: ["~ deals 1 damage"],
			},
			Types: {
				OR: ["creature"],
			},
		},
	},
	{
		name: "Emblem",
		type: "modifier",
		grep: {
			Text: {
				OR: ["an emblem", "for the rest of the game"],
				NOT: ["ascend"],
			},
		},
	},
	{
		name: "Draw",
		type: "trigger",
		grep: {
			Text: {
				OR: [
					"whenever you draw",
					"whenever a player draws",
					"whenever an opponent draws",
					"draw step",
				],
				NOT: ["skip"],
			},
		},
	},
	{
		name: "Cast",
		type: "trigger",
		grep: {
			Text: {
				OR: [
					"whenever you cast",
					"whenever a player casts",
					"whenever an opponent casts",
				],
			},
		},
	},
	{
		name: "Discard",
		type: "trigger",
		grep: {
			Text: {
				OR: [
					"whenever you discard",
					"whenever a player discards",
					"whenever an opponent discards",
				],
			},
		},
	},
	{
		name: "Wheel",
		type: "effect",
		grep: {
			Text: {
				AND: ["each player", "discards", "hand", "draws", "cards"],
				OR: ["seven", "equal to"],
			},
		},
	},
	{
		name: "Sac Outlet",
		type: "archetype",

		grep: {
			Text: {
				AND: [":"],
				OR: ["sacrifice a", "sacrifice two", "sacrifice X"],
				NOT: ["sacrifice ~"],
			},
		},
	},
	// {
	// 	name: "Fetchland",
	// 	grep: {
	// 		Types: {AND: ["land"]},
	// 		Text: {
	// 			AND: ["{T}, pay 1 life, sacrifice", "search your library"],
	// 		},
	// 	},
	// },
	{
		name: "Mana Dork",
		type: "archetype",

		grep: {
			CMC: {"<=": [3]},
			Types: {AND: ["creature"]},
			Text: {AND: ["{T}: add"]},
		},
	},
	{
		name: "Win the Game",
		type: "effect",

		grep: {
			Text: {AND: ["you win the game"]},
		},
	},
	{
		name: "Lose the Game",
		type: "effect",
		grep: {
			Text: {AND: ["you lose the game"]},
		},
	},
	{
		name: "Card Fall",
		type: "trigger",
		grep: {
			Text: {
				AND: ["whenever", " enters the battlefield under your control"],
				OR: CAEL,
			},
		},
	},
	{
		name: "Blink",
		type: "effect",
		grep: {
			Text: {
				AND: [
					"exile",
					"return",
					"to the battlefield",
					"control at the beginning of",
				],
			},
		},
	},
	{
		name: "Flicker",
		type: "effect",
		grep: {
			Text: {
				AND: ["exile", "then return", "to the battlefield"],
			},
		},
	},
	{
		name: "Bounce",
		type: "effect",
		grep: {
			Text: {
				AND: ["return"],
				OR: ["to its owner's hand", "to their owners' hands"],
			},
		},
	},

	{
		name: "Clone",
		type: "effect",

		grep: {
			Types: {OR: CAEL},
			Text: {
				AND: ["~", "a copy of"],
				OR: ["enters the battlefield as", "becomes"],
			},
		},
	},
	{
		name: "Token Spawn",
		type: "effect",
		grep: {
			Text: {
				AND: ["create", "token"],
			},
		},
	},
	{
		name: "Tutor",
		type: "effect",
		grep: {
			Text: {
				NOT: ["name", "converted mana cost"],
				AND: ["search your library for", "card"],
			},
		},
	},
	{
		name: "Mill",
		type: "effect",
		grep: {
			Text: {
				OR: ["into your graveyard", "into their graveyard", "mill"],
			},
		},
	},
	{
		name: "Grave Hate",
		type: "effect",
		grep: {
			Text: {
				AND: ["graveyard"],
				OR: ["exile all cards", "exile target card", "exile each"],
			},
		},
	},
	{
		name: "Recursion",
		type: "effect",
		grep: {
			Text: {
				AND: ["from your graveyard"],
				OR: ["hand", "to the battlefield", "cast"],
			},
		},
	},
	{
		name: "Land Ramp",
		type: "effect",
		grep: {
			Text: {
				AND: ["search your library", "land", "battlefield"],
			},
		},
	},
	// {
	// 	name: "Drain Life",
	// 	type: "effect",
	// 	grep: {
	// 		Text: {
	// 			AND: ["you gain", "lose", "life"],
	// 		},
	// 	},
	// },
	// {
	// 	name: "Combat Trick",
	// 	type: "archetype",
	// 	grep: {
	// 		Types: {AND: ["instant"]},
	// 		Text: {
	// 			AND: ["creature"],
	// 			OR: ["attacking", "blocking"],
	// 		},
	// 	},
	// },
	{
		name: "Combat",
		type: "trigger",
		grep: {
			Text: {
				OR: ["beginning of combat", "end of combat"],
			},
		},
	},
	{
		name: "Attack",
		type: "trigger",
		grep: {
			Text: {
				AND: ["whenever"],
				OR: [
					"~ attacks",
					"attacks,",
					"a creature attacks",
					"one or more creatures attack",
					"or attacks",
				],
			},
		},
	},
	{
		name: "Block",
		type: "trigger",
		grep: {
			Text: {
				AND: ["whenever"],
				OR: [
					"~ blocks",
					"a creature blocks",
					"one or more creatures block",
					"or blocks",
				],
			},
		},
	},
	{
		name: "Extra Turn",
		type: "effect",
		grep: {
			Text: {AND: ["take an extra turn"]},
		},
	},
	{
		name: "Anthem",
		type: "modifier",
		grep: {
			Text: {AND: ["creatures you control"], OR: ["get", "have"]},
			Types: {NOT: ["instant", "sorcery"]},
		},
	},
	{
		name: "Equipment Matters",
		type: "archetype",
		grep: {
			Text: {OR: ["for each equipment", "is equipped", "equipped creatures"]},
		},
	},
	{
		name: "Auras Matter",
		type: "archetype",
		grep: {
			Text: {OR: ["for each aura", "is enchanted", "enchanted creatures"]},
		},
	},
	{
		name: "Power Matters",
		type: "archetype",
		grep: {
			Text: {
				AND: ["power"],
				OR: ["equal to", "or greater", "the total "],
				NOT: ["toughness are each"],
			},
			Colors: {NOT: ["W"]},
		},
	},
	{
		name: "Toughness Matters",
		type: "archetype",
		grep: {
			Text: {
				AND: ["toughness"],
				OR: ["equal to", "or greater"],
				NOT: ["power and"],
			},
		},
	},
	{
		name: "Colors Matter",
		type: "archetype",
		grep: {
			Text: {
				OR: [
					"for each color",
					"for each basic land type",
					"of its colors",
					"number of colors",
					"converge",
				],
			},
		},
	},
	{
		name: "Spells Matter",
		type: "archetype",
		grep: {
			Text: {
				AND: ["instant", "sorcery"],
				OR: ["Whenever you cast an", "for each", "equal to the number of"],
			},
		},
	},
	{
		name: "Grave Matters",
		type: "archetype",
		grep: {
			Text: {
				AND: ["graveyard"],
				OR: ["for each", "equal to the number of", "is put into"],
			},
		},
	},
	{
		name: "Keyword Matters",
		type: "archetype",
		grep: {
			Text: {
				AND: ["creatures you control with"],
				NOT: ["with power", "with total", "with the chosen"],
			},
		},
	},

	{
		name: "Theft",
		type: "effect",
		grep: {
			Text: {AND: ["gain control"], OR: [...CAEL, "permanent", "player"]},
		},
	},
	{
		name: "Tap-Down",
		type: "effect",
		grep: {
			Text: {
				AND: ["n't untap during", "untap step"],
				OR: ["target", "controls"],
			},
		},
	},
	{
		name: "Fog",
		type: "effect",
		grep: {
			Text: {
				AND: ["prevent", "all", "damage"],
				OR: ["dealt to", "dealt by", "combat"],
			},
		},
	},
	{
		name: "Life Gain",
		type: "trigger",
		grep: {
			Text: {
				AND: ["life"],
				OR: [
					"whenever you gain",
					"whenever a player gain",
					"an opponent gain",
					"an opponent would gain",
					"if you gained",
					"if you would gain",
				],
			},
		},
	},
	{
		name: "Life Loss",
		type: "trigger",
		grep: {
			Text: {
				AND: ["life"],
				OR: [
					"whenever you lose",
					"whenever a player loses",
					"whenever an opponent loses",
					"if you lost",
					"if you would lose",
				],
			},
		},
	},
	{
		name: "Gain Life",
		type: "effect",
		grep: {
			Text: {
				AND: ["gain", "life"],
				OR: [
					...NUMBERS.slice(1, 9).map(i => `${i}`),
					"that much life",
					"life equal to",
				],
			},
		},
	},
	{
		name: "Lose Life",
		type: "effect",
		grep: {
			Text: {
				AND: ["lose", "life"],
				OR: [
					...NUMBERS.slice(1, 9).map(i => `${i}`),
					"that much life",
					"life equal to",
				],
			},
		},
	},
	{
		name: "Choose",
		type: "modifier",
		grep: {
			Text: {
				AND: ["Choose", "—"],
				OR: ["one", "two", "or more", "entwine"],
			},
		},
	},
	// {
	// 	name: "Hate Bear",
	// 	type: "archetype",
	// 	grep: {
	// 		Text: {
	// 			OR: ["can't"],
	// 			NOT: [" can't lose"],
	// 		},
	// 		Types: {AND: ["creature"]},
	// 	},
	// },
	{
		name: "Beatstick",
		type: "archetype",
		grep: {
			Types: {AND: ["creature"]},
			Power: {">=": ["5"]},
			Keywords: {
				OR: [
					"flying",
					"menace",
					"trample",
					"haste",
					"first strike",
					"annihilator",
				],
			},
		},
	},
	{
		name: "Bulk Rare",
		type: "archetype",
		grep: {
			Rarity: {OR: ["rare", "mythic"]},
			Price: {
				"<": [1],
			},
		},
	},
	{
		name: "Chaff",
		type: "archetype",
		grep: {
			Rarity: {OR: ["common"]},
			Price: {
				"<": [0.25],
			},
		},
	},

	{
		name: "Expensive",
		type: "archetype",
		grep: {
			Price: {
				">=": [20],
			},
		},
	},

	{
		name: "Conditional",
		type: "modifier",
		grep: {
			Text: {
				OR: ["if ", "as long as"],
				NOT: ["would"],
			},
		},
	},

	{
		name: "Keyword Soup",
		type: "archetype",
		grep: {
			"# of Keywords": {
				">=": [4],
			},
		},
	},
	{
		name: "Multicolor",
		type: "archetype",
		grep: {
			"# of Colors": {
				">=": [2],
			},
		},
	},
	{
		name: "Animate",
		type: "effect",
		grep: {
			Text: {
				AND: ["becomes a", "/", "creature"],
			},
		},
	},
	{
		name: "Tamper-Proof",
		type: "archetype",
		grep: {
			Text: {
				OR: [
					"Hexproof",
					"Shroud",
					"Indestructible",
					"protection",
					"Persist",
					"Undying",
					"return ~ to the battlefield",
					"regenerate ~",
					"split second",
					"can't be countered",
				],
			},
		},
	},
]
