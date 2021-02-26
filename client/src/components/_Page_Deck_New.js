import React, {useState, useEffect} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import ImportFile from "./ImportFile"
import BasicSearch from "./BasicSearch"
import GenerateDeck from "./GenerateDeck"

const {
	HOME_DIR,
	FORMATS,
	EXAMPLE_DECK_NAMES,
	rnd,
	createSlug,
	collapseDeckData,
	interpretForm,
	pluralize,
	textList,
	titleCaps,
} = utilities

export default connect(
	({
		auth: {
			user: {_id},
			isAuthenticated,
		},
		main: {cardData, decks},
		filters: {
			advanced: {cart},
		},
	}) => {
		return {
			_id,
			isAuthenticated,
			cardData,
			decks,
			cart,
		}
	},
	actions
)(
	({
		cards,
		_id,
		setPage,
		isAuthenticated,
		cardData,
		decks,
		cart,
		newDeck,
		openModal,
		openDeck,
	}) => {
		const [name, setName] = useState("")
		const [slug, setSlug] = useState("")
		const [format, setFormat] = useState("casual")
		const [desc, setDesc] = useState("")
		const [list, setList] = useState(cards || cart || [])
		const [listForm, setListForm] = useState(textList(cards || cart) || "")

		const [exName, setExName] = useState(rnd(EXAMPLE_DECK_NAMES))
		const [exList, setExList] = useState("")

		useEffect(
			_ => {
				setSlug(createSlug(name, decks))
				cardData.length &&
					setExList(
						[...Array(7)]
							.map((_, i) => {
								if (!i) return "ex."
								return rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
							})
							.join("\n")
					)
			},
			[name, cardData.length]
		)
		const pageHistory = useHistory()
		return (
			<div className="new-deck section">
				<h1 className="block">New Deck</h1>
				<div className="block bar">
					<div>
						<h4>Create From File</h4>
						<ImportFile
							accept=".txt,.dek,.mwDeck"
							callBack={({meta: {name, format, creator}, cards, text, err}) => {
								if (!err) {
									setList(cards)
									setListForm(text)
									if (name) setName(name)
									if (format) setFormat(format)
									if (creator) setDesc(`Original Creator: ${creator}`)
								}
							}}
						/>
					</div>
				</div>

				<div className="block col">
					<h4>Name *</h4>
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={`ex. "${exName}"`}
					/>
					<span className="asterisk">
						{name.length ? `URL: "deck/${slug}/"` : "Name Required"}
					</span>
				</div>
				<div className="block">
					<h4>Format</h4>
					<BasicSearch
						options={FORMATS}
						self={titleCaps(format)}
						labelBy={f => titleCaps(f)}
						callBack={f => setFormat(f)}
					/>
				</div>
				{format === "commander" ? (
					<GenerateDeck
						setName={n => setName(n)}
						callBack={d => {
							setList(d)
							setListForm(textList(d))
						}}
					/>
				) : null}
				<div className="block col">
					<h4>Deck List ({list.length})</h4>
					<textarea
						value={listForm}
						rows={"15"}
						onChange={e => {
							setListForm(e.target.value)
							setList(interpretForm(e.target.value, cardData))
						}}
						placeholder={exList}
					/>
				</div>
				<button
					className={`success-button block ${name.length || "disabled"}`}
					onClick={_ => {
						if (isAuthenticated) {
							newDeck(_id, {
								name: name.length ? name : "New Deck",
								slug,
								format,
								desc,
								list: collapseDeckData(list),
								feature: list[0] && list[0].image_uris.art_crop,
							})
							openDeck(slug)
							pageHistory.push(`${HOME_DIR}/deck/${slug}`)
						}
					}}>
					CREATE!
				</button>
			</div>
		)
	}
)
