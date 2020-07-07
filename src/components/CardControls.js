import React from 'react'
import Inspect from './Inspect'
import {qCard,tutorableCards} from '../functions/cardFunctions'


export default function CardControls(props) {

	if (props.isDragging) {clearTimeout(timer)}


	return (
		<>
			<div className="card-controls">{props.controls}</div>
			<span className="clickEvents"
				onClick={()=>cardClick(props)}
				onMouseUp={()=>clearTimeout(timer)}
				onMouseOut={()=>clearTimeout(timer)}
				onMouseDown={()=>clickHold(props,props.isDragging)}
			>
        	{props.children}
			</span>
		</>
	)
}



let timer,clicked

function cardClick(props) {
	timer&&props.cardClick&&props.cardClick(props.card)
	if (clicked&&props.card.zone==="Battlefield") {
		props.moveCard(props.card,"Graveyard")
		clicked=false
	}
	clicked=true
	setTimeout(()=>clicked=false,300)
}

function clickHold(props,isDragging) {
	if (!isDragging) {
		timer = setTimeout(()=>{
		    timer = null
			props.openModal(<Inspect card={props.card}/>)
		},500)		
	} 
}











