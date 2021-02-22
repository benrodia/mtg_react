import React, {useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"
import actions from "../actions"
import utilities from "../utilities"

import NewSuggestion from "./NewSuggestion"
import BasicSearch from "./BasicSearch"
import EditableText from "./EditableText"
import Card from "./Card"

const {
	HOME_DIR,
	FORMATS,
	ItemTypes,
	sum,
	audit,
	titleCaps,
	textList,
	formattedDate,
	canPublish,
	canEdit,
	canSuggest,
	creator,
	helpTiers,
	listDiffs,
} = utilities

export default connect(
	({auth: {isAuthenticated, user}, main: {legalCards, users}, deck}) => {
		return {isAuthenticated, user, legalCards, users, ...deck}
	},
	actions
)(
	({
		isAuthenticated,
		user,
		_id,
		name,
		format,
		desc,
		list,
		preChanges,
		author,
		created,
		updated,
		feature,
		published,
		privacy,
		views,
		likes,
		allow_suggestions,
		suggestions,
		changes,
		legalCards,
		users,
		openModal,
		changeDeck,
		giveLike,
	}) => {
		const canLike = isAuthenticated && author !== user._id
		// 		<div className="name bar even spaced-bar">
		// 	<h3 className="tag">{titleCaps(format)}</h3>
		// </div>

		return (
			<div className="info-readme">
				<div className="bar even spaced-bar max">
					<div className="col">
						<div className="mini-block bar even mini-spaced-bar">
							<Link to={`${HOME_DIR}/user/${creator().slug}`}>
								<h4 className="inverse-button ">{creator().name}</h4>
							</Link>
							<p className="asterisk">
								Created {formattedDate(new Date(created))} - Updated{" "}
								{ago(new Date(updated))}
							</p>
						</div>
						<div className="meta bar even mini-spaced-bar">
							<h4>{published ? "Published" : "Draft"}</h4>

							<div
								className={`icon-${
									privacy === "Private"
										? "lock"
										: privacy === "Unlisted"
										? "link"
										: "globe"
								}`}>
								{privacy}
							</div>
							<div className="even bar icon-eye views">{views}</div>
						</div>
					</div>
				</div>
				<div className="block">
					<div className="block">
						{canEdit() ? null : (
							<div className="bar even">
								<button
									className={`likes even bar icon-thumbs-up ${
										canLike || "disabled"
									} ${user.liked && user.liked.includes(_id) && "selected"}`}
									onClick={giveLike}>
									{likes}
								</button>

								<button
									className={canSuggest() || "disabled"}
									onClick={_ =>
										openModal({
											title: "Leave a Suggestion",
											content: <NewSuggestion />,
										})
									}>
									{allow_suggestions >= 3 ? "Please, " : ""}Leave a Suggestion
									{allow_suggestions >= 3 ? "!" : ""}
								</button>
								{!canSuggest() && !canEdit() ? (
									<p className="asterisk">
										*Log in to like and suggest changes
									</p>
								) : null}
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}
)

// <div className="block">
// 	<Markdown>{desc}</Markdown>
// </div>
