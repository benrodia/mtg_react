import React from 'react'
import { useDrag,DragPreviewImage } from 'react-dnd'
import {ItemTypes} from '../constants/data_objects'

import DragContainer from './DragContainer'
import Inspect from './Inspect'
import Card from './Card'



let timer,clicked
export default function CardControls(props) {
	const {card,itemType,style,faceDown,openModal,moveCard,illegal,children,cardClick} = props

	const [{isDragging}, drag, preview] = useDrag({
		item: {key:card.key,type: itemType||ItemTypes.CARD},
		collect: monitor => ({isDragging: !!monitor.isDragging()})
	})

	if (isDragging) clearTimeout(timer)
	
	const click = () => {
		timer&&!clicked&&cardClick&&cardClick(card)
		if (clicked) {
			cardClick(card,true)
			clicked=false
		}
		clicked=true
		setTimeout(()=>clicked=false,300)
	}

	const clickHold = () => {
		if (!isDragging) {
			timer = setTimeout(()=>{
			    timer = null
				openModal&&openModal(<Inspect card={card}/>)
			},400)		
		} 
	}

	return <div key={(card.key||card.id)+"container"} ref={drag} style={style} className={`card-container ${illegal?'illegal':''}`}>
			<div className="card-controls">{children}</div>
			<span className="click-events"
			onClick={click}
			onMouseDown={clickHold}
			onMouseUp={()=>clearTimeout(timer)}
			onMouseOut={()=>clearTimeout(timer)}
			>
				<Card {...props} faceDown={faceDown}/>
			</span>
		</div>
}













