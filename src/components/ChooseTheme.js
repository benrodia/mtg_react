import React,{useState} from 'react'
import {CARD_SLEEVES,PLAYMATS} from '../constants/data_objects'

import titleCaps from '../functions/titleCaps'
import '../functions/utility'

export default function ChooseTheme(props) {
	const {type,settings,legalCards,changeState} = props
	const [hiRes,surpriseMe] = useState(0)

	const constant = type==='sleeve'?CARD_SLEEVES:PLAYMATS

	const getImgs = num => {
		const got = legalCards
		.filter(c=>c.highres_image&&c.image_uris&&c.image_uris.art_crop)
		.map(c=>c.image_uris.art_crop)
		.shuffle()
		got.length = num
		return got
	}

	const show = hiRes.length?hiRes:Object.values(constant)


	return <div className={`choose-${type}`}>
		<h3 className='field-label'>
		{titleCaps(type)}
		<button className="small-button" onClick={_=>surpriseMe(_=>getImgs(6))}>Surprise Me</button>
		</h3>
		<div className="inner">		
		{show.map(s=>
			<img 
			className={`${type} ${settings[type]===s?'selected':''}`}
			onClick={_=>changeState('settings',type,s)}
			src={s} alt={s}
			/>
		)}
		</div>
	</div>
}