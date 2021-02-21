import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Graph from "./Graph"
import Sticky from "./Sticky"
import DownloadFile from "./DownloadFile"

const {
	HOME_DIR,
	Q,
	sum,
	average,
	titleCaps,
	TCGplayerMassEntryURL,
	textList,
	canEdit,
	getDeckDynamics,
} = utilities

export default connect(
	({
		auth: {
			isAuthenticated,
			user: {_id},
		},
		main: {legalCards},
		deck: {list, author, clone},
		filters: {showPrice},
	}) => {
		return {isAuthenticated, author, clone, showPrice, _id, legalCards, list}
	},
	actions
)(
	({
		isAuthenticated,
		author,
		clone,
		showPrice,
		_id,
		list,
		legalCards,
		changeFilters,
		openModal,
		newMsg,
		cloneDeck,
	}) => {
		const [graph, setGraph] = useState("pie")
		const [dynamics, setDynamics] = useState({})
		// useEffect(
		// 	_ => {
		// 		if (list[0]&&list[0].object&&!dynamics) {}
		// 		setDynamics(getDeckDynamics(list))
		// 	},
		// 	[list]
		// )

		return (
			<div className="stats">
				<div className="price-stats">
					<h3>Est. List Price:</h3>
					<h2 className="total">
						${sum(list.map(c => c.prices.usd)).toFixed(2)} /{" "}
						{sum(list.map(c => c.prices.tix)).toFixed(2)} TIX
						{!list.filter(c => !c.prices.usd).length ? null : (
							<p className="asterisk">
								*Missing prices for {list.filter(c => !c.prices.usd).length}{" "}
								cards.
							</p>
						)}
					</h2>
					<span className="bar even">
						<a target="_blank" href={TCGplayerMassEntryURL(list)}>
							<button className="icon-basket success-button small-button">
								Shop TCGplayer
							</button>
						</a>
						<p className="asterisk">*Unaffiliated Link</p>
					</span>
				</div>
				<div className="graphs bar spaced-grid">
					<Graph graphType={graph} dataType={"Color"} />
					<Graph graphType={graph} dataType={"Type"} />
					<Graph graphType={graph} dataType={"CMC"} />
					<div className="block">
						<h4>
							Average CMC{" "}
							{average(
								Q(list, "type_line", "land", false).map(l => l.cmc)
							).toFixed(2)}
						</h4>
						<h4>
							{Q(Q(list, "board", "main"), "type_line", "land").length}/
							{Q(list, "board", "main").length} (
							{Math.round(
								(100 *
									Q(Q(list, "board", "main"), "type_line", "land").length) /
									Q(list, "board", "main").length
							)}
							%) Lands
						</h4>
					</div>
				</div>
			</div>
		)
	}
)
