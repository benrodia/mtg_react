import React, {useState, useEffect} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import ImportFile from "./ImportFile"
import BasicSearch from "./BasicSearch"

const {HOME_DIR, FORMATS, EXAMPLE_DECK_NAMES, rnd, createSlug, collapseDeckData, interpretForm, pluralize} = utilities

export default connect(({auth: {user: {_id}, isAuthenticated}, main: {cardData, decks}}) => {
	return {
		_id,
		isAuthenticated,
		cardData,
		decks,
	}
}, actions)(({_id, setPage, isAuthenticated, cardData, decks, newDeck, openModal, openDeck}) => {
	const [name, setName] = useState("")
	const [slug, setSlug] = useState("")
	const [format, setFormat] = useState("casual")
	const [desc, setDesc] = useState("")
	const [list, setList] = useState([])
	const [listForm, setListForm] = useState("")

	const exText = [...Array(7)]
		.map((_, i) => {
			if (!i) return "ex."
			return rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
		})
		.join("\n")

	useEffect(
		_ => {
			setSlug(createSlug(name, decks))
		},
		[name]
	)
	const pageHistory = useHistory()
	return (
		<div className="new-deck">
			<div className="block">
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

			<div className="block col">
				<h4>Name</h4>
				<input
					type="text"
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder={`ex. "${rnd(EXAMPLE_DECK_NAMES)}"`}
				/>
				<p>
					<span className="asterisk">{name.length ? "Pretty" : "Gross"} URL: </span>"{slug}/"
				</p>
			</div>
			<div className="block">
				<h4>Format</h4>
				<BasicSearch options={FORMATS} self={format} callBack={f => setFormat(f)} />
			</div>
			<div className="block col">
				<h4>Deck List ({list.length})</h4>
				<textarea
					value={listForm}
					rows={"15"}
					onChange={e => {
						setListForm(e.target.value)
						setList(interpretForm(e.target.value, cardData))
					}}
					placeholder={exText}
				/>
			</div>
			<button
				className="success-button block"
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
						openModal(null)
						openDeck(slug)
						pageHistory.push(`${HOME_DIR}/deck/${slug}`)
					}
				}}>
				CREATE!
			</button>
		</div>
	)
})
