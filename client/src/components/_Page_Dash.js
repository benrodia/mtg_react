import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import {PieChart} from "react-minimal-pie-chart"
import {useDrag} from "react-dnd"
import Tilt from "react-tilt"

import DropSlot from "./DropSlot"
import Icon from "./Icon"
import Login from "./Login"
import CardControls from "./CardControls"
import ToolTip from "./ToolTip"
import PlayableTitle from "./PlayableTitle"
import DeckPreview from "./DeckPreview"

const logo = require("../imgs/mtggrip-logo-text.svg")

const {
	Q,
	HOME_DIR,
	COLORS,
	titleCaps,
	rnd,
	SUB_BANNERS,
	GREETINGS,
	generateRandomDeck,
	creator,
	pageButtons,
} = utilities

export default connect(
	({
		main: {cardData, cardCombos, users, decks},
		auth: {
			user: {_id, slug, name, followed},
			isAuthenticated,
		},
	}) => {
		return {
			_id,
			slug,
			name,
			followed,
			cardData,
			cardCombos,
			users,
			decks,
			isAuthenticated,
		}
	},
	actions
)(
	({
		_id,
		slug,
		name,
		followed,
		cardData,
		cardCombos,
		users,
		decks,
		setPage,
		isAuthenticated,
		newDeck,
		openModal,
		loadDecks,
		getUsers,
		addCart,
		logout,
	}) => {
		const [activeForm, setActiveForm] = useState("in")
		const [subBanner, setSubBanner] = useState(rnd(SUB_BANNERS))
		const [deckHighlights, setDeckHighlights] = useState([])

		useEffect(
			_ => {
				decks.length &&
					setDeckHighlights(
						rnd(
							decks.filter(d => d.list.length >= 60),
							3,
							true
						)
					)
			},
			[decks]
		)

		return (
			<div className="dash spaced-col">
				<section className="hero">
					<div className="banner spaced-col">
						<PlayableTitle />
					</div>
					<p>{subBanner}</p>
				</section>
				<section className="center col mini-spaced-col">
					{isAuthenticated ? (
						<div className="bar even spaced-bar">
							<h1>Welcome, {name}</h1>
							<button className="smaller-button" onClick={logout}>
								Logout
							</button>
						</div>
					) : (
						<div className="bar even spaced-bar">
							<h1>Hey, Stranger</h1>
							<Link to={`${HOME_DIR}/login`}>
								<button>Login</button>
							</Link>
						</div>
					)}
					<div className="bar dash-buttons center spaced-bar">
						{pageButtons.map(({icon, label, link, auth, desc}) => (
							<ToolTip message={desc}>
								<Tilt className={!auth || isAuthenticated || "disabled"}>
									<Link to={`${HOME_DIR}/${link}`}>
										<div className="dash-button center col spaced-col thin-pad">
											<Icon src={icon} />
											<span className="center">{label}</span>
										</div>
									</Link>
								</Tilt>
							</ToolTip>
						))}
					</div>
				</section>
				{deckHighlights.length ? (
					<section className="spaced-col">
						<h1 className="block center">Some Decks</h1>
						{deckHighlights.map(deck => (
							<DeckPreview deck={deck} />
						))}
					</section>
				) : null}
			</div>
		)
	}
)
