import React, {Fragment} from "react"
import {COLORS, CARD_TYPES, ZONES, SIDE_BOARD} from "../constants/definitions"
import {SINGLETON, TOKEN_NAME} from "../constants/greps"
import {SPECIAL_SYMBOLS, NUMBER_WORDS} from "../constants/data"
import {sum} from "../functions/utility"
import {convertedSymbols, itemizeDeckList} from "../functions/cardFunctions"

export const formatManaSymbols = (text = "") => {
	if (text && typeof text === "string") {
		const textAr = text.split("{")
		return textAr.map((m, i) => {
			if (m.length) {
				let ms = m.substring(0, m.indexOf("}")).replace("}", "").replace("/", "").toLowerCase().replace("t", "tap")

				const cName = SPECIAL_SYMBOLS.includes(ms) ? "ms ms-cost ms-" + ms : ""

				return (
					<Fragment key={m + i}>
						<span className={cName} />
						<span>{m.substring(m.indexOf("}") + 1, m.length)}</span>
					</Fragment>
				)
			}
			return null
		})
	}
	return null
}

export const BGcolor = (colors, identity, type) => {
	let colorVal
	let colorVals = [
		{symbol: "W", val: "#F0F0E6"},
		{symbol: "U", val: "#64B8DD"},
		{symbol: "B", val: "#544656"},
		{symbol: "R", val: "#D8795B"},
		{symbol: "G", val: "#6Ca572"},
	]

	if (!colors || !colors.length) {
		if (type.includes("Artifact")) {
			return "#999"
		} else if (type.includes("Land") && !type.includes("Basic")) {
			return "#876"
		}
	} else if (colors.length === 1 || identity.length === 1) {
		for (var i = 0; i < colorVals.length; i++) {
			if (colorVals[i].symbol == colors[0] || colorVals[i].symbol == identity[0]) {
				colorVal = colorVals[i].val
			}
		}
	} else if (colors.length > 1) {
		colorVal = "#C1AD70"
	}
	return colorVal
}

export const formatText = (text = "") => {
	return text
		.split("\n")
		.map(l => formatManaSymbols(l))
		.map((l, i) => <p key={l + i}>{l}</p>)
}

export const subType = (type = "") =>
	type.includes("Basic") ? "" : type.slice(Math.max(0, type.indexOf("—") + 1)).trim()

export const subTitle = ({list, format}) => {
	const subTitle = list.filter(c => c.commander).length
		? ": " +
		  list
				.filter(c => c.commander)
				.map(c => (c.name.indexOf(",") !== -1 ? c.name.substr(0, c.name.indexOf(",")) : c.name))
				.join(" & ")
		: null
	return (
		<>
			{" ("}
			{titleCaps(format)}
			{subTitle})
		</>
	)
}

export function cardMoveMsg(card, dest) {
	const {zone, name, type_line} = card
	return dest === "Exile"
		? `Exile "${name}" from ${zone}`
		: dest === "Hand" && zone !== "Library"
		? `Return "${name}" from ${zone} to hand`
		: dest === "Hand" && zone === "Library"
		? `Draw "${name}"`
		: dest === "Battlefield" && (zone === "Graveyard" || zone === "Exile")
		? `Return "${name}" from ${zone} to Battlefield`
		: dest === "Battlefield" && (zone === "Hand" || zone === "Command") && !type_line.includes("Land")
		? `Cast "${name}"`
		: dest === "Battlefield"
		? `Play "${name}"`
		: dest === "Graveyard" && zone === "Library"
		? `Mill "${name}"`
		: dest === "Graveyard" && zone === "Battlefield"
		? `Sacrifice "${name}"`
		: dest === "Graveyard" && zone === "Hand"
		? `Discard "${name}"`
		: `Put "${name}" into ${dest} from ${zone}`
}

export const pluralize = (word, val) => {
	const s = val !== 1 ? (word[word.length - 1].toLowerCase() === "y" ? "ies" : "s") : null
	return `${s === "ies" ? word.slice(0, word.length - 1) : word}${s || ""}`
}

export const effectText = (effects, token) => {
	let text = ""
	for (var i = 0; i < effects.length; i++) {
		const [key, val] = effects[i]
		if (val > 0) {
			const valText = val === 1 ? "a" : NUMBER_WORDS[val]
			const addText = (t, plu) => `${text}${text ? " and " : ""} ${pluralize(t, val)}`
			if (key === "life") text = val > 0 ? addText(`gain ${valText} life`) : addText(`lose ${valText} life`)
			if (key === "look") text = addText(`reveal top ${val === 1 ? "" : valText} card`, true)
			if (key === "draw") text = addText(`draw ${valText} card`, true)
			if (key === "mill") text = addText(`mill ${valText} card`, true)
			if (key === "token" && token) text = addText(`create ${valText} ${TOKEN_NAME(token)}`, true)
		}
	}
	return titleCaps(text) || null
}

export const paidCostMsg = paid => {
	const usedMana = paid.usedMana ? "Used floating mana" : ""
	const usedLands = paid.tapped.length
		? `${NUMBER_WORDS[paid.tapped.length]} mana source${paid.tapped.length !== 1 ? "s" : ""}`
		: null
	return formatText(
		`${usedMana} ${usedMana.length && usedLands ? " and tapped " : usedLands ? "Tapped " : ""} ${
			usedLands || ""
		} to pay ${paid.cost}`
	)
}

export const textList = list =>
	itemizeDeckList(list, ["name"])
		.map(cards => {
			const {board, commander, set, name} = cards[0]
			return `${board === SIDE_BOARD ? "SB: " : commander ? "CMDR: " : ""}${
				cards.length
			} [${set.toUpperCase()}] ${name}`
		})
		.join("\n")

/*
 * Title Caps
 *
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */

var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)"
var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)"

export function titleCaps(title) {
	var parts = [],
		split = /[:.;?!] |(?: |^)["Ò]/g,
		index = 0

	while (true) {
		var m = split.exec(title)

		parts.push(
			title
				.substring(index, m ? m.index : title.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function (all) {
					return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all)
				})
				.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
				.replace(RegExp("^" + punct + small + "\\b", "ig"), function (all, punct, word) {
					return punct + upper(word)
				})
				.replace(RegExp("\\b" + small + punct + "$", "ig"), upper)
		)

		index = split.lastIndex

		if (m) parts.push(m[0])
		else break
	}

	return parts
		.join("")
		.replace(/ V(s?)\. /gi, " v$1. ")
		.replace(/(['Õ])S\b/gi, "$1s")
		.replace(/\b(AT&T|Q&A)\b/gi, function (all) {
			return all.toUpperCase()
		})
}

function lower(word) {
	return word.toLowerCase()
}

function upper(word) {
	return word.substr(0, 1).toUpperCase() + word.substr(1)
}