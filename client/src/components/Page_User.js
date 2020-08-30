import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import EditableText from "./EditableText"
import Login from "./Login"
import DeckTile from "./DeckTile"

const {HOME_DIR, formattedDate} = utilities

export default connect(({main: {decks, viewUser: {name, joined}}, auth: {isAuthenticated}}) => {
	return {
		decks,
		name,
		joined,
		isAuthenticated,
	}
}, actions)(({decks, name, joined, _id, setPage, isAuthenticated, updateUserName, newDeck, canEdit}) => {
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
		<div className="user">
			<section className="profile bar">
				<div className="avatar" />
				<div className="col">
					<EditableText
						changeable={canEdit(_id)}
						text={name}
						callBack={({text, method}) => method === "change" && updateUserName(_id, text || "")}>
						<h1 className={"name block"}>{name}</h1>
					</EditableText>
					<div className="joined asterisk">Joined {formattedDate(new Date(joined))}</div>
				</div>
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
