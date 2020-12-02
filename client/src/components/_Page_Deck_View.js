import React, { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { connect } from "react-redux"
import ago from "s-ago"
import { PieChart } from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"

import Loading from "./Loading"
import BasicSearch from "./BasicSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Card from "./Card"
import DeckInfo from "./DeckInfo"
import DeckInfoEdit from "./DeckInfoEdit"
import Advanced from "./_Page_Deck_Build"

const {
	HOME_DIR,
	COLORS,
	textList,
	helpTiers,
	canPublish,
	canEdit,
	canSuggest,
	sum,
	advancedFields,
} = utilities

export default connect(({ main: { decks }, deck }) => {
	return { decks, ...deck }
}, actions)(
	({
		slug,
		allow_suggestions,
		suggestions,
		_id,
		editing,
		unsaved,
		list,
		format,
		published,
		decks,
		openModal,
		newMsg,
		openDeck,
		cloneDeck,
		changeDeck,
		deleteDeck,
		saveDeck,
	}) => {
		const param = useParams().slug
		const stickyRef = useRef(null)
		const publishable = !published && canPublish(list, format)

		const [offset, setOffset] = useState(0)
		const [viewMode, setViewMode] = useState("Preview")
		// const navStates = [
		// 	{name: "Search", icon: "search"},
		// 	{name: "Manage", icon: "pencil"},
		// 	{name: "Raw", icon: "code"},
		// 	{name: "Suggestions", icon: "comment"},
		// ]

		useEffect(
			_ => {
				openModal(null)
				if (decks.length && slug !== param) openDeck(param)
			},
			[slug, decks]
		)

		useEffect(
			_ => {
				if (stickyRef.current)
					setTimeout(_ => setOffset(stickyRef.current.clientHeight), 10)
			},
			[stickyRef.current, editing]
		)
		const inner =
			viewMode === "Preview" ? (
				<>
					<DeckInfo />
					<BoardFilters />
					<Board />
				</>
			) : viewMode === "Info" ? (
				<DeckInfoEdit />
			) : viewMode === "Manage" ? (
				<div className="deck-area">
					<BoardFilters offset={offset} />
					<Board />
				</div>
			) : viewMode === "Search" ? (
				<Advanced />
			) : null

		return !decks.filter(d => d.slug === param)[0] ? (
			<Loading spinner={" "} message={"No Deck Here"} />
		) : !list.length ? (
			<Loading message={"Loading Cards"} />
		) : (
			<div className="builder">
				<section className="deck-area">
					<div ref={stickyRef}>
						{!canEdit() ? null : (
							<div className="bar even mini-spaced-bar">
								<button
									className={`icon-eye ${viewMode === "Preview" && "selected"}`}
									onClick={_ => setViewMode("Preview")}>
									Preview
								</button>
								<button
									className={`icon-pencil ${viewMode === "Info" && "selected"}`}
									onClick={_ => setViewMode("Info")}>
									Edit Info
								</button>
								<button
									className={`icon-layers ${
										viewMode === "Manage" && "selected"
									}`}
									onClick={_ => setViewMode("Manage")}>
									Manage List
								</button>
								<button
									className={`icon-search ${
										viewMode === "Search" && "selected"
									}`}
									onClick={_ => setViewMode("Search")}>
									Search Cards
								</button>
								<button
									className={`small-button success-button ${
										publishable || " disabled"
									}`}
									onClick={_ => publishable && changeDeck("published", true)}>
									{published
										? "Published"
										: canPublish(list, format)
										? "Publish!"
										: "Can't Publish"}
								</button>

								<button
									className={`small-button icon-ok ${unsaved || "disabled"}`}
									onClick={_ => saveDeck()}>
									Save Changes
								</button>
								<button
									className={`inverse-small-button icon-trash ${
										unsaved || "disabled"
									}`}
									onClick={_ => openModal(null)}>
									Discard Changes
								</button>
							</div>
						)}
					</div>
					{inner}
				</section>
				<section className="side-bar">
					<DeckStats offset={offset} />
				</section>
			</div>
		)
	}
)

// <div className="build-nav bar mini-spaced-bar">
// 	{!editing ? null : (
// 		<div className="block">
// 			<h2>Deck List</h2>
// 		</div>
// 	)}
// </div>

// {navStates.map(({name, icon}) => (
// 	<button
// 		className={`icon-${icon} ${nav === name && "selected"}`}
// 		onClick={_ => setNav(name)}>
// 		{name}
// 	</button>
// ))}
