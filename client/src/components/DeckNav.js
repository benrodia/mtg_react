import React, {useState, useEffect, useRef} from "react"
import {Link, useParams, useLocation} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import BasicSearch1 from "./BasicSearch1"
import BasicSearch from "./BasicSearch"
import ResolveSuggestions from "./ResolveSuggestions"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import BulkEdit from "./BulkEdit"
import Icon from "./Icon"
import Hamburger from "./Hamburger"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import Card from "./Card"

const {
	HOME_DIR,
	FORMATS,
	COLORS,
	textList,
	canPublish,
	sum,
	listDiffs,
	canEdit,
	helpTiers,
	titleCaps,
} = utilities

export default connect(({main: {sets}, deck, filters: {board, basic}}) => {
	return {
		sets,
		board,
		basic,
		...deck,
	}
}, actions)(
	({
		_id,
		name,
		desc,
		list,
		slug,
		colors,
		clone,
		suggestions,
		allow_suggestions,
		preChanges,
		format,
		feature,
		published,
		privacy,
		editing,
		unsaved,
		board,
		sets,
		basic,
		newMsg,
		openModal,
		changeDeck,
		changeFilters,
		addCard,
		saveDeck,
		openDeck,
		cloneDeck,
		deleteDeck,
	}) => {
		const {pathname} = useLocation()

		const DeckOptions = _ => (
			<div className="quick-import col thin-block">
				<button
					className="small-button icon-download"
					onClick={_ =>
						openModal({title: "Download File", content: <DownloadFile />})
					}>
					Download File
				</button>
				<button
					className="small-button icon-clipboard"
					onClick={_ => {
						navigator.clipboard.writeText(textList(list, true))
						newMsg("Copied list to clipboard!", "success")
					}}>
					Copy to Clipboard
				</button>
				{clone ? (
					<Link to={`${HOME_DIR}/deck/${clone}`}>
						<button className="small-button success-button fill">
							Cloned! Open Deck
						</button>
					</Link>
				) : (
					<button
						className="small-button icon-clone"
						onClick={_ => cloneDeck()}>
						Clone Deck
					</button>
				)}
				{!canEdit() ? null : (
					<button
						className="inverse-small-button warning-button icon-trash"
						onClick={_ => deleteDeck(_id)}>
						Delete Deck
					</button>
				)}
			</div>
		)

		return (
			<div className="bar even ">
				{!unsaved ? null : (
					<button
						className={`small-button ${
							canPublish(list, format) ? "success" : ""
						}-button max icon-ok`}
						onClick={saveDeck}>
						Save
					</button>
				)}
				<button
					className="icon-cancel warning-button inverse-small-button"
					onClick={_ => openDeck(null)}>
					Close
				</button>

				<Link to={`${HOME_DIR}/deck/${slug}`}>
					<h3 className="sub-title bar even mini-spaced-bar">
						<span className="icon">
							<PieChart
								data={COLORS("fill").map((color, i) => {
									return {value: colors[i], color}
								})}
								startAngle={270}
							/>
						</span>
						{name || "Untitled"}
					</h3>
				</Link>
				<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
					<button
						className={`small-button icon-play ${
							pathname.includes("/playtest") && "selected"
						}`}>
						Playtest
					</button>
				</Link>
			</div>
		)
	}
)
// <Link to={`${HOME_DIR}/deck/${slug}`}>
// 	<button
// 		className={`small-button icon-layers ${
// 			pathname.includes("/playtest") ||
// 			pathname.includes("/build") ||
// 			"selected"
// 		}`}></button>
// </Link>

// <Hamburger vert>
// 	<DeckOptions />
// </Hamburger>
