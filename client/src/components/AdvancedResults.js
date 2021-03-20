import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import {useHistory} from "react-router-dom"
import actions from "../actions"
import axios from "axios"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import CardControls from "./CardControls"
import Loading from "./Loading"
import Paginated from "./Paginated"
import ContextMenu from "./ContextMenu"
import Tags from "./Tags"
import ToolTip from "./ToolTip"

const {
	Q,
	HOME_DIR,
	BOARDS,
	createSlug,
	filterAdvanced,
	rnd,
	sum,
	getCardFace,
	getTags,
	reorderDate,
	getFormattedDate,
	canEdit,
} = utilities

export default connect(
	({
		main: {cardData},
		deck: {list},
		filters: {
			advanced: {cart, termSets},
		},
		settings: {editing},
	}) => {
		return {
			cardData,
			list,
			cart,
			termSets,
			editing,
		}
	},
	actions
)(
	({
		cardData,
		list,
		cart,
		termSets,
		editing,
		addCard,
		addCart,
		getCardData,
	}) => {
		const [contextLink, setContextLink] = useState(null)
		const [searching, setSearching] = useState(false)
		const [results, setResults] = useState([])
		const [def, setDef] = useState("newest")

		const edit = canEdit() && editing
		useEffect(
			_ => {
				if (!cardData.length) getCardData()
				else {
					if (termSets.some(t => t.data.length)) {
						setSearching(true)
						setResults(filterAdvanced(cardData, termSets))
					} else if (def === "random") setResults(rnd(cardData, 12))
					else if (def === "newest")
						setResults(cardData.orderBy("released_at").slice(-12))

					setSearching(false)
				}
			},
			[cardData.length, termSets, def]
		)

		if (contextLink) {
			setContextLink(null)
			useHistory().push(contextLink)
		}

		const ResultCard = ({c, i}) => {
			if (!c) return null
			const {
				name,
				mana_cost,
				type_line,
				oracle_text,
				power,
				toughness,
			} = getCardFace(c)
			const added = Q(cart, "name", c.name).length
			const tags = getTags(c)
			return (
				<div key={c.id + i} className={`result-card big`}>
					<ToolTip
						message={
							<div className="mini-spaced-col">
								<div>
									<b>Tags: </b>
									{tags.length
										? tags.map(t => (
												<div className="tag">
													{t.type}: {t.name}
												</div>
										  ))
										: "none"}
								</div>
								<p>
									<b>Set: </b>
									{c.set_name}
								</p>
								<p>
									<b>Released: </b>
									{reorderDate(c.released_at)}
								</p>
								<p>
									<b>Price: </b>
									{c.prices && `$${c.prices.usd}`}
								</p>
							</div>
						}
					>
						<CardControls
							card={c}
							classes={"search-result"}
							param={"info"}
							noHover
							contextMenu={[
								{
									label: "Add to Cart",
									callBack: _ => addCart(c),
								},
								{
									label: "Remove from Cart",
									callBack: _ => addCart(c, true),
									color:
										cart.find(
											({name}) => name === c.name
										) || "disabled",
								},
								...BOARDS.map(B => {
									return {
										label: `Add to ${B}board`,
										callBack: _ => addCard(c, B),
									}
								}),
							]}
						/>
					</ToolTip>
					<div className="add-button mini-spaced-col">
						<button
							className={`add-button icon-plus ${
								added && "icon-ok selected"
							}`}
							onClick={_ => addCart(c)}
						>
							Cart {added}
						</button>
						{edit
							? BOARDS.map(B => {
									const addedB = list.filter(
										l => l.name === c.name && l.board === B
									).length
									return (
										<button
											className={`add-button icon-plus ${
												addedB && "icon-ok selected"
											}`}
											onClick={_ => addCard(c, B)}
										>
											{B} {addedB}
										</button>
									)
							  })
							: null}
					</div>
				</div>
			)
		}

		return cardData.length ? (
			<Paginated
				options={results}
				render={(o, i) => <ResultCard c={o} i={i} />}
				sorts={[
					{name: "Name", key: "name"},
					{name: "Date", key: "released_at"},
					{name: "CMC", key: "cmc"},
					{name: "EDHREC", key: "edhrec_rank"},
				]}
				noOpsNoFilter={!termSets.some(t => t.data.length)}
				noOps={
					termSets.some(t => t.data.length) ? null : (
						<span className="mini-spaced-bar bar even">
							<span>No Search, showing: </span>
							<button
								onClick={_ => setDef("newest")}
								className={`small-button icon-attention ${
									def === "newest" && "selected"
								}`}
							>
								Newest
							</button>
							<button
								onClick={_ =>
									def === "random"
										? setResults(rnd(cardData, 12))
										: setDef("random")
								}
								className={`small-button icon-loop ${
									def === "random" && "selected"
								}`}
							>
								Random
							</button>
						</span>
					)
				}
			/>
		) : searching ? (
			<Loading message="Searching" />
		) : (
			<Loading message="Loading Card Data" />
		)
	}
)
