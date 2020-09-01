import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Login from "./Login"
import DeckFeed from "./DeckFeed"
import DeckTile from "./DeckTile"
import NewDeck from "./NewDeck"

const {HOME_DIR} = utilities

export default connect(({main: {users, decks}, auth: {user, isAuthenticated}}) => {
	return {
		user,
		users,
		decks,
		isAuthenticated,
	}
}, actions)(({user, users, decks, setPage, isAuthenticated, newDeck, openModal}) => {
	return (
		<div className="dash">
			<section className="hero">
				<div className="banner">
					<h1>ReactMTG</h1>
					<p>We make Magic™ happen fast!</p>
				</div>
				<Login />
			</section>
			<section className="browse col">
				{!isAuthenticated ? null : <DeckFeed user={user} you hasHeader />}
				{users
					.filter(u => (!isAuthenticated || u._id !== user._id) && decks.filter(d => d.author === u._id).length)
					.map(u => (
						<DeckFeed user={u} hasHeader />
					))}
			</section>
		</div>
	)
})
