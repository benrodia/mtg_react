import React, {useEffect} from "react"
import {useLocation} from "react-router-dom"
import {connect} from "react-redux"
import utilities from "../utilities"

const {CARD_SLEEVES, formatManaSymbols, formatText, subType} = utilities

export default connect(
	({
		main: {page},
		settings: {sleeves},
		filters: {sortBy, showTypes, showPrice},
	}) => {
		return {page, sleeves, sortBy, showTypes, showPrice}
	},
	null
)(
	({
		card,
		desc,
		faceDown,
		imgSize,
		sleeves,
		cardHeadOnly,
		showPrice,
		showTypes,
		sortBy,
		page,
	}) => {
		const {face_down, flipped, tapped, prices, card_faces} = card
		const {
			mana_cost,
			name,
			type_line,
			oracle_text,
			power,
			toughness,
		} = card_faces ? card_faces[flipped ? 1 : 0] : card
		const image_uris =
			card.image_uris ||
			(card_faces && card_faces[flipped ? 1 : 0].image_uris) ||
			{}

		const {pathname} = useLocation()

		const description = formatText(
			`${oracle_text.slice(0, 50)}${oracle_text.length > 50 ? "..." : ""}`
		)
		const USD = prices.usd ? `$${prices.usd}` : null
		const TIX = prices.tix ? `${prices.tix}tix` : null
		const price = (
			<p
				className="prices"
				style={{
					display:
						(!pathname.includes("playtest") && (USD || TIX) && showPrice) ||
						"none",
				}}>
				<b>{USD || "???"}</b> - <b>{TIX || "???"}</b>
			</p>
		)

		return cardHeadOnly ? (
			<div className={`card-head`}>
				<h4 className="name">{name}</h4>
				<p className="types">
					{power && type_line.includes("Creature")
						? `${power}/${toughness} - `
						: null}
					{subType(type_line)} {formatManaSymbols(mana_cost)}
				</p>
				{price}
				{!desc ? null : <p className="asterisk mini-block">{description}</p>}
			</div>
		) : (
			<>
				<img
					src={
						(faceDown || face_down
							? sleeves
							: image_uris && image_uris[imgSize || "normal"]) ||
						CARD_SLEEVES["_basic.png"]
					}
					className={`card-img`}
					style={{transform: tapped && "rotate(90deg)"}}
				/>
				{price}
			</>
		)
	}
)
