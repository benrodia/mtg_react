import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Sticky from "./Sticky"
import DropSlot from "./DropSlot"
import BasicSearch from "./BasicSearch"
import EditableText from "./EditableText"

const {SINGLETON, FILTER_TERMS, ItemTypes, COLORS, BOARDS, MAIN_BOARD, rem, titleCaps} = utilities

export default connect(({auth: {isAuthenticated, user: {_id}}, deck: {list, format, author}, filters}) => {
	return {list, format, author, ...filters, isAuthenticated, _id}
}, actions)(
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
		showIllegal,
		showPrice,
		showTypes,
		customFields,
		changeFilters,
		changeCard,
	}) => {
		const canEdit = _id === author && isAuthenticated
		return (
			<Sticky offset={offset}>
				<div className="list-head">
					<div className="board-labels">
						{BOARDS.map(B => {
							const cards = list.filter(c => c.board === B)
							const legalAmt =
								B !== MAIN_BOARD ||
								(cards.length >= (SINGLETON(format) ? 100 : 60) && cards.length <= (SINGLETON(format) ? 100 : 600))
							return (
								<h2
									key={B}
									className={`board-label ${B === board && "active"}`}
									onClick={_ => changeFilters("board", B)}>
									<DropSlot
										key={"board_header_" + B}
										field={B}
										accept={canEdit ? ItemTypes.CARD : "NULL"}
										callBack={c => changeCard(c, {board: B})}>
										{B}board{" "}
										<span>
											{" "}
											(<span style={{color: !legalAmt && "#f46"}}>{cards.length}</span>)
										</span>
									</DropSlot>
								</h2>
							)
						})}
					</div>
					<span className="view-options bar even">
						<button
							title="Highlight Illegal Cards/Quantities"
							className={`small-button ${showIllegal && "selected"}`}
							onClick={_ => changeFilters("showIllegal", !showIllegal)}>
							!!!
						</button>
						<button
							title="Display Card Prices"
							className={`small-button ${showPrice && "selected"}`}
							onClick={_ => changeFilters("showPrice", !showPrice)}>
							$$$
						</button>
						<button
							title={`View as ${view === "list" ? "Bulleted List" : "Image Grid"}`}
							className={`small-button icon-th${view === "list" ? "-list" : ""}`}
							onClick={_ => changeFilters("view", view === "list" ? "grid" : "list")}>
							{titleCaps(view)}
						</button>
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
								value={{name: "New Field", key: "custom" + customFields.length}}
								list={customFields}
								callBack={n => changeFilters("customFields", n)}
							/>
						)}
					</span>
				</div>
			</Sticky>
		)
	}
)
