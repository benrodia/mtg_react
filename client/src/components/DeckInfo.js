import React, {useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import actions from "../actions"
import utilities from "../utilities"
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
	creator,
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
		const featureImg =
			feature || (list[0] && list[0].image_uris && list[0].image_uris.art_crop)
		const canLike = isAuthenticated && author !== user._id
		const pickFeatured = (
			<div className="block mini-spaced-grid bar wrap">
				{list.unique("id").map((c, i) => (
					<div
						key={c.id + i}
						onClick={_ => {
							openModal(null)
							changeDeck("feature", c.image_uris.art_crop)
						}}>
						<Card card={c} />
					</div>
				))}
			</div>
		)
		const upToDate = !listDiffs(preChanges, list).changed
		const publishable = !published && upToDate && canPublish(list, format)

		return (
			<div className="info-readme bar even spaced-bar max">
				<span
					className="feature icon"
					onClick={_ =>
						canEdit() &&
						openModal({title: "Featured Card", content: pickFeatured})
					}>
					{canEdit() ? (
						<div className="change-img flex-centered">
							<span>Change</span>
						</div>
					) : null}
					<img src={featureImg} alt="" />
				</span>
				<div className="col">
					<div className="name bar even spaced-bar">
						<EditableText
							changeable={canEdit()}
							text={name}
							callBack={({text, method}) =>
								method === "change" && changeDeck("name", text)
							}>
							<h1>{name}</h1>
						</EditableText>
						{canEdit() ? (
							<BasicSearch
								options={FORMATS}
								self={format}
								callBack={f => changeDeck("format", f)}
							/>
						) : (
							<h3 className="tag">{titleCaps(format)}</h3>
						)}
					</div>
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
						{canEdit() ? (
							<button
								className={`small-button success-button ${
									publishable || " disabled"
								}`}
								onClick={_ => publishable && changeDeck("published", true)}>
								{published
									? "Published"
									: !upToDate
									? "Save Changes First"
									: canPublish(list, format)
									? "Publish!"
									: "Can't Publish"}
							</button>
						) : (
							<h4>{published ? "Published" : "Draft"}</h4>
						)}

						{canEdit() ? (
							<BasicSearch
								self={privacy}
								options={["Public", "Unlisted", "Private"]}
								callBack={p => changeDeck("privacy", p)}
							/>
						) : (
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
						)}
						<div className="even bar icon-eye views">{views}</div>
						<button
							className={`small-button likes even bar icon-thumbs-up ${
								canLike || "disabled"
							} ${user.liked && user.liked.includes(_id) && "selected"}`}
							onClick={giveLike}>
							{likes}
						</button>
					</div>
				</div>
			</div>
		)
	}
)
