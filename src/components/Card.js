import React,{useEffect} from 'react'
import {connect} from 'react-redux'
import {CARD_SLEEVES} from '../constants/data_objects'
import {formatManaSymbols} from '../functions/formattingLogic'

function Card(props) {
	const {imgSize,sleeve,card} = props
	const {mana_cost,faceDown,tapped,name,image_uris} = card

	return props.cardHeadOnly
		? <div className={`card-head`}>
			<h4 className='name'>{name}</h4>
			<p className='cost'>{formatManaSymbols(mana_cost)}</p>
		  </div>
		: <img 
			src={(faceDown ? sleeve: image_uris[imgSize||'normal']) || CARD_SLEEVES['_basic.png']} 
			className={`card-img`} style={{transform: tapped && 'rotate(90deg)'}}
		  />
}




export default connect(state=>{return{sleeve:state.settings.sleeve}},null)(Card)