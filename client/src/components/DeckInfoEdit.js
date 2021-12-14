import React, {useState, useEffect, useRef} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import BasicSearch from "./BasicSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import BulkEdit from "./BulkEdit"
import Icon from "./Icon"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import CardControls from "./CardControls"
import ToolTip from "./ToolTip"
import ResolveSuggestions from "./ResolveSuggestions"

const {
	HOME_DIR,
	FORMATS,
	COLORS,
	SINGLETON,
	textList,
	canPublish,
	sum,
	listDiffs,
	canEdit,
	helpTiers,
	helpDescs,
	titleCaps,
	itemizeDeckList,
	isLegal,
	completeness,
	pluralize,
	interpretForm,
} = utilities

export default connect(
	({main: {sets, cardData}, deck, filters: {board, basic, editing}}) => {
		return {
			sets,
			cardData,
			board,
			basic,
			editing,
			...deck,
		}
	},
	actions
)(
	({
		_id,
		name,
		desc,
		list,
		suggestions,
		allow_suggestions,
		preChanges,
		format,
		feature,
		complete,
		privacy,
		editing,
		unsaved,
		slug,
		board,
		sets,
		cardData,
		basic,
		newMsg,
		openModal,
		changeDeck,
		changeFilters,
		addCard,
		updateDeck,
		cloneDeck,
		saveDeck,
		deleteDeck,
		openDeck,
	}) => {
		const [open, setOpen] = useState(false)
		const [listed, setListed] = useState([])
		const featureImg =
			feature ||
			(list[0] && list[0].image_uris && list[0].image_uris.art_crop)

		useEffect(
			_ => {
				setListed(textList(list))
			},
			[list]
		)

		const pickFeatured = (
			<div className="block mini-spaced-grid bar">
				{list
					.unique("id")
					.filter(c => c.image_uris && c.image_uris.art_crop)
					.map((c, i) => (
						<div
							key={c.id + i}
							onClick={_ => {
								openModal(null)
								changeDeck("feature", c.image_uris.art_crop)
							}}
						>
							<CardControls card={c} />
						</div>
					))}
			</div>
		)
		const comp = completeness({list, format, name, desc})
		const comped = comp.every(ch => ch.v || ch.s)

		const needsSave = Object.keys(unsaved).length

		return (
			<div className="manage-list block pad ">
				<div className="bar spread even">
					<h2>Edit Deck</h2>
					<div className="bar mini-spaced-bar even">
						{needsSave ? (
							<p className="asterisk">
								{needsSave} unsaved{" "}
								{pluralize("change", needsSave)}
							</p>
						) : (
							<button
								className="small-button"
								onClick={_ => changeFilters("editing", false)}
							>
								Stop Editing
							</button>
						)}
						<ToolTip
							message={
								comped
									? ""
									: "If you save while some conditions are unmet, deck will be marked incomplete."
							}
						>
							<button
								className={`small-button icon-${
									comped ? "ok" : "attention"
								} ${needsSave || "disabled"}`}
								onClick={saveDeck}
							>
								Save
							</button>
						</ToolTip>
						<button
							className={`warning-button inverse-small-button icon-trash ${
								needsSave || "disabled"
							}`}
							onClick={_ => saveDeck(true)}
						>
							Discard
						</button>
					</div>
				</div>
				<div className="block flex-row spread">
					<div className="spaced-grid">
						<div className="bar mini-spaced-bar">
							<div>
								<h4>Featured Card</h4>
								<span className="feature-full">
									<div
										style={{display: canEdit() || "none"}}
										className={`change-img flex-centered`}
										onClick={_ =>
											openModal({
												title: "Featured Card",
												content: pickFeatured,
											})
										}
									>
										<span>Change</span>
									</div>
									<img src={featureImg} alt="" />
								</span>
							</div>

							<div>
								<h4>Name</h4>
								<input
									type="text"
									value={name}
									onChange={e =>
										changeDeck("name", e.target.value)
									}
								/>
							</div>

							<div>
								<h4>Format</h4>
								<BasicSearch
									options={FORMATS}
									self={format}
									labelBy={f => titleCaps(f)}
									callBack={f => changeDeck("format", f)}
								/>
							</div>
							<div>
								<h4>Visibility</h4>
								<BasicSearch
									self={privacy}
									options={["Public", "Unlisted", "Private"]}
									callBack={p => changeDeck("privacy", p)}
								/>
							</div>
							<div>
								<h4>Allow Suggestions</h4>
								<BasicSearch
									self={helpTiers[allow_suggestions || 0]}
									options={helpTiers}
									callBack={p =>
										changeDeck(
											"allow_suggestions",
											helpTiers.indexOf(p)
										)
									}
									renderAs={p => (
										<ToolTip
											message={[
												helpDescs[helpTiers.indexOf(p)],
											]}
										>
											{p}
										</ToolTip>
									)}
								/>
								<button
									className={`${
										suggestions.length || "disabled"
									}`}
									onClick={_ =>
										openModal({
											title: "Resolve Suggestions",
											content: <ResolveSuggestions />,
										})
									}
								>
									Pending (
									{
										suggestions.filter(s => !s.resolved)
											.length
									}
									)
								</button>
							</div>
						</div>
						<div>
							<span className="bar even spread">
								<h4>Description</h4>
								<button
									className="smaller-button"
									onClick={_ =>
										openModal({
											title: "Preview Description",
											content: (
												<Markdown>{desc}</Markdown>
											),
										})
									}
								>
									Preview
								</button>
							</span>
							<textarea
								rows={15}
								className="full-width"
								value={desc}
								placeholder={
									"A good description is worth 100 images"
								}
								onChange={t =>
									changeDeck("desc", t.target.value)
								}
							/>
						</div>

						<div>
							<span className="flex-row even spread">
								<h4>List</h4>
								<button
									className="smaller-button"
									onClick={_ => {
										const {found, notFound} = interpretForm(
											listed,
											cardData
										)
										addCard(found, null, null, true)
									}}
								>
									Apply to list
								</button>
							</span>
							<textarea
								rows={"15"}
								className="full-width"
								value={listed}
								onChange={e => setListed(e.target.value)}
								placeholder={"Add cards here"}
							/>
						</div>
					</div>
					<div>
						<h4>
							Completeness ({comp.filter(c => c.v || c.s).length}/
							{comp.filter(c => !c.s).length})
						</h4>
						{comp.map(({l, v, f, s}) =>
							s ? null : (
								<ToolTip message={!v ? f : null}>
									<div
										className={`asterisk icon-${
											v ? "ok" : "cancel disabled"
										}`}
									>
										{l}
									</div>
								</ToolTip>
							)
						)}
					</div>
				</div>
			</div>
		)
	}
)
// 		<button
// 	className={`small-button mini-block ${comped && "icon-ok"} ${
// 		(comp && !complete) || "disabled"
// 	}`}
// 	onClick={_ => comp && changeDeck("complete", true)}>
// 	{comp ? (complete ? "Completed" : "Mark Complete") : "Incomplete"}
// </button>

// <button
// 	className="inverse-small-button warning-button icon-trash thin-pad"
// 	onClick={_ => {
// 		if (window.confirm("Delete Deck?")) deleteDeck(_id)
// 	}}>
// 	Delete
// </button>
