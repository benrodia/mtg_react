import React, {useEffect, useRef, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import AdvancedSearch from "./AdvancedSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import BulkEdit from "./BulkEdit"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Card from "./Card"
import DeckInfo from "./DeckInfo"
import ManageList from "./ManageList"

const {HOME_DIR, COLORS, textList, canPublish, sum} = utilities

export default connect(({main: {decks}, deck}) => {
	return {decks, deck}
}, actions)(({deck, decks, openModal, newMsg, openDeck, cloneDeck}) => {
	const stickyRef = useRef(null)
	const [offset, setOffset] = useState(0)
	const {slug} = useParams()

	useEffect(
		_ => {
			if (decks.length && deck.slug !== slug) openDeck(slug)
		},
		[slug, decks]
	)

	useEffect(
		_ => {
			if (stickyRef.current) setOffset(stickyRef.current.clientHeight)
		},
		[stickyRef]
	)

	return (
		<div className="builder">
			<section className="deck-area">
				<div ref={stickyRef}>
					<DeckInfo />
					<ManageList />
				</div>
				<BoardFilters offset={offset} />
				<Board />
			</section>
			<section className="side-bar">
				<div className="quick-import">
					<div className="playtest-button">
						<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
							<button className="success-button">Playtest Deck</button>
						</Link>
					</div>
					<div className="exports col">
						<button
							className="small-button icon-download"
							onClick={_ => openModal({title: "Download File", content: <DownloadFile />})}>
							Download File
						</button>
						<button
							className="small-button icon-docs"
							onClick={_ => {
								navigator.clipboard.writeText(textList(deck.list))
								newMsg("Copied list to clipboard!", "success")
							}}>
							Copy to Clipboard
						</button>
						{deck.clone ? (
							<Link to={`${HOME_DIR}/deck/${deck.clone}`}>
								<button className="small-button success-button fill">Cloned! Open Deck</button>
							</Link>
						) : (
							<button className="small-button" onClick={_ => cloneDeck()}>
								Clone Deck
							</button>
						)}
					</div>
				</div>
				<DeckStats offset={offset} />
			</section>
		</div>
	)
})
