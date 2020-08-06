import React,{useState} from 'react'
import {useDrag} from 'react-dnd'
import {ItemTypes} from '../constants/data_objects'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import Inspect from './Inspect'
import Card from './Card'



let timer
function CardControls(props) {
	const {card,itemType,style,faceDown,cardHeadOnly,openModal,illegal,children,cardClick,classes} = props
	const [clicked,clickState] = useState(false)

	const [{isDragging}, drag, preview] = useDrag({
		item: {...card,type: itemType||ItemTypes.CARD},
		collect: monitor => ({isDragging: !!monitor.isDragging()})
	})

	if (isDragging) clearTimeout(timer)
	
	const click = _ => {
		cardClick(card,clicked)
		clickState(true)
		setTimeout(_=>clickState(false),300)
	}

	const clickHold = _ => {
		if (!isDragging) timer = setTimeout(_=>{
			timer = null
			openModal(<Inspect card={card}/>)
		},300)
	}		
		

	return <div key={(card.key||card.id)+"container"} ref={drag} style={style} className={`card-container ${illegal?'illegal':''} ${classes}`}>
			<div className="card-controls">{children}</div>
			<span className="click-events"
			onClick={click}
			onMouseDown={clickHold}
			onMouseUp={_=>clearTimeout(timer)}
			onMouseOut={_=>clearTimeout(timer)}
			>
				<Card card={card} cardHeadOnly={cardHeadOnly}/>
			</span>
		</div>
}


export default connect(null,actions)(CardControls)