import React,{useEffect} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'

export default connect(({main:{modal}})=>{return{modal}},actions)
(({modal,openModal})=> {
	useEffect(_=>{
		const keyEvent = e => e.key==='Escape'&& openModal(null)
		window.addEventListener('keydown',keyEvent)
		return _=> window.removeEventListener('keydown',keyEvent)
	},[])

	return <div className={`modal-cont ${!modal&&'hide-modal'}`}>
		<div className="exit" onClick={_=>openModal(null)}>
			<span className="icon icon-cancel"/>
		</div>
		<div className="modal-box">
			{modal}
		</div>
	</div>
})

