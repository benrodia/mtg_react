import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import utilities from "../utilities"

const {HOME_DIR, COLORS, sum, canEdit, creator} = utilities

export default connect(
	null,
	actions
)(({deck: {_id, author, name, list, format, colors, slug, updated, feature, helpWanted}, openDeck, deleteDeck}) => {
	const colorData =
		colors &&
		COLORS().map((color, i) => {
			return {label: "", value: colors[i], color: color.fill}
		})

	return (
		<div key={_id} className={"deck-tile bar"}>
			<div className="bar mini-spaced-bar">
				<Link to={`${HOME_DIR}/deck/${slug}`}>
					<span className="feature icon">
						<div className="pie">
							<PieChart data={colorData} startAngle={270} />
						</div>
						<img src={feature} alt="" />
					</span>
				</Link>
				<div className="info" title={`${helpWanted >= 3 ? "All Suggestions Welcome! Come on in!" : ""}`}>
					<Link to={`${HOME_DIR}/deck/${slug}`}>
						<h3 className={`deck-title ${helpWanted >= 3 && "icon-exclamation attention"}`}>{name}</h3>
						<span className="updated-at">Updated {ago(new Date(updated))}</span>
					</Link>
					<div className="bar even mini-spaced-bar">
						<Link to={`${HOME_DIR}/user/${creator(author) && creator(author).slug}`}>
							<button className="inverse-button small-button">{creator(author) && creator(author).name}</button>
						</Link>
						<p className="tag">{format}</p>
					</div>
				</div>
			</div>
			<div className="links">
				<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
					<button className="small-button icon-play" title="Playtest Deck" />
				</Link>
				{!canEdit(author) ? null : (
					<button
						className="warning-button inverse-small-button icon-trash"
						onClick={_ => deleteDeck(_id)}
						title="Trash Deck"
					/>
				)}
			</div>
		</div>
	)
})
