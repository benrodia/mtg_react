import React, {useEffect, useState} from "react"
import {Link, useParams, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import EditableText from "./EditableText"
import Login from "./Login"
import DeckFeed from "./DeckFeed"
import DeckTile from "./DeckTile"

const {HOME_DIR, formattedDate, canEdit} = utilities

export default connect(({main: {decks, users}, auth: {isAuthenticated}}) => {
	return {
		decks,
		users,
		isAuthenticated,
	}
}, actions)(({decks, users, setPage, isAuthenticated, updateUser, newDeck, logout, deleteAccount}) => {
	const {slug} = useParams()
	const [{name, joined, _id, followed}, setUser] = useState({})

	useEffect(
		_ => {
			setUser(users.filter(u => u.slug === slug)[0] || {})
		},
		[slug, users]
	)

	const handleDelete = _ => {
		const rusure = window.confirm("Are you super duper sure you want to delete your account??")
		if (rusure) deleteAccount()
	}

	return (
		<div className="user">
			<div className="profile big-block bar even center">
				<div className="avatar" />
				<div className="col">
					<EditableText
						changeable={canEdit(_id)}
						text={name}
						callBack={({text, method}) => method === "change" && updateUser(_id, {name: text || ""})}>
						<h1 className={"name block"}>{name}</h1>
					</EditableText>
					<div className="joined asterisk">Joined {formattedDate(new Date(joined))}</div>
					<div className="bar even">
						<Link to={HOME_DIR}>
							<button className="icon-logout inverse-small-button" onClick={logout}>
								Logout
							</button>
						</Link>
						<button className="icon-trash inverse-small-button warning-button" onClick={handleDelete}>
							Delete Account
						</button>
					</div>
				</div>
			</div>
			<DeckFeed direct={decks.filter(d => d.author === _id)} />
		</div>
	)
})

// const Inheritence = _ => {
// 	const [chosen, choose] = useState(null)
// 	return (
// 		<div className="block">
// 			<h4>Would you like another user to inherit your stuff?</h4>
// 			<div className="col">
// 				{followed.map(f => (
// 					<div onClick={choose(f)}>{creator(f).name}</div>
// 				))}
// 			</div>
// 		</div>
// 	)
// }
