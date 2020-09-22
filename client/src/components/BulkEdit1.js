import React, {useState, useEffect} from "react"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import BoardFilters from "./BoardFilters"
import CardControls from "./CardControls"
import Loading from "./Loading"

const {
	Q,
	log,
	sum,
	textList,
	titleCaps,
	rnd,
	chooseCommander,
	legalCommanders,
	interpretForm,
	listDiffs,
	itemizeDeckList,
} = utilities

let timer = null
export default connect(
	({deck: {format, desc}, main: {cardData, sets}, filters: {board}}) => {
		return {format, desc, cardData, sets, board}
	},
	actions
)(
	({
		showDiffs,
		callBack,
		list,
		format,
		desc,
		sets,
		board,
		cardData,
		addCard,
		openModal,
		changeDeck,
	}) => {
		const exText = [...Array(7)]
			.map((_, i) => {
				if (!i) return "ex."
				return rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
			})
			.join("\n")

		const [view, setView] = useState("computed")
		const [form, setForm] = useState("")
		const [cart, setCart] = useState(list || [])

		useEffect(
			_ => {
				setForm(textList(list, true))
			},
			[list]
		)
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
		const raw = (
			<div className="raw">
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
		)

		const computed = (
			<div className="computed">
				<BoardFilters minified />
				{itemizeDeckList(
					list.filter(c => c.board === board && !c.commander).orderBy("name")
				).map(l => (
					<div key={l[0].key} className="item bar even">
						<div className="quant">{l.length}x</div>
						<CardControls card={l[0]} cardHeadOnly />
					</div>
				))}
			</div>
		)
		return (
			<div className="bulk-edit">
				<div className="bar even mini-spaced-bar">
					<button
						className={`small-button icon-th-list ${
							view === "computed" && "selected"
						}`}
						onClick={_ => setView("computed")}>
						Computed
					</button>
					<button
						className={`small-button icon-code ${view === "raw" && "selected"}`}
						onClick={_ => setView("raw")}>
						Raw
					</button>
				</div>
				{view === "raw" ? raw : computed}
			</div>
		)
	}
)
