import React, {useEffect, useRef} from "react"
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
import Icon from "./Icon"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Card from "./Card"
import ResolveSuggestions from "./ResolveSuggestions"

const {HOME_DIR, COLORS, textList, canPublish, sum, listDiffs, canEdit} = utilities

export default connect(
	({
		main: {legalCards, sets},
		deck: {list, preChanges, format, published, suggestions, allow_suggestions},
		filters: {board, basic},
	}) => {
		return {legalCards, sets, list, preChanges, format, published, suggestions, allow_suggestions, board, basic}
	},
	actions
)(
	({
		list,
		preChanges,
		format,
		published,
		suggestions,
		allow_suggestions,
		board,
		legalCards,
		sets,
		basic,
		newMsg,
		openModal,
		changeDeck,
		changeFilters,
		addCard,
		updateDeckList,
		cloneDeck,
	}) => {
		const helpTiers = [
			"No suggestions",
			"Allow suggestions from friends",
			"Allow any suggestions",
			'Advertise "Suggestions Wanted"',
		]

		const upToDate = !listDiffs(preChanges, list).changed
		const publishable = !published && upToDate && canPublish(list, format)
		const ManageList = (
			<div className="manage-list block bar even spaced-bar">
				<div className="search-bar">
					<div className="bar even mini-spaced-bar">
						<h4>Search Cards By</h4>
						<div className="bar even">
							<button
								className={`smaller-button ${basic.by === "name" && "selected"}`}
								onClick={_ => changeFilters("basic", {by: "name"})}>
								Name
							</button>
							<button
								className={`smaller-button ${basic.by === "oracle_text" && "selected"}`}
								onClick={_ => changeFilters("basic", {by: "oracle_text"})}>
								Text
							</button>
						</div>
					</div>
					<BasicSearch
						className="big"
						searchable
						searchBy={[basic.by]}
						unique
						orderBy={"name"}
						limit={10}
						options={legalCards}
						callBack={c => addCard(c, board)}
						placeholder={"Search All Cards"}
						renderAs={o => (
							<span className="bar even search-cards mini-spaced-bar">
								<Icon
									name={o.set_name}
									className={`${o.rarity === "common" ? "" : o.rarity}`}
									loader={o.set}
									src={!sets.length ? null : sets.filter(s => s.name === o.set_name)[0].icon_svg_uri}
								/>
								<Card card={o} cardHeadOnly />
							</span>
						)}
					/>
				</div>
				<div className="col mini-spaced-col">
					<button
						className="small-button"
						onClick={_ => openModal({title: "Advanced Search", content: <AdvancedSearch />})}>
						Advanced Search
					</button>
					<button
						className="small-button icon-upload"
						onClick={_ => openModal({title: "Bulk Edit", content: <BulkEdit showDiffs list={list} />})}>
						Bulk Edit
					</button>
				</div>
				<div className="mini-spaced-col">
					<BasicSearch
						self={helpTiers[allow_suggestions || 2]}
						options={helpTiers}
						callBack={p => changeDeck("allow_suggestions", helpTiers.indexOf(p))}
					/>
					<button
						className={`${(suggestions && suggestions.length) || "disabled"}`}
						onClick={_ => openModal({title: "Resolve Suggestions", content: <ResolveSuggestions />})}>
						Suggestions ({suggestions ? suggestions.length : 0})
					</button>
				</div>

				<div className=" mini-spaced-col">
					<div className="mini-spaced-bar bar full-width">
						<button
							className={`small-button ${canPublish(list, format) ? "success" : ""}-button max icon-${
								upToDate || canPublish(list, format) ? "ok" : "attention"
							} ${upToDate && "disabled"}`}
							onClick={_ => updateDeckList(true)}>
							{upToDate ? "Up To Date" : "Update List"}
						</button>
						<button
							className={`small-button warning-button icon-cancel min ${upToDate && "disabled"}`}
							onClick={_ => updateDeckList(false)}
						/>
					</div>
					<button
						className={`small-button full-width fill success-button ${publishable || " disabled"}`}
						onClick={_ => publishable && changeDeck("published", true)}>
						{published
							? "Published"
							: !upToDate
							? "Save Changes First"
							: canPublish(list, format)
							? "Publish!"
							: "Can't Publish"}
					</button>
				</div>
			</div>
		)
		return canEdit() ? ManageList : null
	}
)
