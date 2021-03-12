import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Sticky from "./Sticky"
import DropSlot from "./DropSlot"
import BasicSearch from "./BasicSearch"
import EditableText from "./EditableText"

const {
	SINGLETON,
	FILTER_TERMS,
	ItemTypes,
	COLORS,
	BOARDS,
	MAIN_BOARD,
	rem,
	titleCaps,
	canEdit,
} = utilities

export default connect(
	({
		auth: {
			isAuthenticated,
			user: {_id},
		},
		deck: {list, format, author},
		filters,
	}) => {
		return {list, format, author, ...filters, isAuthenticated, _id}
	},
	actions
)(
	({
		offset,
		list,
		format,
		author,
		isAuthenticated,
		_id,
		sortBy,
		view,
		board,
		editing,
		showPrice,
		showTypes,
		customFields,
		changeFilters,
		changeCard,
		addCard,
	}) => {
		return (
			<div className=" full-width">
				<div className="flex-row tab-switch">
					{BOARDS.map(B => {
						const cards = list.filter(c => c.board === B)
						const legalAmt =
							B !== MAIN_BOARD ||
							(cards.length >= (SINGLETON(format) ? 100 : 60) &&
								cards.length <= (SINGLETON(format) ? 100 : 600))
						return (
							<h2
								key={B}
								className={`tab ${B === board && "selected"}`}
								onClick={_ => changeFilters("board", B)}>
								<DropSlot
									key={"board_header_" + B}
									field={B}
									accept={canEdit() && editing ? ItemTypes.CARD : "NULL"}
									callBack={c => changeCard(c, {board: B})}>
									{B}
									{"board "}
									<span style={{color: !legalAmt && "#f46"}}>
										{cards.length}
									</span>
								</DropSlot>
							</h2>
						)
					})}
				</div>
			</div>
		)
	}
)
