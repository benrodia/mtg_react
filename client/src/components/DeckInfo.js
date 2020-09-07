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
	COLORS,
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

export default connect(({auth: {user}, main: {legalCards, users}, deck}) => {
	return {user, legalCards, users, ...deck}
}, actions)(
	({
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
		helpWanted,
		suggestions,
		changes,
		legalCards,
		users,
		openModal,
		changeDeck,
		giveLike,
	}) => {
		const featureImg = feature || (list[0] && list[0].image_uris.art_crop)
		const canLike = user.isAuthenticated && author !== user._id
		const pickFeatured = (
			<div className="block mini-spaced-grid bar wrap">
				{list.unique("id").map(c => (
					<div
						key={c.id}
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
								{formattedDate(new Date(created))} - Updated {ago(new Date(updated))}
							</p>
						</div>
						<div className="meta bar even mini-spaced-bar">
							<div className="even bar">
								{views}
								<div className="icon-eye views" />
							</div>
							<div className={"likes even bar"} onClick={giveLike}>
								{likes}
								<div
									className={`clicky-icon icon-thumbs-up ${user.liked && user.liked.includes(_id) && "selected"} ${
										canLike || "disabled"
									}`}
								/>
							</div>
							{canEdit() ? (
								<BasicSearch
									self={privacy}
									options={["Public", "Unlisted", "Private"]}
									callBack={p => changeDeck("privacy", p)}
								/>
							) : (
								<div className="tag">{privacy}</div>
							)}
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
							Leave a Suggestion
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
