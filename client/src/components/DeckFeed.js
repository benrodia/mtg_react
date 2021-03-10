import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DeckTile from "./DeckTile"
import BasicSearch from "./BasicSearch"
import Paginated from "./Paginated"

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
		ids,
		header,
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
		const feed = who
			? decks.filter(d => d.author === (who || _id))
			: ids
			? ids.map(id => decks.find(d => d._id === id)).filter(d => !!d)
			: decks

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

		return (
			<div className="decks section">
				{header}
				<Paginated
					options={feed}
					render={d => (
						<span
							onClick={_ => {
								if (addCards && cart.length) {
									addCard(cart)
									newMsg(`${cart.length} cards added to "${d.name}"`, "success")
								}
							}}>
							<DeckTile
								key={"TILE__" + d._id}
								deck={d}
								newDeck={d.new}
								noLink={noLink}
							/>
						</span>
					)}
				/>
			</div>
		)
	}
)
