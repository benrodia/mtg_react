import React, {useEffect} from "react"
import {connect} from "react-redux"
import utilities from "../utilities"

const {CARD_SLEEVES, formatManaSymbols, subType} = utilities

export default connect(({main: {page}, settings: {sleeve}, filters: {sortBy, showTypes, showPrice}}) => {
	return {page, sleeve, sortBy, showTypes, showPrice}
}, null)(({card, faceDown, imgSize, sleeve, cardHeadOnly, showPrice, showTypes, sortBy, page}) => {
	const {face_down, flipped, tapped, prices, card_faces} = card
	const {mana_cost, name, type_line} = card_faces ? card_faces[flipped ? 1 : 0] : card
	const image_uris = card.image_uris || (card_faces && card_faces[flipped ? 1 : 0].image_uris) || {}

	const USD = prices.usd ? `$${prices.usd}` : null
	const TIX = prices.tix ? `${prices.tix}tix` : null
	const price = (
		<p className="prices" style={{display: (page === "Build" && (USD || TIX) && showPrice) || "none"}}>
			<b>{USD || "???"}</b> - <b>{TIX || "???"}</b>
		</p>
	)

	return cardHeadOnly ? (
		<div className={`card-head`}>
			<h4 className="name">{name}</h4>
			<p className="types">
				{subType(type_line)} {formatManaSymbols(mana_cost)}
			</p>
			{price}
		</div>
	) : (
		<>
			<img
				src={
					(faceDown || face_down ? sleeve : image_uris && image_uris[imgSize || "normal"]) || CARD_SLEEVES["_basic.png"]
				}
				className={`card-img`}
				style={{transform: tapped && "rotate(90deg)"}}
			/>
			{price}
		</>
	)
})
