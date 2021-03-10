import React, {useEffect, useRef, useState} from "react"
import {Link, useParams, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import DeckNav from "./DeckNav"
import Loading from "./Loading"
import DeckStats from "./DeckStats"
import DeckInfo from "./DeckInfo"
import DeckInfoEdit from "./DeckInfoEdit"

import CardTuner from "./CardTuner"
import BulkEdit from "./BulkEdit"
import BoardFilters from "./BoardFilters"
import BoardTabs from "./BoardTabs"
import Board from "./Board"

// const {
// } = utilities

export default connect(({main: {decks}, deck: {slug, desc}}) => {
	return {
		decks,
		slug,
		desc,
	}
}, actions)(({slug, desc, decks, openDeck}) => {
	const param = useParams().slug

	useEffect(
		_ => {
			if (decks.length && slug !== param) openDeck(param)
		},
		[param, slug, decks]
	)

	return (
		<>
			<DeckNav />
			<div className="deck-details">
				<div className="flex-row full-width spread mini-spaced-bar">
					<CardTuner />
					<div className="deck-area col start max">
						<BoardFilters />
						<BoardTabs />
						<Board />
						<DeckStats />
						<div className="block">
							<Markdown>{desc}</Markdown>
						</div>
					</div>
				</div>
			</div>
		</>
	)
})
// <BulkEdit />
// {pathname.includes("/build") ?

// <MdEditor
// 	value={desc}
// 	style={{height: "20rem"}}
// 	onChange={md => changeDeck("desc", md.text)}
// 	renderHTML={md => <Markdown>{md}</Markdown>}
// />
