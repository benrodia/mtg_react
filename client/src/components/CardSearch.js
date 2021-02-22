import React, {useEffect, useRef, useState} from "react"
import {Link, useParams, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import DeckNav from "./DeckNav"
import Loading from "./Loading"
import DeckStats from "./DeckStats"
import DeckInfo from "./DeckInfo"
import DeckInfoEdit from "./DeckInfoEdit"
import AdvancedFilters from "./AdvancedFilters"
import AdvancedField from "./AdvancedField"
import AdvancedResults from "./AdvancedResults"
import AdvancedCart from "./AdvancedCart"

import CardTuner from "./CardTuner"
import BulkEdit from "./BulkEdit"
import BoardFilters from "./BoardFilters"
import BoardTabs from "./BoardTabs"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import BasicSearch from "./BasicSearch"
import QuickSearch from "./QuickSearch"
import Card from "./Card"

const {
	rnd,
	HOME_DIR,
	COLORS,
	FILTER_TERMS,
	ADVANCED_GREPS,
	textList,
	canPublish,
	canEdit,
	canSuggest,
	advancedFields,
} = utilities

export default connect(
	({
		main: {decks, cardNames},
		deck,
		filters: {
			board,
			view,
			sortBy,
			advanced: {tags, quickSearch},
			searchBy,
		},
	}) => {
		return {
			decks,
			cardNames,
			...deck,
			board,
			view,
			sortBy,
			tags,
			quickSearch,
			searchBy,
		}
	},
	actions
)(
	({
		slug,
		allow_suggestions,
		suggestions,
		editing,
		unsaved,
		list,
		format,
		desc,
		published,
		feature,
		board,
		view,
		sortBy,
		tags,
		quickSearch,
		searchBy,
		decks,
		cardNames,
		openModal,
		addCard,
		openDeck,
		cloneDeck,
		changeDeck,
		deleteDeck,
		saveDeck,
		changeFilters,
		changeAdvanced,
	}) => {
		const param = useParams().slug
		const {pathname} = useLocation()
		const publishable = !published && canPublish(list, format)

		useEffect(
			_ => {
				openModal(null)
				if (decks.length && slug !== param) openDeck(param)
			},
			[slug, decks]
		)
		// <div className="sidebar col">
		// 	{canEdit() ? <DeckInfoEdit /> : <DeckInfo />}
		// 	<DeckStats />
		// </div>
		// <CardTuner />

		const Manage = _ => (
			<div className="flex-row">
				<div className="deck-area col">
					<BoardFilters />
					<BoardTabs />
					<Board />
				</div>
			</div>
		)
		const Build = _ => (
			<div className="advanced">
				<div className="mini-block">
					<h4>Tab</h4>
					<div className="flex-row max fill">
						<button
							className={`big-button ${searchBy === "info" && "selected"}`}
							onClick={_ => changeFilters("searchBy", "info")}>
							Info
						</button>
						<button
							className={`big-button ${searchBy === "quick" && "selected"}`}
							onClick={_ => changeFilters("searchBy", "quick")}>
							Manage
						</button>
						<button
							className={`big-button ${searchBy === "term" && "selected"}`}
							onClick={_ => changeFilters("searchBy", "term")}>
							Discover
						</button>
					</div>
				</div>
				<div className="advanced-search-results">
					<div className="inner">
						{searchBy === "info" ? (
							<>
								<DeckInfo />
								<DeckStats />
							</>
						) : searchBy === "quick" ? (
							<>
								<div className="flex-row full-width spread">
									<div className="mini-spaced-col">
										<QuickSearch />
										<BulkEdit />
									</div>
									<CardTuner />
								</div>
							</>
						) : searchBy === "term" ? (
							<>
								<AdvancedFilters />
								<AdvancedResults />
							</>
						) : null}
					</div>
				</div>
			</div>
		)
		// <AdvancedCart />

		return (
			<>
				<DeckNav />
				<div className="deck-details">
					<Build /> <Manage />
				</div>
			</>
		)
	}
)
// {pathname.includes("/build") ?

// <MdEditor
// 	value={desc}
// 	style={{height: "20rem"}}
// 	onChange={md => changeDeck("desc", md.text)}
// 	renderHTML={md => <Markdown>{md}</Markdown>}
// />
