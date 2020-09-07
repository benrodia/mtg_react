import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Login from "./Login"
import DeckFeed from "./DeckFeed"
import DeckTile from "./DeckTile"
import NewDeck from "./NewDeck"

const {HOME_DIR} = utilities

export default connect(({main: {users, decks}, auth: {user: {_id, slug, name, followed}, isAuthenticated}}) => {
	return {
		_id,
		slug,
		name,
		followed,
		users,
		decks,
		isAuthenticated,
	}
}, actions)(({_id, slug, name, followed, users, decks, setPage, isAuthenticated, newDeck, openModal, loadDecks}) => {
	const [flags, setFlags] = useState(["others"])
	const [activeForm, setActiveForm] = useState(null)

	useEffect(_ => {
		loadDecks()
	}, [])

	const handleFlags = flag => {
		setFlags(flags.includes(flag) ? flags.filter(f => f !== flag) : [...flags, flag])
	}

	return (
		<div className="dash">
			<section className="hero">
				<div className="banner">
					<h1>ReactMTG</h1>
					<p>We make Magic™ happen fast!</p>
				</div>
				{isAuthenticated ? null : (
					<div className="log-in-form">
						<div className="bar center mini-spaced-bar">
							<button
								className={`${activeForm === "in" && "selected"}`}
								onClick={_ => setActiveForm(activeForm === "in" ? null : "in")}>
								Log In
								<span className="icon-user" />
							</button>
							<button
								className={`${activeForm === "up" && "selected"}`}
								onClick={_ => setActiveForm(activeForm === "up" ? null : "up")}>
								Sign Up
								<span className="icon-user-add" />
							</button>
						</div>
						<Login activeForm={activeForm} />
					</div>
				)}
			</section>
			{!isAuthenticated ? null : (
				<DeckFeed direct={decks.filter(d => d.author === _id)}>
					<div className="block">
						<div className="bar even spaced-bar">
							<Link to={`${HOME_DIR}/user/${slug}`}>
								<h2 className="inverse-button ">{name}'s Decks</h2>
							</Link>
							<button
								className="success-button new-deck bar even mini-spaced-bar"
								onClick={_ => openModal({title: "New Deck", content: <NewDeck />})}>
								<span className="icon-plus" />
								<div>New Deck</div>
							</button>
						</div>
					</div>
				</DeckFeed>
			)}
			<DeckFeed flags={flags}>
				<div className="block">
					<div className="mini-block">
						<div className="bar even">
							<h2>Most Recent Decks</h2>
						</div>
						<div className="filter-flags bar even mini-spaced-bar">
							<h5>Show Only : </h5>
							<button
								className={`small-button ${flags.includes("published") && "selected"}`}
								onClick={_ => handleFlags("published")}>
								Published
							</button>
							{followed && followed.length ? (
								<button
									className={`small-button ${flags.includes("followed") && "selected"}`}
									onClick={_ => handleFlags("followed")}>
									Followed Users
								</button>
							) : null}
							<button
								className={`small-button ${flags.includes("helpWanted") && "selected"}`}
								onClick={_ => handleFlags("helpWanted")}>
								Help Wanted
							</button>
						</div>
					</div>
				</div>
			</DeckFeed>
		</div>
	)
})
