import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import utilities from "../utilities"

const {HOME_DIR, COLORS, sum} = utilities

export default connect(({auth: {user, isAuthenticated}}) => {
	return {user, isAuthenticated}
}, actions)(({deck, user, isAuthenticated, openDeck, deleteDeck}) => {
	const {_id, author, name, format, pie, url, updated} = deck
	const canEdit = author === user._id && isAuthenticated

	const colorData = COLORS().map(color => {
		const value = sum(deck.list.map(c => c.mana_cost.split("").filter(i => i === color.symbol).length))
		return {label: color.name, value, color: color.fill}
	})

	return (
		<div key={_id} className={"deck-tile bar"}>
			<span className="bar to-build">
				<Link to={`${HOME_DIR}/build/${url}`}>
					<span className="thumbnail icon">
						<PieChart data={colorData} startAngle={270} />
					</span>
					<div className="info">
						<h3 className="deck-title">{name}</h3>
						<span className="updated-at">Updated {ago(new Date(updated))}</span>
						<p className="tag">{format}</p>
					</div>
				</Link>
			</span>
			<div className="links">
				<Link to={`${HOME_DIR}/test/${url}`}>
					<button className="small-button" onClick={_ => openDeck(_id)}>
						Test
					</button>
				</Link>
				{!canEdit ? null : <div className="warning-button small-button icon-trash" onClick={_ => deleteDeck(_id)} />}
			</div>
		</div>
	)
})
