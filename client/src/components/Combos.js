import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import CardControls from "./CardControls"

export default connect(({main: {cardData, cardPage}, deck: {list}}) => {
	return {cardData, cardPage, list}
}, actions)(
	({
		change,
		card,
		list,
		cardData,
		cardPage,
		changeCard,
		addCard,
		openModal,
	}) => {
		useEffect(_ => {}, [])
		const combosTypes = [
			{
				label: "Synergy",
				desc: "Card combos that mechanically work well together",
			},
			{
				label: "Infinite Value",
				desc:
					"Card combos that -WITHOUT OTHER OUTSIDE FACTORS- are able to produce an unlimited amount of card draw, mana, tokens, etc.",
			},
			{
				label: "Finite Value",
				desc:
					"Card combos that are able to freely produce draw, mana, tokens, etc. but require limited resources to use.",
			},
			{
				label: "Flavor",
				desc: "Card combos that have story or lore implications",
			},
			{
				label: "Non-bo",
				desc:
					"Card combos that work especially BADLY together, and only serve to negate or contradict the each other.",
			},
		]

		const objects = ["card", "keyword", "tag"]

		return (
			<div className="combos bar">
				<div className="subject">
					<CardControls card={cardPage} />
				</div>
				<div className="bar"></div>
			</div>
		)
	}
)
