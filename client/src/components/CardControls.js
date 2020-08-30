import React, {useState} from "react"
import {useDrag} from "react-dnd"
import {ItemTypes} from "../constants/data"

import {connect} from "react-redux"
import actions from "../actions"

import Inspect from "./Inspect"
import Card from "./Card"

let timer
export default connect(({main: {page}}) => {
	return {page}
}, actions)(
	({
		page,
		card,
		inArea,
		options,
		itemType,
		style,
		faceDown,
		cardHeadOnly,
		openModal,
		illegal,
		children,
		cardClick,
		classes,
	}) => {
		const [clicked, clickState] = useState(false)
		const [{isDragging}, drag, preview] = useDrag({
			item: {...card, type: itemType || ItemTypes.CARD},
			collect: monitor => ({isDragging: !!monitor.isDragging()}),
		})
		const inspect = _ =>
			openModal({title: card.name, content: <Inspect card={card} inArea={inArea} options={options} />})

		if (isDragging) clearTimeout(timer)

		const click = _ => {
			console.log(page)
			if (page === "Test") {
				cardClick(card, clicked)
				clickState(true)
				setTimeout(_ => clickState(false), 300)
			} else inspect()
		}

		const clickHold = _ => {
			if (!isDragging)
				timer = setTimeout(_ => {
					timer = null
					inspect()
				}, 300)
		}

		return (
			<div key={(card.key || card.id) + "container"} ref={drag} style={style} className={`card-container ${classes}`}>
				<div className="card-controls">{children}</div>
				<span
					className="click-events"
					onClick={click}
					onMouseDown={clickHold}
					onMouseUp={_ => clearTimeout(timer)}
					onMouseOut={_ => clearTimeout(timer)}>
					<Card faceDown={faceDown} card={card} cardHeadOnly={cardHeadOnly} />
				</span>
			</div>
		)
	}
)
