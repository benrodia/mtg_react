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
import Card from "./Card"

const {
	HOME_DIR,
	FORMATS,
	COLORS,
	textList,
	canPublish,
	sum,
	listDiffs,
	canEdit,
	helpTiers,
	titleCaps,
} = utilities

export default connect(({main: {sets}, deck, filters: {board, basic}}) => {
	return {
		sets,
		board,
		basic,
		...deck,
	}
}, actions)(
	({
		name,
		desc,
		list,
		suggestions,
		allow_suggestions,
		preChanges,
		format,
		feature,
		published,
		privacy,
		editing,
		board,
		sets,
		basic,
		newMsg,
		openModal,
		changeDeck,
		changeFilters,
		addCard,
		updateDeck,
		cloneDeck,
	}) => {
		const [open, setOpen] = useState(false)
		const featureImg =
			feature || (list[0] && list[0].image_uris && list[0].image_uris.art_crop)
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

		const inner = (
			<div className="inner">
				<div className="bar spaced-bar">
					<div className="col mini-block">
						<h4>Featured Card</h4>
						<span
							className="feature icon"
							onClick={_ =>
								openModal({title: "Featured Card", content: pickFeatured})
							}>
							<div className="change-img flex-centered">
								<span>Change</span>
							</div>
							<img src={featureImg} alt="" />
						</span>
					</div>
					<div className="col mini-block">
						<h4>Name</h4>
						<input
							type="text"
							value={name}
							onChange={e => changeDeck("name", e.target.value)}
						/>
					</div>

					<div className="col mini-block">
						<h4>Format</h4>
						<BasicSearch
							options={FORMATS}
							self={format}
							labelBy={f => titleCaps(f)}
							callBack={f => changeDeck("format", f)}
						/>
					</div>
					<div className="col mini-block">
						<h4>Visibility</h4>
						<BasicSearch
							self={privacy}
							options={["Public", "Unlisted", "Private"]}
							callBack={p => changeDeck("privacy", p)}
						/>
					</div>
					<div className="col mini-block">
						<h4>Allow Suggestions</h4>
						<BasicSearch
							self={helpTiers[allow_suggestions || 0]}
							options={helpTiers}
							callBack={p =>
								changeDeck("allow_suggestions", helpTiers.indexOf(p))
							}
						/>
					</div>
				</div>
				<div className="col mini-block">
					<h4>Description</h4>
					<MdEditor
						value={desc}
						style={{height: "20rem"}}
						onChange={md => changeDeck("desc", md.text)}
						renderHTML={md => <Markdown>{md}</Markdown>}
					/>
				</div>
			</div>
		)

		return <div className="manage-list col spaced-bar">{inner}</div>
	}
)
