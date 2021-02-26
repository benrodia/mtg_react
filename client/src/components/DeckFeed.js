import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DeckTile from "./DeckTile"
import BasicSearch from "./BasicSearch"

const {
	HOME_DIR,
	getDecks,
	creator,
	greeting,
	rnd,
	GREETINGS,
	generateRandomDeck,
} = utilities

export default connect(
	({
		main: {decks, cardData, refresh},
		filters: {
			advanced: {cart},
		},
		auth: {
			isAuthenticated,
			user: {_id, followed, name, slug},
		},
	}) => {
		return {decks, cart, cardData, refresh, _id, followed, name, slug}
	},
	actions
)(
	({
		addCards,
		noLink,
		crumbs,
		direct,
		decks,
		params,
		you,
		hasHeader,
		cart,
		cardData,
		children,
		refresh,
		_id,
		followed,
		name,
		slug,
		isAuthenticated,
		newDeck,
		openModal,
		refreshData,
		loadDecks,
		addCard,
		addCart,
		newMsg,
	}) => {
		const [greeting, setGreeting] = useState(rnd(GREETINGS))

		const sorts = [
			{name: "Recent", key: "updated"},
			{name: "Popular", key: "views"},
			{name: "Format", key: "format"},
		]

		const NewButton = _ => (
			<Link to={`${HOME_DIR}/deck/new`} className={"deck-tile mini-spaced-col"}>
				<button className="icon-plus new-button feature">
					<h3>New Deck</h3>
				</button>
			</Link>
		)

		const Welcome = _ => (
			<div className="block bar even center mini-spaced-bar">
				<h2>{greeting},</h2>
				<Link to={`${HOME_DIR}/user/${slug}`}>
					<h2 className="inverse-button">{name}</h2>
				</Link>
			</div>
		)
		return (
			<div className="browse">
				<Welcome />
				<div className="decks full-width">
					{you ? <NewButton /> : null}
					{decks
						.filter(d => d.author === _id)
						.map(d => (
							<span
								onClick={_ => {
									if (addCards && cart.length) {
										addCard(cart)
										newMsg(
											`${cart.length} cards added to "${d.name}"`,
											"success"
										)
									}
								}}>
								<DeckTile
									key={"TILE__" + d._id}
									deck={d}
									newDeck={d.new}
									noLink={noLink}
								/>
							</span>
						))}
				</div>
			</div>
		)
	}
)
