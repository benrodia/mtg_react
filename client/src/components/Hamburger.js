import React, {useEffect, useState} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import BGImg from "./BGImg"

export default connect(({main: {breakPoint}}) => {
	return {breakPoint}
}, actions)(({children, before, size, vert, drop, breakPoint}) => {
	const [open, setOpen] = useState(size !== "all" && size >= breakPoint)

	useEffect(_ => {
		const keyEvent = e => e.key === "Escape" && setOpen(false)
		window.addEventListener("keydown", keyEvent)
		return _ => window.removeEventListener("keydown", keyEvent)
	}, [])

	return (
		<div
			tabIndex={"0"}
			onBlur={_ => setTimeout(_ => setOpen(false), 300)}
			className={`hamburger-cont`}>
			<div className={"bar even toggle"} onClick={_ => setOpen(!open)}>
				{before || null}
				<button
					className={`small-button icon-${
						open ? "cancel" : vert ? "menu" : "menu"
					}`}
				/>
			</div>

			<div className={`inner col ${open && "open"}`}>{children}</div>
		</div>
	)
})
