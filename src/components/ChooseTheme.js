import React,{useState} from 'react'
import {CARD_SLEEVES,PLAYMATS} from '../constants/data'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import {titleCaps} from '../functions/text'
import '../functions/utility'

function ChooseTheme({type,settings,legalCards,changeSettings}) {
	const [hiRes,surpriseMe] = useState([])

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
			onClick={_=>changeSettings(type,s)}
			src={s} alt={s}
			/>
		)}
		</div>
	</div>
}

const select = state => {
	return {
		settings: state.settings,
		legalCards: state.main.legalCards,
	}
}

export default connect(select,actions)(ChooseTheme)