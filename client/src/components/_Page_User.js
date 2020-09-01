import React, {useEffect, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import EditableText from "./EditableText"
import Login from "./Login"
import DeckFeed from "./DeckFeed"
import DeckTile from "./DeckTile"

const {HOME_DIR, formattedDate} = utilities

export default connect(({main: {decks, users}, auth: {isAuthenticated}}) => {
	return {
		decks,
		users,
		isAuthenticated,
	}
}, actions)(({decks, users, setPage, isAuthenticated, updateUser, newDeck, canEdit, logout, deleteUser}) => {
	const {slug} = useParams()
	const [user, setUser] = useState({})
	const {name, joined, _id} = user

	useEffect(
		_ => {
			setUser(users.filter(u => u.slug === slug)[0] || {})
		},
		[slug, users]
	)

	return (
		<div className="user">
			<section className="profile bar">
				<div className="avatar" />
				<div className="col">
					<EditableText
						changeable={canEdit(_id)}
						text={name}
						callBack={({text, method}) => method === "change" && updateUser(_id, {name: text || ""})}>
						<h1 className={"name block"}>{name}</h1>
					</EditableText>
					<div className="joined asterisk">Joined {formattedDate(new Date(joined))}</div>
					<Link to={HOME_DIR}>
						<div className="bar even">
							<button className="icon-logout inverse-small-button" onClick={logout}>
								Logout
							</button>
							<button className="icon-trash inverse-small-button warning-button" onClick={_ => deleteUser(_id)}>
								Delete Account
							</button>
						</div>
					</Link>
				</div>
			</section>
			<DeckFeed user={user} you={isAuthenticated && slug === user.slug} />
		</div>
	)
})
