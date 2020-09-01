import React, {useState} from "react"
import {PieChart} from "react-minimal-pie-chart"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
const {Q, COLORS, sum, rem, log, titleCaps, pluralize, FILTER_TERMS, filterCardType} = utilities

export default connect(({deck: {list}, filters: {sortBy, customFields}}) => {
	return {list, sortBy, customFields}
}, actions)(({dataType, graphType, list, sortBy, customFields, changeFilters, openModal, optimizePrices}) => {
	const F = FILTER_TERMS.filter(t => t.name === dataType)[0] || {}

	const category = {
		...F,
		vals: dataType === "Custom" ? customFields.map(f => f.key) : F.vals || list.map(c => c[F.key]).sort(),
		valNames: F.valNames || list.unique(F.key).map(c => c[F.key]),
	}
	let [{name, key, vals, valNames, fill}, filtered, data] = [category, list, []]
	vals = vals.filter((v, i) => !!v && !!valNames[i]).slice(0, 20)
	if (dataType === "CMC") filtered = Q(list, "type_line", "land", false)
	for (var i = 0; i < vals.length; i++) {
		const val = vals[i]
		const value = filterCardType(filtered, category, val).length
		const C = base => parseInt((256 / 3 / (1 + vals.length)) * i * base)
		const color = fill ? fill[i] : `rgb(${C(3)},${C(1)},${C(2)})`

		data = [
			...data,
			{
				title: valNames[i],
				label: valNames[i],
				value,
				color,
				category,
			},
		]
		filtered = filtered.filter(f => !filterCardType(filtered, category, val).includes(f))
	}

	// const colorData = COLORS()
	// 	.map(({name, symbol, fill}) => {
	// 		const value = sum(list.map(c => c.mana_cost.split("").filter(i => i === symbol).length))
	// 		return {title: name, label: name, value, color: fill}
	// 	})
	// 	.filter(({value}) => value)

	const graph =
		graphType === "pie" ? (
			<div className="pie-graph">
				<PieChart
					data={data}
					label={({dataEntry}) => `${dataEntry.title} (${dataEntry.value})`}
					labelStyle={{
						fontSize: "5px",
						fill: "#FFFFFF",
					}}
					startAngle={270}
					labelPosition={60}
					viewBoxSize={[100, 100]}
				/>
			</div>
		) : graphType === "bar" ? (
			<div className="bar-graph">
				{data.map((d, i) => {
					const barRatio = d.value / Math.max(...data.map(_ => _.value))
					return !d.value ? null : (
						<span
							key={"bar_graph_" + d.label + d.value + i}
							className={`bar icon ms ms-${valNames[i].toLowerCase()}`}
							style={{
								width: barRatio * 100 + "%",
								background: d.color,
							}}>
							{titleCaps(d.label || "")} ({d.value})
						</span>
					)
				})}
			</div>
		) : null

	return (
		<div className="stat">
			<h3>Card {pluralize(dataType)}</h3>
			{graph}
		</div>
	)
})
