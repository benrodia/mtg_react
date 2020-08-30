import React, {useState} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

const {titleCaps, CARD_SLEEVES, PLAYMATS, log} = utilities

export default connect(({settings: {sleeves, randomSleeves, playmat, randomPlaymat}, main: {legalCards}}) => {
	return {playmat, sleeves, randomPlaymat, randomSleeves, legalCards}
}, actions)(({type, playmat, sleeves, randomPlaymat, randomSleeves, legalCards, changeSettings}) => {
	const [hiRes, shuffleHiRes] = useState([])
	const [artist, setArtist] = useState(null)

	const Constant = type === "sleeves" ? CARD_SLEEVES : PLAYMATS
	const val = type === "sleeves" ? sleeves : playmat
	const valRnd = type === "sleeves" ? randomSleeves : randomPlaymat

	const getImgs = num => {
		const got = legalCards
			.filter(c => c.highres_image && c.image_uris && c.image_uris.art_crop)
			.shuffle()
			.slice(0, num)
		valRnd && changeSettings(type, got[0].image_uris.art_crop)
		return got
	}

	const show = hiRes.length ? hiRes : Object.values(Constant)

	return (
		<div className={` block choose-${type}`}>
			<div className="field-label mini-spaced-bar">
				<h4>{titleCaps(type)}</h4>
				<button
					className={`small-button ${valRnd && "selected"}`}
					onClick={_ => changeSettings(`random${titleCaps(type)}`, !valRnd)}>
					Surprise Me
				</button>
				<button className="small-button" onClick={_ => shuffleHiRes(_ => getImgs(6))}>
					Shuffle
				</button>
			</div>
			<div className="inner">
				<img className={`${type} selected`} src={val} />
				{valRnd
					? null
					: show.map(c => {
							const s = (c.image_uris && c.image_uris.art_crop) || c
							return (
								<div>
									<img
										className={`${type} ${val === s ? "selected" : ""}`}
										onClick={_ => changeSettings(type, s)}
										src={s}
										alt={s}
									/>
									<p>{c.artist}</p>
								</div>
							)
					  })}
			</div>
		</div>
	)
})
