import React from 'react'

export default function Modal(props) {

	return <div className="modal-cont" style={{display: props.children === null && 'none'}}>
			<div className="exit" onClick={()=>props.openModal(null)}></div>
			<div className="modal-box">{props.children}</div>
		</div>
}

