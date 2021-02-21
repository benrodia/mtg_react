import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import {PieChart} from "react-minimal-pie-chart"
import {useDrag} from "react-dnd"
import Tilt from "react-tilt"

import DropSlot from "./DropSlot"
import Icon from "./Icon"
import Login from "./Login"
import CardControls from "./CardControls"
import ToolTip from "./ToolTip"
import PlayableTitle from "./PlayableTitle"

const logo = require("../imgs/mtggrip-logo-text.svg")

const {Q, HOME_DIR, COLORS, titleCaps, rnd, creator} = utilities

export default connect(({main: {cardData}}) => {
	return {cardData}
}, actions)(({deck, cardData}) => {
	const [seedCards, setSeedCards] = useState([])

	useEffect(
		_ => {
			if (cardData.length && deck) {
				setSeedCards(
					rnd(deck.list, 7, true).map(l =>
						cardData.find(c => c.name === l.name)
					)
				)
			}
		},
		[cardData, deck]
	)

	if (!(deck && seedCards.length)) return null

	const {name, list, format, author, slug, feature, colors} = deck

	return (
		<div className="deck-preview big-block center col deck-nav">
			<div className=" flex-row">
				<div className="col title mini-spaced-col">
					<Link to={`${HOME_DIR}/deck/${slug}`}>
						<div
							className="splash"
							style={{
								background: `url(${feature}) no-repeat center center`,
								backgroundSize: "cover",
							}}>
							<span className="grad" />
						</div>
						<div className=" icon flex-row even mini-spaced-bar">
							<PieChart
								data={COLORS("fill").map((color, i) => {
									return {value: colors[i], color}
								})}
								startAngle={270}
							/>
							<span>
								<h1 className="sub-title ">{name || "Untitled"}</h1>
								<h4>{titleCaps(format)}</h4>
							</span>
						</div>
					</Link>
					<Link to={`${HOME_DIR}/user/${creator(author).slug}`}>
						<div className="user-button">{creator(author).name}</div>
					</Link>
				</div>
				<div className="play-button">
					<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
						<ToolTip message="Play This Hand">
							<button className="icon-play" />
						</ToolTip>
					</Link>
				</div>
			</div>
			<div className="bar">
				{seedCards.map(c => (
					<CardControls card={c} />
				))}
			</div>
		</div>
	)
})
