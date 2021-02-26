import React, {useState, useEffect, useRef} from "react"
import {Link, useParams, useLocation, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"

import Icon from "./Icon"
import DeckInfo from "./DeckInfo"
import Hamburger from "./Hamburger"
import DownloadFile from "./DownloadFile"

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
	creator,
	formattedDate,
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
		author,
		created,
		updated,
		board,
		sets,
		basic,
		newMsg,
		openModal,
		changeDeck,
		changeFilters,
		addCard,
		closeDeck,
		saveDeck,
		openDeck,
		cloneDeck,
		deleteDeck,
	}) => {
		const [contextLink, setContextLink] = useState(null)
		const {pathname} = useLocation()

		contextLink && useHistory().push(contextLink)

		const rightBar = _ => (
			<div className="quick-import flex-row even thin-block">
				{!canEdit() ? null : (
					<button
						className={`small-button ${
							canPublish(list, format) ? "success" : ""
						}-button max icon-ok`}
						onClick={saveDeck}>
						Save
					</button>
				)}
				<button
					className="small-button icon-download"
					onClick={_ =>
						openModal({title: "Download File", content: <DownloadFile />})
					}>
					Download
				</button>
			</div>
		)
		// 		<button
		// 	className="small-button icon-clipboard"
		// 	onClick={_ => {
		// 		navigator.clipboard.writeText(textList(list, true))
		// 		newMsg("Copied list to clipboard!", "success")
		// 	}}>
		// 	Copy to Clipboard
		// </button>
		// {!canEdit() ? null : (
		// 	<button
		// 		className="inverse-small-button warning-button icon-trash"
		// 		onClick={_ => deleteDeck(_id)}>
		// 		Delete Deck
		// 	</button>
		// <h4>{published ? "Published" : "Draft"} by</h4>
		// )}

		// <Link to={`${HOME_DIR}/deck/${slug}`}>
		// </Link>
		const Title = _ => (
			<div className="col title mini-spaced-col">
				<div
					className="splash"
					style={{
						background: `url(${feature}) no-repeat center center`,
						backgroundSize: "cover",
					}}>
					<span className="grad" />
				</div>
				<div className=" icon flex-row even mini-spaced-bar">
					<PieChart
						data={COLORS("fill").map((color, i) => {
							return {value: colors[i], color}
						})}
						startAngle={270}
					/>
					<span>
						<h1 className="sub-title ">{name || "Untitled"}</h1>
						<h4>{titleCaps(format)}</h4>
					</span>
				</div>
			</div>
		)
		// 		<Link to={`${HOME_DIR}/user/${creator(author).slug}`}>
		// 	<button className="user-button">{creator(author).name}</button>
		// </Link>

		return (
			<div className="deck-nav flex-row spread even">
				<div className="bar even spaced-bar">
					<Title />
					<div className="play-button">
						<Link to={`${HOME_DIR}/playtest/lobby`}>
							<button className="icon-play" title="Playtest Deck" />
						</Link>
					</div>
					<DeckInfo />
				</div>
				{!canEdit() ? null : (
					<div className="col end thin-pad">
						<div className="bar mini-spaced-bar">
							{unsaved ? (
								<Link to={`${HOME_DIR}/deck/${slug}`}>
									<button
										title="Save Deck"
										className={`small-button ${
											canPublish(list, format) ? "success" : ""
										}-button icon-help-circled`}
										onClick={saveDeck}>
										Save
									</button>
								</Link>
							) : (
								<Link to="/">
									<button
										className={`small-button warning-button disabled icon-cancel`}>
										Saved
									</button>
								</Link>
							)}
						</div>

						<button
							className="inverse-small-button warning-button icon-trash thin-pad"
							onClick={_ => {
								if (window.confirm("Delete Deck?")) {
									deleteDeck(_id)
									setContextLink(HOME_DIR)
								}
							}}>
							Delete
						</button>
					</div>
				)}
			</div>
		)
	}
)
// <div className="col">
// 	{!canEdit() ? null : (
// 		<Link to={`${HOME_DIR}/deck/${slug}/build`}>
// 			<button className="icon-search" title="Search For Cards" />
// 		</Link>
// 	)}
// </div>

// <Link to={`${HOME_DIR}/deck/${slug}`}>
// 	<h3 className="sub-title bar even mini-spaced-bar">
// 		<span className="icon">
// 			<PieChart
// 				data={COLORS("fill").map((color, i) => {
// 					return {value: colors[i], color}
// 				})}
// 				startAngle={270}
// 			/>
// 		</span>
// 		{name || "Untitled"}
// 	</h3>
// </Link>
// <Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
// 	<button
// 		className={`small-button icon-play ${
// 			useLocation().includes("/playtest") && "selected"
// 		}`}>
// 		Playtest
// 	</button>
// </Link>

// {!unsaved ? null : (
// 	<button
// 		className={`small-button ${
// 			canPublish(list, format) ? "success" : ""
// 		}-button max icon-ok`}
// 		onClick={saveDeck}>
// 		Save
// 	</button>
// )}

// <Link to={`${HOME_DIR}/deck/${slug}`}>
// 	<button
// 		className={`small-button ${
// 			pathname.includes("/playtest") ||
// 			pathname.includes("/build") ||
// 			"selected"
// 		}`}></button>
// </Link>
