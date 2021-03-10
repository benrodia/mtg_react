import React, {useEffect, useState} from "react"
import {Link, useParams, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"

import Loading from "./Loading"
import Login from "./Login"
import DeckFeed from "./DeckFeed"
import DeckTile from "./DeckTile"
import Settings from "./Settings"
import EditProfile from "./EditProfile"

const {HOME_DIR, formattedDate, canEdit, pluralize, rnd, getArt} = utilities

export default connect(
	({main: {cardData, decks, users}, auth: {isAuthenticated, user}}) => {
		return {
			cardData,
			decks,
			users,
			isAuthenticated,
			user,
		}
	},
	actions
)(
	({
		cardData,
		decks,
		users,
		openModal,
		isAuthenticated,
		user,
		updateUser,
		newDeck,
		logout,
		deleteAccount,
		followUser,
	}) => {
		const {slug} = useParams()
		const [
			{name, image, joined, _id, followed, liked, bio, respins, noUser},
			setUser,
		] = useState({})
		useEffect(
			_ => {
				setUser(users.filter(u => u.slug === slug)[0] || {noUser: true})
			},
			[slug, users]
		)

		const editOptions = (
			<div className="big-block center col">
				<div className="bar even center mini-spaced-bar">
					<Link to={HOME_DIR}>
						<button
							className="icon-logout inverse-small-button"
							onClick={logout}>
							Logout
						</button>
					</Link>
					<button
						className="icon-trash inverse-small-button warning-button"
						onClick={_ => {
							const rusure = window.confirm(
								"Are you super duper sure you want to delete your account??"
							)
							if (rusure) deleteAccount()
						}}>
						Delete Account
					</button>
				</div>
			</div>
		)
		const yourDecks = decks.filter(d => d.author === _id)

		return noUser ? (
			<Loading
				spinner={" "}
				message={"No User Here"}
				subMessage={<Link to={HOME_DIR}>Return To Home</Link>}
			/>
		) : (
			<div className="user">
				<div className="profile">
					<div className="tile bar even mini-spaced-bar center">
						<span className="avatar icon-user-circle-o"></span>
						<div className="col">
							<h1 className={"name"}>{name}</h1>
							<div className="joined asterisk">
								Joined {formattedDate(new Date(joined))}
							</div>
						</div>
						{isAuthenticated && _id !== user._id ? (
							<div
								className={`clicky-icon icon-star${
									user.followed.includes(_id) ? "" : "-empty"
								}`}
								onClick={_ => followUser(_id)}
							/>
						) : null}
					</div>
					{canEdit(_id) ? editOptions : null}
				</div>
				<div className="block bio">
					<div className="block bar even center mini-spaced-bar">
						<h3>Bio</h3>
						{canEdit(_id) ? (
							<button
								className="small-button icon-pencil"
								onClick={_ =>
									openModal({
										title: "Edit Bio",
										content: (
											<EditMarkDown
												text={bio || ""}
												callBack={b => {
													openModal(null)
													updateUser({bio: b})
												}}
											/>
										),
									})
								}></button>
						) : null}
					</div>
					<div className="text-block center">
						<Markdown>{bio || ""}</Markdown>
					</div>
				</div>

				<DeckFeed who={_id} />
			</div>
		)
	}
)
const EditMarkDown = ({name, text, callBack}) => {
	const [t, setT] = useState(text)

	return (
		<div className="col block">
			<MdEditor
				value={t}
				style={{height: "20rem"}}
				onChange={md => setT(md.text)}
				renderHTML={md => <Markdown>{md}</Markdown>}
			/>

			<button
				className={`mini-block success-button ${t === text && "disabled"}`}
				onClick={_ => callBack(t)}>
				Apply Changes
			</button>
		</div>
	)
}
