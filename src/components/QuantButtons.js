import React from 'react'


export default function QuantButtons(props) {

	return (
		<div className="quant-buttons">
			<button 
			className='small-button success-button' 
			onClick={()=>props.callBack(props.item,true,props.dest)}
			>+</button>
			<button 
			className='small-button warning-button' 
			onClick={()=>props.callBack(props.item,false,props.dest)}
			>-</button>
			<span className='itemQuant' style={{
				color: props.total>props.limit && '#f46',
				display: !props.showQuant && 'none'
			}}>({props.total}) </span>

		</div>
	
	)
}