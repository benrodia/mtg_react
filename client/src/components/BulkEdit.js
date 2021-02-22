import React, {useState, useEffect} from "react"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Loading from "./Loading"
import CardControls from "./CardControls"
import BasicSearch from "./BasicSearch"
import QuickSearch from "./QuickSearch"

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
	({deck: {format, desc, list}, main: {cardData, sets}}) => {
		return {format, desc, list, cardData, sets}
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
		cardData,
		addCard,
		openModal,
		changeDeck,
		getCardData,
	}) => {
		const exText = [...Array(7)]
			.map((_, i) =>
				!i ? "ex." : rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
			)
			.join("\n")

		const [form, setForm] = useState(textList(list))
		const [cart, setCart] = useState(list || [])
		const [typing, setTyping] = useState(true)
		const [fetching, setFetching] = useState(false)

		const {added, removed, changed} = listDiffs(list, cart)

		console.log("sets", sets)
		useEffect(
			_ => {
				if (!cardData.length && !fetching) {
					setFetching(true)
					getCardData()
				} else if (!typing) setCart(interpretForm(form, cardData, list, sets))
			},
			[cardData.length, typing, form]
		)

		return (
			<div className="raw col mini-spaced-col">
				<QuickSearch />
				<textarea
					value={form}
					rows={"15"}
					cols={"28"}
					onChange={e => {
						setForm(e.target.value)
						setTyping(true)
						timer = setTimeout(_ => setTyping(false), 1000)
					}}
					placeholder={exText}
				/>
				<div className="diffs mini-spaced-col">
					<div className="full-width fill bar even spread">
						<h2>Changes</h2>
						<button onClick={_ => addCard(cart, null, null, true)}>
							Apply
						</button>
					</div>
					<div className="inner full-width fill bar spread">
						<div className="added">
							<h4>Added ({added.length})</h4>
							{itemizeDeckList(added).map((a, i) => (
								<CardControls
									quant={a.length}
									nameOnly
									card={a[0]}
									key={`added_${a[0].id + i}`}
								/>
							))}
						</div>
						<div className="removed">
							<h4>Removed ({removed.length})</h4>
							{itemizeDeckList(removed).map((a, i) => (
								<CardControls
									quant={a.length}
									nameOnly
									card={a[0]}
									key={`added_${a[0].id + i}`}
								/>
							))}
						</div>
						<div className="changed">
							<h4>Changed ({changed.length})</h4>
							{itemizeDeckList(changed).map((c, i) => (
								<CardControls
									quant={c.length}
									nameOnly
									card={c[0]}
									key={`changed_${c[0].id + i}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}
)
