import React, {useEffect, useState} from "react"
import {useLocation} from "react-router-dom"
import {connect} from "react-redux"
import utilities from "../utilities"
import Tilt from "react-tilt"
import {LazyLoadImage} from "react-lazy-load-image-component"
import Loading from "./Loading"
// import "react-lazy-load-image-component/src/effects/blur.css"

const {
	CARD_SLEEVES,
	formatManaSymbols,
	formatText,
	subType,
	getCardFace,
} = utilities

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
		quant,
		desc,
		faceDown,
		imgSize,
		sleeves,
		excerpt,
		cardHeadOnly,
		nameOnly,
		showPrice,
		showTypes,
		sortBy,
		page,
	}) => {
		const {
			face_down,
			flipped,
			tapped,
			prices,
			card_faces,
			mana_cost,
			name,
			type_line,
			oracle_text,
			power,
			toughness,
			image_uris,
		} = getCardFace(card)

		const [loaded, setLoaded] = useState(false)
		const [src, setSrc] = useState("")

		useEffect(
			_ => {
				setSrc(
					(faceDown || face_down
						? sleeves
						: image_uris &&
						  image_uris[image_uris[imgSize] ? imgSize : "normal"]) ||
						CARD_SLEEVES["_basic.png"]
				)
			},
			[card]
		)

		return cardHeadOnly ? (
			<div className={`card-head`}>
				<img className="mini-icon" src={image_uris.art_crop} />
				<div className="col">
					<span className="top-line bar even">
						<h4>
							<span className="quant">{quant || null}</span>
							<span className="name"> {name}</span>
						</h4>
						<span className="flex-row mana">
							{formatManaSymbols(mana_cost)}
						</span>
					</span>
					<p className="types">
						{type_line}
						{power && type_line.includes("Creature")
							? ` - ${power}/${toughness}`
							: null}
					</p>
				</div>
			</div>
		) : nameOnly ? (
			<h3 className="card-text">
				{quant || null} <span className="name">{name}</span>
			</h3>
		) : (
			<Tilt scale={1.2}>
				<span
					className={`card-img`}
					style={{transform: tapped && "rotate(90deg)"}}>
					{loaded ? (
						<img src={src} alt={name} />
					) : (
						<LazyLoadImage
							src={src}
							alt={name}
							placeholder={<Loading />}
							// effect={"blur"}
							afterLoad={_ => setLoaded(true)}
							placeholderSrc={CARD_SLEEVES["_basic.png"]}
							threshold={1000}
						/>
					)}
				</span>
			</Tilt>
		)
	}
)
