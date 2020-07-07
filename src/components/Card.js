import React from 'react'

import {CARD_SLEEVES} from '../Constants'

import {formatManaSymbols,BGcolor,formatText} from '../functions/cardFormatting'

export default function Card(props) {

	const cardHead = (
		<div className='card-head'>
			<h3 className='name'>{props.card.name}</h3>
			<p className='cost'>{formatManaSymbols(props.card.mana_cost)}</p>
		</div>
	)

	const uris = props.card.image_uris
	let imgSrc = null
	if (uris&&uris[props.img||'normal']) {imgSrc = uris[props.img||'normal']}
	if (props.card.faceDown) imgSrc = CARD_SLEEVES[props.sleeve||'basic.png']


	const cardFullImg = (
		<img 
			className='fullImg' 
			src={imgSrc} 
			style={{transform: props.card.tapped && 'rotate(90deg)'}}
		/>
	)


	const cardBack = (
		<div className='back'>
			<div>
				<h1>Magic</h1>
				<h5>The Gathering</h5>
			</div>
		</div>
	)

	const cardWhole = (
		<div className={`card ${props.card.faceDown?'face-down':''}`}>
			{cardFullImg}
		</div>
	)

	return props.cardHeadOnly || !imgSrc ? cardHead : cardWhole
}


