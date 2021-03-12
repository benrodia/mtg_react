import React, {useState, useEffect, useRef} from "react"
import {useDrag} from "react-dnd"
import {withRouter, useLocation, Link} from "react-router-dom"
import {ItemTypes} from "../constants/data"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import Loading from "./Loading"

const {getCardFace} = utilities

export default withRouter(
	connect(({main: {pos}}) => {
		return {pos}
	}, actions)(({options, pos, children}) => {
		const outer = useRef(null)
		const [[l, t, w, h], setPos] = useState(pos)
		const [shown, show] = useState(false)
		const [fade, setFade] = useState(false)

		useEffect(_ => {
			const click = e =>
				(outer.current && outer.current.contains(e.target)) || show(false)
			const move = e =>
				(outer.current && outer.current.contains(e.target)) || setFade(true)

			window.addEventListener("mousedown", click, false)
			window.addEventListener("mousemove", move, false)
			return _ => {
				window.removeEventListener("mousedown", click, false)
				window.removeEventListener("mousemove", move, false)
			}
		}, [])

		const Obj = _ =>
			shown && options.length ? (
				<div
					className="context-menu"
					style={{
						left: l,
						top: t,
					}}>
					{options.map(({label, callBack, color, auth}) =>
						auth && !auth() ? null : (
							<div
								className={`context-option ${color}`}
								key={`option_${label}`}
								onClick={_ => {
									callBack && callBack()
									show(false)
								}}>
								{label}
							</div>
						)
					)}
				</div>
			) : null

		return (
			<span
				className={"context-menu-outer"}
				ref={outer}
				onContextMenu={e => {
					e.preventDefault()
					show(true)
					setPos(pos)
				}}>
				{children}
				<Obj />
			</span>
		)
	})
)
