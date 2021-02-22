import React, {useState, useEffect, useRef} from "react"
import {useDrag} from "react-dnd"
import {withRouter, useLocation, useHistory, Link} from "react-router-dom"
import {ItemTypes} from "../constants/data"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Card from "./Card"

import Icon from "./Icon"
import ToolTip from "./ToolTip"
import Loading from "./Loading"
import ContextMenu from "./ContextMenu"

const {HOME_DIR, getCardFace, createSlug} = utilities

export default withRouter(
	connect(({main: {pos, sets}}) => {
		return {pos, sets}
	}, actions)(
		({
			pos,
			param,
			sets,
			card,
			quant,
			desc,
			options,
			itemType,
			context,
			contextMenu,
			excerpt,
			style,
			faceDown,
			cardHeadOnly,
			nameOnly,
			noHover,
			openModal,
			illegal,
			children,
			cardClick,
			classes,
			history,
			setCardPage,
		}) => {
			const [clicked, clickState] = useState(false)
			const [timer, setTimer] = useState(null)
			const [held, hold] = useState(false)
			const [contextLink, setContextLink] = useState(null)

			const [{isDragging}, drag] = useDrag({
				item: {...card, type: itemType || ItemTypes.CARD},
				collect: monitor => ({isDragging: !!monitor.isDragging()}),
			})

			if (isDragging) clearTimeout(timer)
			if (contextLink) {
				useHistory().push(contextLink)
				setContextLink(null)
			}

			const click = _ => {
				if (context === "playtest") {
					cardClick(card, clicked)
					clickState(true)
				}
				setTimeout(_ => clickState(false), 300)
			}

			const withDrag = o => (
				<div
					key={(card.key || card.id) + "container"}
					ref={drag}
					style={style}
					className={`card-container ${classes}`}>
					{o}
				</div>
			)

			const withContextMenu = o => (
				<ContextMenu
					options={[
						{
							label: "View Card Page (hold click)",
							callBack: _ =>
								setContextLink(
									`${HOME_DIR}/card/${createSlug(card.name)}/${param || ""}`
								),
						},
						...(contextMenu || []),
					]}>
					{o}
				</ContextMenu>
			)

			held &&
				useHistory().push(
					`${HOME_DIR}/card/${createSlug(card.name)}/${param || ""}`
				)

			const withEvents = o => (
				<span
					className="click-events"
					onClick={click}
					onMouseDown={_ => setTimer(setTimeout(_ => hold(true), 500))}
					onMouseUp={_ => clearTimeout(timer)}
					onMouseOut={_ => clearTimeout(timer)}>
					{o}
				</span>
			)

			const withLink = o => (
				<Link
					to={`${HOME_DIR}/card/${createSlug(card.name)}/${param || ""}`}
					onClick={_ => setCardPage(card)}>
					{o}
				</Link>
			)

			const withHover = o => <ToolTip card={card}>{o}</ToolTip>

			const obj = (
				<Card
					faceDown={faceDown}
					card={card}
					quant={quant}
					cardHeadOnly={cardHeadOnly}
					nameOnly={nameOnly}
					desc={desc}
					excerpt={excerpt}
				/>
			)

			return withDrag(
				withContextMenu(
					param
						? withLink(withEvents(noHover ? obj : withHover(obj)))
						: withEvents(noHover ? obj : withHover(obj))
				)
			)
		}
	)
)
// ({card.released_at.split("-")[0]})
// <div className="card-controls">{children}</div>
// <p className="prices">
// 		<b>
// 			${card.prices && card.prices.usd ? `${card.prices.usd}` : "???"}
// 		</b>
// 	</p>
