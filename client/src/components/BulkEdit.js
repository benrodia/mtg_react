import React, {useState, useEffect} from "react"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Loading from "./Loading"

const {Q, log, sum, textList, titleCaps, rnd, chooseCommander, legalCommanders, interpretForm, listDiffs} = utilities

let timer = null
export default connect(({deck: {format, desc}, main: {cardData, sets}}) => {
	return {format, desc, cardData, sets}
}, actions)(({showDiffs, callBack, list, format, desc, sets, cardData, addCard, openModal, changeDeck}) => {
	const exText = [...Array(7)]
		.map((_, i) => {
			if (!i) return "ex."
			return rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
		})
		.join("\n")

	const [form, setForm] = useState(textList(list))
	const [cart, setCart] = useState(list || [])

	const getInterp = _ => {
		const cards = interpretForm(form, cardData)
		setCart(cards)
		callBack && callBack(cards)
	}

	const applyChanges = _ => {
		addCard(cart, null, false, true)
	}

	const total = cart.length
	const {added, removed} = listDiffs(list, cart)
	const changes = (
		<div className="changes">
			<h4>Changes</h4>
			<div className="bar block spread fill">
				<div className="added">
					<h5>Added</h5>
					<div className="col">
						{added.map(({name, diff}) => (
							<div key={name + diff} className={"icon-plus"}>
								{diff} {name}
							</div>
						))}
					</div>
				</div>
				<div className="removed">
					<h5>Removed</h5>
					<div className="col">
						{removed.map(({name, diff}) => (
							<div key={name + diff} className={"icon-minus"}>
								{diff} {name}
							</div>
						))}
					</div>
				</div>
			</div>
			<button onClick={_ => addCard(cart, null, false, true)}>Apply</button>
		</div>
	)

	return (
		<div className="quick-import">
			<div className="block">
				<div className="bar spaced-bar">
					<div className="form">
						<h4>Deck List</h4>
						<textarea
							value={form}
							rows={"15"}
							onChange={e => {
								setForm(e.target.value)
								clearTimeout(timer)
								timer = setTimeout(_ => {
									getInterp()
									timer = null
								}, 1000)
							}}
							placeholder={exText}
						/>
					</div>
					{!showDiffs ? null : changes}
				</div>
			</div>
		</div>
	)
})
