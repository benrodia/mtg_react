import React, {useState, useEffect} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import BulkEdit from "./BulkEdit"

const {HOME_DIR, FORMATS, createSlug, collapseDeckData, pluralize} = utilities

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
	const [list, setList] = useState([])

	useEffect(
		_ => {
			setSlug(createSlug(name, decks))
		},
		[name]
	)
	const pageHistory = useHistory()
	console.log("list", list)
	return (
		<div className="new-deck">
			<div className="block col">
				<h4>Name</h4>
				<input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={"the new hotness"} />
				<p>
					<span className="asterisk">{name.length ? "Pretty" : "Gross"} URL: </span>"{slug}/"
				</p>
			</div>
			<div>
				<h4>Format</h4>
				<BasicSearch options={FORMATS} self={format} callBack={f => setFormat(f)} />
			</div>
			<div className="block">
				<BulkEdit clean useCards={cardData} callBack={l => l && l.length && setList(l)} />
				{list.length ? `${list.length} ${pluralize("Card", list.length)}` : null}
			</div>
			<button
				className="success-button block"
				onClick={_ => {
					if (isAuthenticated) {
						newDeck(_id, {name: name.length ? name : "New Deck", slug, format, list: collapseDeckData(list)})
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
