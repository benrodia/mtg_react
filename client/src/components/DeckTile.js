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
}, actions)(
	({
		deck: {_id, author, name, list, format, pie, slug, updated, feature},
		user,
		isAuthenticated,
		openDeck,
		deleteDeck,
	}) => {
		const canEdit = author === user._id && isAuthenticated

		const colorData = COLORS().map(color => {
			const value = sum(list.map(c => c.mana_cost.split("").filter(i => i === color.symbol).length))
			return {label: color.name, value, color: color.fill}
		})
		const featureImg = feature || (list[0] && list[0].image_uris.art_crop)

		return (
			<div key={_id} className={"deck-tile bar "}>
				<Link to={`${HOME_DIR}/deck/${slug}`}>
					<span className="bar to-build mini-spaced-bar">
						<span className="feature icon">
							<div className="pie">
								<PieChart data={colorData} startAngle={270} />
							</div>
							<img src={featureImg} alt="" />
						</span>
						<div className="info">
							<h3 className="deck-title">{name}</h3>
							<span className="updated-at">Updated {ago(new Date(updated))}</span>
							<p className="tag">{format}</p>
						</div>
					</span>
				</Link>
				<div className="links">
					<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
						<button className="small-button">Test</button>
					</Link>
					{!canEdit ? null : (
						<button className="warning-button inverse-small-button icon-trash" onClick={_ => deleteDeck(_id)} />
					)}
				</div>
			</div>
		)
	}
)
