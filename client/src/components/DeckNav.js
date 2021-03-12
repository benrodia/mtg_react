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

		return (
			<div className="deck-nav flex-row spread even">
				<div className="bar even spaced-bar">
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
					<div className="play-button">
						<Link to={`${HOME_DIR}/playtest/lobby`}>
							<button className="icon-play" title="Playtest Deck" />
						</Link>
					</div>
					<DeckInfo />
				</div>
				<div className="col">
					{canEdit() && !editing ? (
						<button
							className="icon-pencil"
							onClick={_ => changeFilters("editing", true)}></button>
					) : null}
					<button
						className="icon-download"
						onClick={_ =>
							openModal({title: "Download File", content: <DownloadFile />})
						}></button>
					{canEdit() ? (
						<button
							className="inverse-button warning-button icon-trash"
							onClick={_ => deleteDeck(_id)}></button>
					) : null}
				</div>
			</div>
		)
	}
)
