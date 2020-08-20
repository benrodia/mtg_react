import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import Card from './Card'

function PrintSelector({change,card,list,sets,legalCards,changeCard,addCard,openModal}) {
	const options = legalCards.filter(print=>print.name===card.name).map(print=>{
		return <div className='print-select-card' onClick={_=>{
				if (change) changeCard(card,print)
				else addCard(print)
				openModal(null)
			}}>
			<h4>{print.set_name}</h4>
			<Card card={print}/>
		</div>
	})
	return <div className="choose-print">
		<h2>Choose Printing</h2>
		<div className="options">{options}</div>
	</div>

}
	

export default connect(({main:{sets,legalCards},deck:{list}})=>{return{sets,legalCards,list}},actions)(PrintSelector)