import React, {useState, useEffect, useRef} from "react"
import {useDrag} from "react-dnd"
import {withRouter, useLocation, Link} from "react-router-dom"
import {ItemTypes} from "../constants/data"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Loading from "./Loading"

const {getCardFace} = utilities

export default withRouter(
	connect(({main: {pos}}) => {
		return {pos}
	}, actions)(({message, card, pos, children, context, className}) => {
		const [l, t, w, h] = pos

		const Obj = _ =>
			card ? (
				<div
					className="tool-tip hover-card"
					style={{
						left: l - (l > w - 228 ? 228 : 0),
						top: t - (t < 160 ? -160 : t > h - 160 ? 180 : 0),
					}}>
					<img src={getCardFace(card).image_uris.normal} alt={card.name} />
					<div className="bar even mini-spaced-bar thin-pad">
						<h4>{card.set_name}</h4>
						<h4>${(card.prices && card.prices.usd) || "???"}</h4>
					</div>
				</div>
			) : message ? (
				<div
					className="tool-tip message"
					style={{
						left: l - (l > w - 160 ? 160 : 0),
						top: t - (t < 60 ? -60 : t > h - 60 ? 80 : 0),
					}}>
					{message}
				</div>
			) : null

		return (
			<span className={`tool-tip-container ${className || ""}`}>
				{children}
				<Obj />
			</span>
		)
	})
)
// ({card.released_at.split("-")[0]})
// <div className="card-controls">{children}</div>
// <p className="prices">
// 		<b>
// 			${card.prices && card.prices.usd ? `${card.prices.usd}` : "???"}
// 		</b>
// 	</p>
