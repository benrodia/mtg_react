import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import NewDeck from "./NewDeck"
import DeckFeed from "./DeckFeed"
import AdvancedFilters from "./AdvancedFilters"
import AdvancedField from "./AdvancedField"
import BoardFilters from "./BoardFilters"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import Loading from "./Loading"
import CounterInput from "./CounterInput"

const {
	BOARDS,
	COLORS,
	ADVANCED_GREPS,
	OPs,
	formatManaSymbols,
	filterColors,
	formatText,
	filterAdvanced,
	audit,
	Q,
	rnd,
	sum,
	titleCaps,
	paginate,
	advancedFields,
	getAllCardTypes,
	itemizeDeckList,
} = utilities
export default connect(
	({main: {cardData, decks}, filters: {board, advanced}, deck}) => {
		return {cardData, decks, board, advanced, deck}
	},
	actions
)(
	({
		deck,
		decks,
		cardData,
		board,
		advanced,
		addCard,
		changeAdvanced,
		openModal,
		newMsg,
		getCardData,
	}) => {
		const {interested} = advanced
		return (
			<div className="col ">
				<div className="bar even mini-spaced-bar">
					<h2>Deck</h2>
					<button
						className="icon-folder-open"
						onClick={_ =>
							openModal({
								title: "Open Deck",
								content: <DeckFeed you context="build" />,
							})
						}>
						Open
					</button>
					<button
						className="icon-plus"
						onClick={_ =>
							openModal({
								title: "New Deck",
								content: <NewDeck cards={interested} />,
							})
						}>
						New
					</button>
				</div>
				{deck._id ? (
					<div className="deck-preview">
						<h3>{deck.name}</h3>
						<BoardFilters minified />
					</div>
				) : (
					<Loading
						anim={"none"}
						spinner={" "}
						subMessage={"No Deck Selected"}
					/>
				)}
				<div className="interested block">
					<div className="bar even mini-spaced-bar">
						<h2>Interested</h2>
						{!interested.length || !deck._id ? null : (
							<button
								className="small-button success-button"
								onClick={_ => {
									addCard(interested)
									changeAdvanced({interested: []})
								}}>
								Add All
							</button>
						)}
						{!interested.length ? null : (
							<button
								className="inverse-small-button warning-button"
								onClick={_ =>
									window.confirm("Are you sure?") &&
									changeAdvanced({interested: []})
								}>
								Clear
							</button>
						)}
					</div>
					<div className="inner">
						{itemizeDeckList(interested).map(c => (
							<div key={c[0].id} className="mini-block item bar even">
								<button
									className="icon-cancel small-button warning-button"
									onClick={_ =>
										changeAdvanced({
											interested: interested.filter(int => int.id !== c[0].id),
										})
									}
								/>
								<CardControls card={c[0]} cardHeadOnly />
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}
)
