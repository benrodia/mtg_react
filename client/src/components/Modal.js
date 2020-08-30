import React, {useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"

export default connect(({main: {modal}}) => {
	return {modal}
}, actions)(({modal, openModal}) => {
	useEffect(_ => {
		const keyEvent = e => e.key === "Escape" && openModal(null)
		window.addEventListener("keydown", keyEvent)
		return _ => window.removeEventListener("keydown", keyEvent)
	}, [])

	const {title, options, content} = modal || {}

	return (
		<div className={`modal-cont ${!modal && "hide-modal"}`}>
			<div className="exit" onClick={_ => openModal(null)}></div>
			<div className="modal-box">
				<div className="header bar even spread">
					<h2 className="icon-cancel icon warning-button inverse-button" onClick={_ => openModal(null)} />
					<h2>{title}</h2>
				</div>
				<div className="content col even">{content}</div>
			</div>
		</div>
	)
})
// {options}
