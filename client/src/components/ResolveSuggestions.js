import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"
import ago from "s-ago"

import EditableText from "./EditableText"
import CardControls from "./CardControls"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

const {Q, HOME_DIR, MAYBE_BOARD, creator, areFriends} = utilities

export default connect(
	({
		auth: {
			user: {followed},
		},
		deck: {format, desc, list, suggestions},
		main: {cardData, sets},
	}) => {
		return {followed, format, desc, list, suggestions, cardData, sets}
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
		cardData,
		addCard,
		openModal,
		resolveSuggestion,
		changeDeck,
	}) => {
		return (
			<div className="changes big-block col spaced-col">
				{suggestions
					.orderBy("date")
					.map(
						({
							author,
							date,
							id,
							added,
							removed,
							reason,
							resolved,
						}) => {
							const {name, slug} = creator(author) || {}
							if (
								(!added || !added.length) &&
								(!removed || !removed.length)
							)
								return null
							return (
								<div
									className={`block change bar spaced-bar section`}
								>
									<div
										className={`flex-row spaced-bar even ${
											resolved && "disabled"
										}`}
									>
										<div>
											<h4>Remove</h4>
											<div className="remove bar even">
												{removed.map(remove => (
													<CardControls
														card={cardData.find(
															c =>
																c.name ===
																remove.name
														)}
													/>
												))}
											</div>
										</div>
										<div className="icon-right" />
										<div>
											<h4>Add</h4>
											<div className="add bar even">
												{added.map(add => (
													<CardControls
														card={cardData.find(
															c =>
																c.name ===
																add.name
														)}
													/>
												))}
											</div>
										</div>
									</div>
									<div className="col spread">
										<div>
											<div className="bar even mini-spaced-bar">
												<Link
													to={`${HOME_DIR}/user/${slug}`}
												>
													<h4>{name}</h4>
												</Link>
												{areFriends(author) ? (
													<p className="asterisk">
														(mutuals)
													</p>
												) : followed.includes(
														author
												  ) ? (
													<p className="asterisk">
														(followed)
													</p>
												) : null}
												<p>{ago(new Date(date))}</p>
											</div>
											<p className="asterisk">{reason}</p>
										</div>
										{resolved ? (
											<h3>Resolved: {resolved}</h3>
										) : (
											<div className="bar even">
												<button
													className="icon-ok success-button"
													onClick={_ =>
														resolveSuggestion(
															id,
															"keep"
														)
													}
												>
													Yes
												</button>

												<button
													onClick={_ =>
														resolveSuggestion(
															id,
															"maybe"
														)
													}
												>
													Maybe
												</button>
												<button
													className="icon-cancel"
													onClick={_ =>
														resolveSuggestion(
															id,
															"ignore"
														)
													}
												>
													No
												</button>
											</div>
										)}
									</div>
								</div>
							)
						}
					)}
			</div>
		)
	}
)
