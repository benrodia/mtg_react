import React, {useEffect, useState} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import utilities from "../utilities"
import ContextMenu from "./ContextMenu"

const {
	HOME_DIR,
	CARD_SLEEVES,
	COLORS,
	sum,
	canEdit,
	creator,
	textList,
} = utilities

export default connect(
	null,
	actions
)(
	({
		deck: {
			_id,
			author,
			name,
			list,
			format,
			colors,
			slug,
			updated,
			feature,
			helpWanted,
		},
		newMsg,
		openDeck,
		deleteDeck,
		addCart,
	}) => {
		const [contextLink, setContextLink] = useState(null)
		const colorData =
			colors &&
			COLORS().map((color, i) => {
				return {label: "", value: colors[i], color: color.fill}
			})

		const deckLink = `${HOME_DIR}/deck/${slug}`

		if (contextLink) useHistory().push(deckLink)

		return (
			<div key={_id} className={"deck-tile"}>
				<ContextMenu
					options={[
						{
							label: "Open Deck",
							callBack: _ => setContextLink(deckLink),
						},
						{
							label: "Playtest Deck",
							callBack: _ => setContextLink(`${deckLink}/playtest`),
						},
						{
							label: "Copy List To Clipboard",
							callBack: _ => {
								navigator.clipboard.writeText(textList(list, true))
								newMsg("Copied list to clipboard!", "success")
							},
						},
						{
							label: "Delete Deck",
							color: "red",
							callBack: _ => deleteDeck(_id),
							auth: _ => canEdit(_id),
						},
					]}>
					<div className="flex-row">
						<Link to={deckLink}>
							<img
								className="feature"
								src={feature || CARD_SLEEVES["_basic.png"]}
								alt=""
							/>
							<div className="pie">
								<PieChart data={colorData} startAngle={270} />
							</div>
						</Link>
						<div className="play-button">
							<Link to={`${deckLink}/playtest`}>
								<button className=" icon-play" title="Playtest Deck" />
							</Link>
						</div>
					</div>
					<div className="info mini-spaced-col">
						<Link to={deckLink}>
							<h3
								className={`deck-title ${
									helpWanted >= 3 && "icon-exclamation attention"
								}`}>
								{name}
							</h3>
						</Link>
						<div className="bar even mini-spaced-bar">
							<p className="tag">{format}</p>
						</div>
						<div className="bar even mini-spaced-bar">
							<Link to={`${HOME_DIR}/user/${creator(author).slug}`}>
								<button className="user-button">{creator(author).name}</button>
							</Link>
							<p className="asterisk">Updated {ago(new Date(updated))}</p>
						</div>
					</div>
				</ContextMenu>
			</div>
		)
	}
)
