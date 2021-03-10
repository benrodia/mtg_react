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
		auth: {isAuthenticated, user},
	}) => {
		return {decks, cart, cardData, refresh, user}
	},
	actions
)(
	({
		addCards,
		noLink,
		crumbs,
		who,
		decks,
		params,
		you,
		user,
		hasHeader,
		cart,
		cardData,
		children,
		refresh,
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

		const {_id, followed, name, slug} = who ? creator(who) : user

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
			<h2 className="block bar even mini-spaced-bar">
				<Link to={`${HOME_DIR}/user/${slug}`}>
					<span className="inverse-button">{name}</span>
				</Link>
				{"'s"} Decks
			</h2>
		)
		return (
			<div className="browse">
				<Welcome />
				<div className="decks full-width">
					{you ? <NewButton /> : null}
					{decks
						.filter(d => d.author === (who || _id))
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
