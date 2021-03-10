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
import Inspect from "./Inspect"

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
	createSlug,
} = utilities

export default connect(
	({
		main: {decks, cardData, cardPage},
		deck,
		filters: {
			board,
			view,
			sortBy,
			advanced: {quickSearch},
			searchBy,
		},
	}) => {
		return {
			decks,
			cardData,
			cardPage,
			...deck,
			board,
			view,
			sortBy,

			quickSearch,
			searchBy,
		}
	},
	actions
)(
	({
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

		quickSearch,
		searchBy,
		decks,
		cardData,
		cardPage,
		openModal,
		addCard,
		openDeck,
		cloneDeck,
		changeDeck,
		deleteDeck,
		saveDeck,
		changeFilters,
		changeAdvanced,
		getCardData,
	}) => {
		const {slug} = useParams()
		const {pathname} = useLocation()
		const slugCard = _ =>
			cardData.filter(c => createSlug(c.name) === slug)[0] || {fail: true}
		const [single, setSingle] = useState(cardPage.id ? cardPage : slugCard())
		const [fetching, setFetching] = useState(false)
		useEffect(
			_ => {
				if (cardData.length) {
					setSingle(slugCard())
				} else if (!fetching) {
					setFetching(true)
					getCardData()
				}
			},
			[cardData.length, slug]
		)

		return (
			<div className="card-page center start block">
				<div className="col main">
					{slug === "search" ? (
						<div className="card-search">
							<AdvancedFilters />
							<AdvancedResults />
						</div>
					) : !single.fail ? (
						<Inspect card={single} />
					) : (
						<Loading message="No Card Ere" />
					)}
				</div>
				<AdvancedCart />
			</div>
		)
	}
)
