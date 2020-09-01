import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import BasicSearch from "./BasicSearch"
import utilities from "../utilities"

const {Q, COUNTERS} = utilities

export default connect(
	null,
	actions
)(({card, cardState}) => {
	const countersDisplay = Object.entries(card.counters).map(c => {
		return (
			<div key={c[0] + c[1]} className="counter" onClick={_ => changeCounters(c[0], -1)}>
				{c[0] === "PlusOne"
					? c[1] >= 0
						? `+${c[1]}/+${c[1]}`
						: `${c[1]}/${c[1]}`
					: c[1]
					? c[1] > 1
						? `${c[1]} ${c[0]}`
						: c[0]
					: null}
			</div>
		)
	})
	const changeCounters = (type, amt) => {
		cardState(card, "counters", {...card.counters, [type]: amt + (card.counters[type] || 0)})
	}

	const defaultCounter = Q(card, "type_line", "creature")
		? "PlusOne"
		: Q(card, "type_line", "planeswalker")
		? "Loyalty"
		: null

	return (
		<>
			<div className="add-counters">
				{!defaultCounter ? null : (
					<button className="smaller-button" onClick={() => changeCounters(defaultCounter, 1)}>
						{defaultCounter === "PlusOne" ? "+1/+1" : defaultCounter}
					</button>
				)}
				<BasicSearch
					searchable
					placeholder="Add Counter"
					options={COUNTERS}
					callBack={counter => changeCounters(counter, 1)}
				/>
			</div>
			<h3 className="counters-display">{countersDisplay}</h3>
		</>
	)
})
