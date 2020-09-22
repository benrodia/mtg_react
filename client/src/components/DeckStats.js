import React, {useState} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Graph from "./Graph"
import Sticky from "./Sticky"

const {Q, sum, average, titleCaps, TCGplayerMassEntryURL} = utilities

export default connect(
	({
		auth: {
			isAuthenticated,
			user: {_id},
		},
		main: {legalCards},
		deck: {list, author},
		filters: {showPrice},
	}) => {
		return {isAuthenticated, author, showPrice, _id, legalCards, list}
	},
	actions
)(
	({
		offset,
		isAuthenticated,
		author,
		showPrice,
		_id,
		list,
		legalCards,
		changeFilters,
		openModal,
	}) => {
		const [graph, setGraph] = useState("pie")

		return (
			<div className="stats">
				<div className="price-stats">
					<h3>Est. List Price:</h3>
					<h2 className="total">
						${sum(list.map(c => c.prices.usd)).toFixed(2)} /{" "}
						{sum(list.map(c => c.prices.tix)).toFixed(2)} TIX
						{!list.filter(c => !c.prices.usd).length ? null : (
							<p className="asterisk">
								*Missing price data for {list.filter(c => !c.prices.usd).length}{" "}
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

				<br />
				<br />
				<Sticky offset={offset}>
					<div className="stats-header bar even mini-spaced-bar">
						<h3>Statistics </h3>
						<button
							title="Display Card Prices"
							className={`small-button icon-toggle-${
								showPrice ? "on selected" : "off"
							}`}
							onClick={_ => changeFilters("showPrice", !showPrice)}>
							Card Price
						</button>
						<button
							className={`small-button icon-chart-${
								graph !== "pie" ? "bar" : "pie"
							}`}
							onClick={_ => setGraph(graph === "pie" ? "bar" : "pie")}>
							{titleCaps(graph)}
						</button>
					</div>
				</Sticky>
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
