import React, {useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"

import NewSuggestion from "./NewSuggestion"
import BasicSearch from "./BasicSearch"
import EditableText from "./EditableText"
import Card from "./Card"
import DownloadFile from "./DownloadFile"
import ToolTip from "./ToolTip"

const {
	HOME_DIR,
	FORMATS,
	COLORS,
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
	({
		auth: {isAuthenticated, user},
		main: {legalCards, users},
		deck,
		filters: {editing},
	}) => {
		return {isAuthenticated, user, legalCards, users, ...deck, editing}
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
		colors,
		editing,
		author,
		created,
		updated,
		feature,
		complete,
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
		deleteDeck,
		changeFilters,
	}) => {
		const canLike = isAuthenticated && author !== user._id

		const head = (
			<div className="flex-row even spaced-bar">
				<div className="col title mini-spaced-col">
					<div
						className="splash"
						style={{
							background: `url(${feature}) no-repeat center center`,
							backgroundSize: "cover",
						}}
					>
						<span className="grad" />
					</div>
					<div className=" icon flex-row even mini-spaced-bar">
						<PieChart
							data={COLORS("fill").map((color, i) => {
								return {value: colors[i], color}
							})}
							startAngle={270}
						/>
						<span>
							<h1 className="sub-title ">{name || "Untitled"}</h1>
							<h4>{titleCaps(format)}</h4>
						</span>
					</div>
				</div>
				<div className="play-button">
					<Link to={`${HOME_DIR}/playtest/lobby`}>
						<button className="icon-play" title="Playtest Deck" />
					</Link>
				</div>
			</div>
		)

		return (
			<div className="deck-nav flex-row spread even">
				{head}
				<div className="flex-row spread full-width pad even">
					<div className="info-readme">
						<div className="bar even spaced-bar max">
							<div className="col">
								<div className="mini-block bar even mini-spaced-bar">
									<Link
										to={`${HOME_DIR}/user/${
											creator().slug
										}`}
									>
										<h4 className="inverse-button ">
											{creator().name}
										</h4>
									</Link>
									<p className="asterisk">
										Created{" "}
										{formattedDate(new Date(created))} -
										Updated {ago(new Date(updated))}
									</p>
								</div>
								<div className="meta bar even mini-spaced-bar">
									<h4>
										{complete ? "Complete" : "Incomplete"}
									</h4>

									<div
										className={`icon-${
											privacy === "Private"
												? "lock"
												: privacy === "Unlisted"
												? "link"
												: "globe"
										}`}
									>
										{privacy}
									</div>
									<div className="even bar icon-eye views">
										{views}
									</div>
									<div className="icon-thumbs-up">
										{likes}
									</div>
									<div className="icon-comment">
										{
											suggestions.filter(s => !s.resolved)
												.length
										}
									</div>
								</div>
							</div>
						</div>
						<div className="block bar"></div>
					</div>
					<div className="col">
						{canEdit() && !editing ? (
							<button
								className="icon-pencil"
								onClick={_ => changeFilters("editing", true)}
							></button>
						) : (
							<ToolTip
								message={
									canLike
										? 'Add to "Liked Decks"'
										: "Sign in to like"
								}
							>
								<button
									className={`likes even bar icon-thumbs-up ${
										canLike || "disabled"
									} ${
										user.liked &&
										user.liked.includes(_id) &&
										"selected"
									}`}
									onClick={giveLike}
								/>
							</ToolTip>
						)}
						{canEdit() ? null : (
							<ToolTip
								message={
									!allow_suggestions
										? "Creator has disabled suggestions"
										: !canSuggest() && !canEdit()
										? "Log in to like and suggest changes"
										: "Leave a suggestion"
								}
							>
								<button
									className={`icon-comment ${
										canSuggest() || "disabled"
									}`}
									onClick={_ =>
										openModal({
											title: "Leave a Suggestion",
											content: <NewSuggestion />,
										})
									}
								/>
							</ToolTip>
						)}
						<ToolTip message="Download decklist">
							<button
								className="icon-download"
								onClick={_ =>
									openModal({
										title: "Download File",
										content: <DownloadFile />,
									})
								}
							/>
						</ToolTip>

						{canEdit() ? (
							<ToolTip message="Delete deck">
								<button
									className="inverse-button warning-button icon-trash"
									onClick={_ => deleteDeck(_id)}
								></button>
							</ToolTip>
						) : null}
					</div>
				</div>
			</div>
		)
	}
)
