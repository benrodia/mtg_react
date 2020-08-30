import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Login from "./Login"
import DeckTile from "./DeckTile"

const {HOME_DIR} = utilities

export default connect(({main: {decks}, auth: {_id, isAuthenticated}}) => {
	return {
		decks,
		_id,
		isAuthenticated,
	}
}, actions)(({decks, _id, setPage, isAuthenticated, newDeck}) => {
	useEffect(_ => {
		setPage("Dash")
	}, [])

	const newDeckBtn = (
		<Link to={`${HOME_DIR}/build/new-deck`}>
			<button className="success-button new-deck" onClick={_ => newDeck(_id)}>
				Make Something New
				<span className="icon-list-add" />
			</button>
		</Link>
	)

	return (
		<div className="dash">
			<section className="hero">
				<div className="banner">
					<h1>ReactMTG</h1>
					<p>We make Magic™ happen fast!</p>
				</div>
				<Login />
			</section>
			<section className="browse">
				{isAuthenticated ? newDeckBtn : null}
				<div className="decks">
					{isAuthenticated
						? decks.filter(({author}) => author === _id).map(deck => <DeckTile key={"TILE__" + deck._id} deck={deck} />)
						: decks.map(deck => <DeckTile key={"TILE__" + deck._id} deck={deck} />)}
				</div>
			</section>
		</div>
	)
})
