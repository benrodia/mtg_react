import React, {useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import BGImg from "./BGImg"

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
			<BGImg />
			<div className="modal-box">
				<div className="modal-header">
					<div className="inner bar even spaced-bar">
						<h2 className="icon-cancel icon warning-button inverse-button" onClick={_ => openModal(null)}>
							(esc)
						</h2>
						<h2>{title}</h2>
					</div>
				</div>
				<div className="modal-content big-block col even">{content}</div>
			</div>
		</div>
	)
})
// {options}
