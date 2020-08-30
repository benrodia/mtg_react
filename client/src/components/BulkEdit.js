import React, {useState, useEffect, useRef} from "react"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import CardControls from "./CardControls"
import ImportFile from "./ImportFile"

const {
	Q,
	log,
	sum,
	textList,
	titleCaps,
	rnd,
	chooseCommander,
	legalCommanders,
	FORMATS,
	MAIN_BOARD,
	SIDE_BOARD,
	snippet,
	NUM_FROM_WORD,
} = utilities

export default connect(({deck: {list, format, desc}, main: {legalCards, sets}}) => {
	return {list, format, desc, legalCards, sets}
}, actions)(({list, format, desc, sets, legalCards, addCard, openModal, changeDeck}) => {
	const exText = [...Array(7)]
		.map((_, i) => {
			if (!i) return "ex."
			const exQuant = rnd([...Array(3)].map((_, i) => i)) + 1
			return exQuant + " " + rnd(legalCards.map(c => c.name))
		})
		.join("\n")

	useEffect(_ => {
		interpretForm(textList(list))
	}, [])

	const [form, setForm] = useState()
	const [cart, setCart] = useState([])
	const [meta, setMeta] = useState({})
	const [overWrite, setOverWrite] = useState(true)

	const interpretForm = (content = "") => {
		const items = content.split("\n")
		const comment = text => text.slice(0, 2).includes("//")
		const meta = items.filter(r => comment(r))
		setMeta(
			!meta.length
				? {}
				: Object.assign(
						...["NAME", "CREATOR", "FORMAT"].map(l => {
							const prop = meta.filter(m => m.includes(l))[0]
							return {[l.toLowerCase()]: prop && prop.slice(prop.indexOf(":") + 1).trim()}
						})
				  )
		)

		const interp = items.map((item, ind) => {
			let [quantity, spaces] = [1, item.split(" ")]
			for (var i = 0; i < spaces.length; i++)
				if (parseInt(spaces[i]) > 1) {
					quantity = parseInt(spaces[i])
					break
				}

			const setText = item.indexOf("[") ? item.slice(item.indexOf("[") + 1, item.indexOf("]")).toLowerCase() : " "

			const cards = legalCards
				.filter(c => item.includes(c.name))
				.sort((a, b) => (a.name.length < b.name.length ? 1 : -1))
			const card = cards.filter(c => c.set === setText)[0] || cards[0] || null

			return (
				card && {
					quantity,
					card: {
						...card,
						commander: item.includes("CMDR: "),
						board: items.slice(0, ind).filter(it => it.includes("SB:")).length ? SIDE_BOARD : MAIN_BOARD,
					},
				}
			)
		})

		setCart(interp.filter(c => !!c))
		setForm(items.filter(r => !comment(r)).join("\n"))
	}

	const importCart = _ => {
		let cards = []
		for (var i = 0; i < cart.length; i++) cards = cards.concat([...Array(cart[i].quantity)].map(_ => cart[i].card))

		if (meta.format) changeDeck("format", meta.format)
		if (meta.name) changeDeck("name", meta.name)
		if (meta.creator) changeDeck("desc", `Original Creator: ${meta.creator} \n${desc}`)
		addCard(cards, null, false, true)
		openModal(null)
	}

	const total = sum(cart.map(c => c.quantity))
	const delta = total - list.length
	const inCart = cart
		.map(({card: {name}, quantity}) => {
			const dif = quantity - list.filter(l => l.name === name).length
			return {name, dif}
		})
		.orderBy("dif")

	const removedFromList = list.unique("name").map(({name}) => {
		const dif = cart.filter(({card}) => card.name === name).length ? 0 : -1 * list.filter(l => l.name === name).length
		return {name, dif}
	})
	const difs = [...inCart, ...removedFromList].filter(c => c.dif !== 0)
	const changes = (
		<div className="changes">
			<h3>Changes</h3>
			<div className="difs">
				{difs.map(({name, dif}) => (
					<div className={`dif ${dif > 0 ? "plus" : "minus"}`}>
						{dif > 0 ? "+" : ""}
						{dif} {name}
					</div>
				))}
			</div>
			<button onClick={importCart}>Apply</button>
		</div>
	)

	return (
		<div className="quick-import">
			<h3>Import File</h3>
			<ImportFile
				accept=".txt,.dec,.mwDeck"
				callBack={file => {
					if (overWrite) interpretForm(file)
					else interpretForm(form + "\n" + file)
				}}
			/>
			<div className="bar">
				<div className="form">
					<h3>Deck List</h3>
					<textarea value={form} rows={"15"} onChange={e => interpretForm(e.target.value)} placeholder={exText} />
				</div>
				{difs.length ? changes : null}
			</div>
		</div>
	)
})
