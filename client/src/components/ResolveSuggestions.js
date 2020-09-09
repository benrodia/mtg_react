import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"
import ago from "s-ago"

import EditableText from "./EditableText"
import Card from "./Card"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

const {Q, HOME_DIR, MAYBE_BOARD} = utilities

export default connect(
	({
		auth: {
			user: {followed},
		},
		deck: {format, desc, list, suggestions},
		main: {legalCards, sets},
	}) => {
		return {followed, format, desc, list, suggestions, legalCards, sets}
	},
	actions
)(
	({
		showDiffs,
		followed,
		list,
		suggestions,
		format,
		desc,
		sets,
		legalCards,
		addCard,
		openModal,
		resolveSuggestion,
		creator,
		areFriends,
		changeDeck,
	}) => {
		return (
			<div className="changes big-block col spaced-col">
				{suggestions.map(({author, date, changes}) => {
					return (
						<div key={author + date} className="block">
							<div className="bar even mini-spaced-bar">
								<Link to={`${HOME_DIR}/user/${creator(author).slug}`}>
									<h4>{creator(author).name}</h4>
								</Link>
								{areFriends(author) ? (
									<p className="asterisk">(friends)</p>
								) : followed.includes(author) ? (
									<p className="asterisk">(followed)</p>
								) : null}
								<p>{ago(new Date(date))}</p>
							</div>
							{changes.map(({id, added, removed, reason}) => {
								return (
									<div key={id} className={"change bar even spaced-bar"}>
										<div className="remove bar even">
											<Card card={removed} />
										</div>
										<div className="icon-right" />
										<div className="add bar even">
											<Card card={added} />
										</div>
										<div className="block">
											<p>{reason}</p>
											<div className="bar even">
												<button className="icon-ok success-button" onClick={_ => resolveSuggestion(id, "keep")} />
												<button className="" onClick={_ => resolveSuggestion(id, "maybe")}>
													Maybe
												</button>
												<button className="icon-trash" onClick={_ => resolveSuggestion(id, "ignore")} />
											</div>
										</div>
									</div>
								)
							})}
						</div>
					)
				})}
			</div>
		)
	}
)
