import React,{useState} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'

const {titleCaps,CARD_SLEEVES,PLAYMATS,log} = utilities

export default connect(({settings,main:{legalCards}})=>{return {settings,legalCards}},actions)
(({type,settings,legalCards,changeSettings})=> {
	const [hiRes,shuffleHiRes] = useState([])
	const [artist,setArtist] = useState(null)

	const constant = type==='sleeve'?CARD_SLEEVES:PLAYMATS

	const getImgs = num => 
		legalCards
		.filter(c=>c.highres_image&&c.image_uris&&c.image_uris.art_crop)
		// .map(c=>c.image_uris.art_crop)
		.shuffle()
		.slice(0,num)

	const show = hiRes.length?hiRes:Object.values(constant)


	return <div className={`choose-${type}`}>
		<h3 className='field-label'>
		{titleCaps(type)} <button className="small-button" onClick={_=>shuffleHiRes(_=>getImgs(6))}>Surprise Me</button>
		</h3>
		<div className="inner">		
			<img 
			className={`${type} selected`}
			src={settings[type]} 
			/>
			{show.map(c=>{
				const s = c.image_uris&&c.image_uris.art_crop||c
				return <div>
					<img 
					className={`${type} ${settings[type]===s?'selected':''}`}
					onClick={_=>changeSettings(type,s)}
					src={s} alt={s}
					/>
					<p>{c.artist}</p>
				</div>
			})}
		</div>
	</div>
})

