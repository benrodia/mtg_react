import React, {useState} from "react"
import {PieChart} from "react-minimal-pie-chart"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Graph from "./Graph"
const {
	Q,
	COLORS,
	sum,
	average,
	rem,
	log,
	titleCaps,
	pluralize,
	FILTER_TERMS,
	filterCardType,
	TCGplayerMassEntryURL,
} = utilities

export default connect(({auth: {isAuthenticated, user: {_id}}, main: {legalCards}, deck: {list, author}}) => {
	return {isAuthenticated, author, _id, legalCards, list}
}, actions)(({isAuthenticated, author, _id, list, legalCards, changeFilters, openModal}) => {
	const canEdit = isAuthenticated && author === _id

	const [graph, setGraph] = useState("pie")

	return (
		<div className="stats">
			<div className="price-stats">
				<h3>Total List Price:</h3>
				<h2 className="total">
					${sum(list.map(c => c.prices.usd)).toFixed(2)} / {sum(list.map(c => c.prices.tix)).toFixed(2)} TIX
					{!list.filter(c => !c.prices.usd).length ? null : (
						<p className="asterisk">*Missing price data for {list.filter(c => !c.prices.usd).length} cards.</p>
					)}
				</h2>
				<span className="bar even">
					<a target="_blank" href={TCGplayerMassEntryURL(list)}>
						<button className="icon-tag success-button small-button">Shop TCGplayer</button>
					</a>
					<p className="asterisk">*Unaffiliated Link</p>
				</span>
			</div>

			<br />
			<br />

			<div className="bar even mini-spaced-bar">
				<h2>Statistics </h2>
				<button
					className={`small-button icon-chart-${graph !== "pie" ? "bar" : "pie"}`}
					onClick={_ => setGraph(graph === "pie" ? "bar" : "pie")}>
					{titleCaps(graph)}
				</button>
			</div>
			<Graph graphType={graph} dataType={"Color"} />
			<Graph graphType={graph} dataType={"Type"} />
			<Graph graphType={graph} dataType={"CMC"} />
			<div className="block">
				<h4>Average CMC {average(Q(list, "type_line", "land", false).map(l => l.cmc)).toFixed(2)}</h4>
				<h4>
					{Q(Q(list, "board", "main"), "type_line", "land").length}/{Q(list, "board", "main").length} (
					{Math.round(
						(100 * Q(Q(list, "board", "main"), "type_line", "land").length) / Q(list, "board", "main").length
					)}
					%) Lands
				</h4>
			</div>
		</div>
	)
})
