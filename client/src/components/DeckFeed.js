import React from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import DeckTile from "./DeckTile"
import NewDeck from "./NewDeck"

const {HOME_DIR} = utilities

export default connect(({main: {decks}, auth: {isAuthenticated}}) => {
	return {
		decks,
		isAuthenticated,
	}
}, actions)(({user: {_id, slug, name}, you, hasHeader, users, decks, isAuthenticated, newDeck, openModal}) => {
	const userDecks = decks.filter(d => d.author === _id)

	const newDeckBtn = (
		<button
			className="success-button new-deck bar mini-spaced-bar"
			onClick={_ => openModal({title: "Make a Deck", content: <NewDeck />})}>
			<div>Make a Deck</div>
			<span className="icon-list-add" />
		</button>
	)

	const header = (
		<>
			<h2>Decks by</h2>
			<Link to={`${HOME_DIR}/user/${slug}`}>
				<h2 className="inverse-button ">
					{name} {you ? "(You)" : ""}
				</h2>
			</Link>
		</>
	)

	return (
		<div className="browse">
			<div className="block bar even mini-spaced-bar">
				{hasHeader ? header : null}
				{you ? newDeckBtn : null}
			</div>
			<div className="big-block decks">
				{userDecks.map(d => (
					<DeckTile key={"TILE__" + d._id} deck={d} />
				))}
			</div>
		</div>
	)
})
