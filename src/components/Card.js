import React from 'react'
import {CARD_SLEEVES} from '../constants/data_objects'
import {formatManaSymbols} from '../functions/formattingLogic'

export default function Card(props) {
	const {imgSize,faceDown,sleeve,mana_cost,tapped,name,image_uris,classes} = props.card
	const imgSrc = image_uris&&image_uris[imgSize||'normal']
	? faceDown ? sleeve||CARD_SLEEVES['basic.png']
	: image_uris[imgSize||'normal']
	: null

	return props.cardHeadOnly
	?<div className={`card-head ${classes}`}>
		<h4 className='name'>{name}</h4>
		<p className='cost'>{formatManaSymbols(mana_cost)}</p>
	 </div>
	:<img src={imgSrc} className={`card-img ${classes}`} style={{transform: tapped && 'rotate(90deg)'}}/>
}


