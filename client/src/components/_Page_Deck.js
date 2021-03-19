import React, {useEffect, useRef, useState} from "react"
import {Link, useParams, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import Loading from "./Loading"
import DeckStats from "./DeckStats"
import DeckInfo from "./DeckInfo"
import DeckInfoEdit from "./DeckInfoEdit"

import CardTuner from "./CardTuner"
import BulkEdit from "./BulkEdit"
import BoardFilters from "./BoardFilters"
import BoardTabs from "./BoardTabs"
import Board from "./Board"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"

const {HOME_DIR, canEdit} = utilities

export default connect(
	({
		main: {decks, cardData},
		deck: {slug, list, desc},
		filters: {board, editing},
	}) => {
		return {
			decks,
			cardData,
			slug,
			list,
			desc,
			editing,
			board,
		}
	},
	actions
)(({slug, list, desc, editing, board, decks, cardData, openDeck, addCard}) => {
	const param = useParams().slug

	useEffect(
		_ => {
			if (decks.length && slug !== param) openDeck(param)
		},
		[param, slug, decks]
	)

	const edit = canEdit() && editing

	return !decks.length ? (
		<Loading message="Loading all decks..." />
	) : !slug ? (
		<Loading
			message="No deck here..."
			spinner=" "
			subMessage={
				<Link to={`${HOME_DIR}/deck/search`}>Return to decks page</Link>
			}
		/>
	) : (
		<>
			{edit ? <DeckInfoEdit /> : <DeckInfo />}
			<div className="deck-details">
				<div className="flex-row full-width spread mini-spaced-bar">
					<div className="side-bar">
						<CardTuner />
						<DeckStats />
					</div>
					<div className="main-bar max">
						{edit ? (
							<span className="quick-search">
								<BasicSearch
									options={cardData}
									searchable
									limit={5}
									placeholder={"Enter card names"}
									renderAs={c => (
										<CardControls card={c} cardHeadOnly />
									)}
									callBack={c => addCard(c, board)}
								/>
							</span>
						) : null}
						<BoardFilters />
						<BoardTabs />
						<Board />
						<div className="bar mini-spaced-bar">
							<div className="section fill">
								<Markdown>
									{desc.length
										? desc
										: "No description given. How Sad."}
								</Markdown>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
})
