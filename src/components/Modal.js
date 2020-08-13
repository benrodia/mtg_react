import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'

function Modal({modal,openModal}) {
	return (
		<div className="modal-cont" style={{display: modal === null && 'none'}}>
			<div className="exit" onClick={_=>openModal(null)}></div>
			<div className="modal-box">{modal}</div>
		</div>
	)
}

export default connect(state=>{return{modal:state.main.modal}},actions)(Modal)