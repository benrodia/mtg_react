import React from 'react'
import Inspect from './Inspect'
import Scry from './Scry'



export default function Modal(props) {

	return (
		<div className="modalCont" style={{display: props.children === null && 'none'}}>
			<div className="exit" onClick={()=>props.openModal(null)}></div>
			<div className="modalBox">
				{props.children}
			</div>
		</div>
	)

}

