import React, {useEffect, useState} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import {v4 as uuid} from "uuid"
import actions from "../actions"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import utilities from "../utilities"
import ContextMenu from "./ContextMenu"
import ToolTip from "./ToolTip"

const {
	HOME_DIR,
	CARD_SLEEVES,
	COLORS,
	sum,
	canEdit,
	creator,
	textList,
	snip,
	pluralize,
} = utilities

export default connect(({settings: {player}, auth: {user}}) => {
	return {user, player}
}, actions)(
	({
		noLink,
		deck,
		user,
		player,
		newMsg,
		openDeck,
		deleteDeck,
		addCart,
		openModal,
		changeSettings,
	}) => {
		const {
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
			complete,
			views,
			likes,
			tags,
			desc,
		} = deck
		const [contextLink, setContextLink] = useState(null)
		const colorData =
			colors &&
			COLORS().map((color, i) => {
				return {label: "", value: colors[i], color: color.fill}
			})

		const deckLink = `${HOME_DIR}/deck/${slug}`

		if (contextLink) {
			if (noLink) {
				openDeck(slug, true, player)
				openModal(null)
			} else useHistory().push(contextLink)
			setContextLink(null)
		}

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
							callBack: _ => setContextLink(`${HOME_DIR}/playtest/lobby`),
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
							auth: _ => canEdit(author),
						},
					]}>
					<div className="flex-row">
						<span className="point" onClick={_ => setContextLink(deckLink)}>
							<img
								className="feature"
								src={feature || CARD_SLEEVES["_basic.png"]}
								alt=""
							/>
							<div className="pie">
								<PieChart data={colorData} startAngle={270} />
							</div>
						</span>
						<div className="play-button">
							<button
								onClick={_ => {
									setContextLink(`${HOME_DIR}/playtest/lobby`)
									openDeck(slug)
									// changeSettings("players", [
									// 	{type: "HMN", id: uuid(), deck, hand: []},
									// ])
								}}
								className={"icon-play"}
								title="Playtest Deck"
							/>
						</div>
					</div>
					<div className="info spread col">
						<div className="mini-spaced-col">
							<h3
								onClick={_ => setContextLink(deckLink)}
								className={`deck-title point ${
									helpWanted >= 3 && "icon-exclamation attention"
								}`}>
								{name}
							</h3>
							<div className="bar even mini-spaced-bar">
								<h5 className="">{format}</h5>
								{tags.map(t => (
									<div className="tag">{t}</div>
								))}
							</div>
							<p className="asterisk break">{snip(desc, 100)}</p>
						</div>
						<div className="bar mini-spaced-bar spread">
							<button
								onClick={_ =>
									setContextLink(`${HOME_DIR}/user/${creator(author).slug}`)
								}
								className="user-button">
								{creator(author).name}
							</button>
							<div className="bar mini-spaced-bar">
								<ToolTip
									message={complete ? "Completed deck" : "Incomplete deck"}>
									<span className={`icon-${complete ? "ok" : "attention"}`} />
								</ToolTip>
								<ToolTip message={`${views} ${pluralize("view", views)}`}>
									<span className="icon-eye">{views}</span>
								</ToolTip>
								<ToolTip
									message={`${likes} ${pluralize("like", likes)}${
										(user.liked || []).includes(_id) ? ", including you" : ""
									}`}>
									<span
										className={`icon-thumbs-up ${
											(user.liked || []).includes(_id) && "active"
										}`}>
										{likes}
									</span>
								</ToolTip>
							</div>
						</div>
					</div>
				</ContextMenu>
			</div>
		)
	}
)
