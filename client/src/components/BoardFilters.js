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
		minified,
		offset,
		list,
		format,
		author,
		isAuthenticated,
		_id,
		sortBy,
		view,
		board,
		showPrice,
		showTypes,
		customFields,
		changeFilters,
		changeCard,
		addCard,
	}) => {
		return (
			<Sticky offset={offset}>
				<div className="list-head">
					<div className="board-labels">
						{BOARDS.map(B => {
							const cards = list.filter(c => c.board === B)
							const legalAmt =
								B !== MAIN_BOARD ||
								(cards.length >= (SINGLETON(format) ? 100 : 60) &&
									cards.length <= (SINGLETON(format) ? 100 : 600))
							return (
								<h2
									key={B}
									className={`board-label ${B === board && "active"}`}
									onClick={_ => changeFilters("board", B)}>
									<DropSlot
										key={"board_header_" + B}
										field={B}
										accept={canEdit() ? ItemTypes.CARD : "NULL"}
										callBack={c =>
											c.key ? changeCard(c, {board: B}) : addCard(c, B)
										}>
										{B}
										{minified ? "" : "board"}:{" "}
										<span style={{color: !legalAmt && "#f46"}}>
											{cards.length}
										</span>
									</DropSlot>
								</h2>
							)
						})}
					</div>
					{minified ? null : (
						<span className="view-options bar even">
							<button
								title={`View as ${
									view === "list" ? "Bulleted List" : "Image Grid"
								}`}
								className={`icon-view-mode ${view === "list" ? "-list" : ""}`}
								onClick={_ =>
									changeFilters("view", view === "list" ? "grid" : "list")
								}
							/>
							<BasicSearch
								self={FILTER_TERMS.filter(f => f.name === sortBy)[0]}
								defImg={<span className="icon-sort-alt-down" />}
								options={FILTER_TERMS}
								labelBy={"name"}
								callBack={s => changeFilters("sortBy", s.name)}
							/>
							{sortBy !== "Custom" ? null : (
								<EditableText
									addable
									value={{
										name: "New Field",
										key: "custom" + customFields.length,
									}}
									list={customFields}
									callBack={n => changeFilters("customFields", n)}
								/>
							)}
						</span>
					)}
				</div>
			</Sticky>
		)
	}
)
