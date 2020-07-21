import React from 'react'

import Inspect from './Inspect'
import Card from './Card'

import DragContainer from './DragContainer'
import { useDrag } from 'react-dnd'


let timer,clicked
export default function CardControls(props) {
	const {card,type,style,faceDown,openModal,moveCard,illegal,children,cardClick} = props

	const [{isDragging}, drag] = useDrag({
		item: {key:card.key,type: type||'card'},
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
				openModal&&openModal(<Inspect showShopping={!!card.board} showRulings={!!card.zone} card={card}/>)
			},400)		
		} 
	}

	return (
		<div ref={drag} style={style} className={`card-container ${illegal?'illegal':''}`}>
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
	)
}













