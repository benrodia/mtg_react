import React, {useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

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
	creator,
	canSuggest,
	areFriends,
} = utilities

export default connect(({auth: {isAuthenticated, user}, main: {legalCards, users}, deck}) => {
	return {isAuthenticated, user, legalCards, users, ...deck}
}, actions)(
	({
		isAuthenticated,
		user,
		_id,
		name,
		format,
		desc,
		list,
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
		const featureImg = feature || (list[0] && list[0].image_uris && list[0].image_uris.art_crop)
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

		return (
			<div className="info-readme">
				<div className="bar spaced-bar">
					<span
						className="feature icon"
						onClick={_ => canEdit() && openModal({title: "Featured Card", content: pickFeatured})}>
						{canEdit() ? (
							<div className="change-img flex-centered">
								<span>Change</span>
							</div>
						) : null}
						<img src={featureImg} alt="" />
					</span>
					<div className="col">
						<div className="name bar even">
							<EditableText
								changeable={canEdit()}
								text={name}
								callBack={({text, method}) => method === "change" && changeDeck("name", text)}>
								<h1>{name}</h1>
							</EditableText>
							{canEdit() ? (
								<BasicSearch options={FORMATS} placeholder={format} callBack={f => changeDeck("format", f)} />
							) : (
								<h3 className="tag">{titleCaps(format)}</h3>
							)}
						</div>
						<div className="mini-block bar even mini-spaced-bar">
							<h4>{published ? "Published" : "Draft"} by</h4>
							<Link to={`${HOME_DIR}/user/${creator().slug}`}>
								<h4 className="inverse-button ">{creator().name}</h4>
							</Link>
							<p className="asterisk">
								Created {formattedDate(new Date(created))} - Updated {ago(new Date(updated))}
							</p>
						</div>
						<div className="meta bar even spaced-bar">
							{canEdit() ? (
								<BasicSearch
									self={privacy}
									options={["Public", "Unlisted", "Private"]}
									callBack={p => changeDeck("privacy", p)}
								/>
							) : (
								<div className={`icon-${privacy === "Private" ? "lock" : privacy === "Unlisted" ? "link" : "globe"}`}>
									{privacy}
								</div>
							)}
							<div className="even bar icon-eye views">{views}</div>
							<button
								className={`small-button likes even bar icon-thumbs-up ${canLike || "disabled"} ${
									user.liked && user.liked.includes(_id) && "selected"
								}`}
								onClick={giveLike}>
								{likes}
							</button>
						</div>
					</div>
				</div>
				<div className="desc big-block">
					<div className="bar even">
						<h4>Description</h4>
						{canEdit() ? (
							<div
								className="clicky-icon icon-pencil"
								onClick={_ =>
									openModal({
										title: "Change Description",
										content: (
											<EditMarkDown
												name={"Description"}
												text={desc}
												callBack={t => {
													changeDeck("desc", t)
													openModal(null)
												}}
											/>
										),
									})
								}
							/>
						) : null}
					</div>
					<div className="mini-block">
						<Markdown>{desc}</Markdown>
					</div>
				</div>
				<div className="block bar even mini-spaced-bar">
					{!canSuggest() ? null : (
						<button onClick={_ => openModal({title: "Leave a Suggestion", content: <NewSuggestion />})}>
							{allow_suggestions >= 3 ? "Please, " : ""}Leave a Suggestion{allow_suggestions >= 3 ? "!" : ""}
						</button>
					)}
				</div>
			</div>
		)
	}
)

const EditMarkDown = ({name, text, callBack}) => {
	const [t, setT] = useState(text)

	return (
		<div className="col block">
			<MdEditor
				value={t}
				style={{height: "20rem"}}
				onChange={md => setT(md.text)}
				renderHTML={md => <Markdown>{md}</Markdown>}
			/>

			<button className={`mini-block success-button ${t === text && "disabled"}`} onClick={_ => callBack(t)}>
				Update {name}
			</button>
		</div>
	)
}
