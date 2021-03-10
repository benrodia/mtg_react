import React, {useEffect, useRef, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import ToolTip from "./ToolTip"

const {
	HOME_DIR,
	COLORS,
	FILTER_TERMS,
	THEN_FILTERS,
	textList,
	canPublish,
	canEdit,
	canSuggest,
} = utilities

export default connect(
	({main: {decks}, deck, filters: {board, view, sortBy, thenSortBy}}) => {
		return {decks, ...deck, board, view, sortBy, thenSortBy}
	},
	actions
)(
	({
		slug,
		allow_suggestions,
		suggestions,
		editing,
		unsaved,
		list,
		board,
		view,
		sortBy,
		thenSortBy,
		changeFilters,
	}) => {
		return (
			<span className="view-options bar even mini-spaced-bar">
				<div className="mini-block">
					<h4>View</h4>
					<div className="bar">
						<ToolTip message="View Cards as Plain Text">
							<button
								className={`small-button icon-code ${
									view === "text" && "selected"
								}`}
								onClick={_ => changeFilters("view", "text")}
							/>
						</ToolTip>
						<ToolTip message="View Cards as Formatted Tiles">
							<button
								className={`small-button icon-th-list ${
									view === "list" && "selected"
								}`}
								onClick={_ => changeFilters("view", "list")}
							/>
						</ToolTip>
						<ToolTip message="View Cards as Stacked Images">
							<button
								title={"Images"}
								className={`small-button icon-layers ${
									view === "grid" && "selected"
								}`}
								onClick={_ => changeFilters("view", "grid")}
							/>
						</ToolTip>
					</div>
				</div>
				<div className="mini-block">
					<h4>Sort By</h4>
					<BasicSearch
						self={FILTER_TERMS.filter(f => f.name === sortBy)[0]}
						options={FILTER_TERMS}
						labelBy={"name"}
						callBack={s => changeFilters("sortBy", s.name)}
					/>
				</div>
				<div className="mini-block">
					<h4>Then Sort By</h4>
					<BasicSearch
						self={THEN_FILTERS.filter(f => f.name === thenSortBy)[0]}
						options={THEN_FILTERS}
						labelBy={"name"}
						callBack={ts => changeFilters("thenSortBy", ts.name)}
					/>
				</div>
			</span>
		)
	}
)
