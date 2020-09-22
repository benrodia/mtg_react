import React, {useEffect, useRef, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"
import "react-markdown-editor-lite/lib/index.css"

import ResolveSuggestions from "./ResolveSuggestions"
import NewSuggestion from "./NewSuggestion"

import Loading from "./Loading"
import BasicSearch from "./BasicSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Card from "./Card"
import DeckInfo from "./DeckInfo"
import ManageList from "./ManageList"

const {
	HOME_DIR,
	COLORS,
	textList,
	canPublish,
	canEdit,
	helpTiers,
	canSuggest,
	sum,
} = utilities

export default connect(({main: {decks}, deck}) => {
	return {decks, deck}
}, actions)(
	({
		deck,
		decks,
		openModal,
		newMsg,
		openDeck,
		cloneDeck,
		changeDeck,
		deleteDeck,
	}) => {
		const {slug, allow_suggestions, suggestions, desc, _id} = deck

		const stickyRef = useRef(null)
		const [offset, setOffset] = useState(0)
		const param = useParams().slug

		useEffect(
			_ => {
				if (decks.length && slug !== param) openDeck(param)
			},
			[slug, decks]
		)

		useEffect(
			_ => {
				if (stickyRef.current) setOffset(stickyRef.current.clientHeight)
			},
			[stickyRef]
		)

		const DeckOptions = _ => (
			<div className="quick-import col thin-block">
				<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
					<button className="full-width icon-play">Playtest Deck</button>
				</Link>
				<button
					className="small-button icon-download"
					onClick={_ =>
						openModal({title: "Download File", content: <DownloadFile />})
					}>
					Download File
				</button>
				<button
					className="small-button icon-clipboard"
					onClick={_ => {
						navigator.clipboard.writeText(textList(deck.list, true))
						newMsg("Copied list to clipboard!", "success")
					}}>
					Copy to Clipboard
				</button>
				{deck.clone ? (
					<Link to={`${HOME_DIR}/deck/${deck.clone}`}>
						<button className="small-button success-button fill">
							Cloned! Open Deck
						</button>
					</Link>
				) : (
					<button
						className="small-button icon-clone"
						onClick={_ => cloneDeck()}>
						Clone Deck
					</button>
				)}
				{!canEdit() ? null : (
					<button
						className="inverse-small-button warning-button icon-trash"
						onClick={_ => deleteDeck(_id)}>
						Delete Deck
					</button>
				)}
			</div>
		)

		return !decks.filter(d => d.slug === param)[0] ? (
			<Loading
				spinner={" "}
				message={"No Deck Here"}
				subMessage={<Link to={HOME_DIR}>Return To Home</Link>}
			/>
		) : !deck.list.length ? (
			<Loading message={"Loading Cards"} />
		) : (
			<div className="builder">
				<section className="deck-area">
					<div ref={stickyRef}>
						<div className="deck-head bar spaced-bar spread">
							<DeckInfo />
							<DeckOptions />
						</div>
						<ManageList />
					</div>
					<BoardFilters offset={offset} />
					<Board />
					<div className="big-block bar spaced-bar fill spread">
						<div className="desc ">
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
						<div className="min">
							<h4 className="bar even mini-spaced-bar">
								<span>Suggestions: </span>
								{canEdit() ? (
									<BasicSearch
										self={helpTiers[allow_suggestions || 0]}
										options={helpTiers}
										callBack={p =>
											changeDeck("allow_suggestions", helpTiers.indexOf(p))
										}
									/>
								) : (
									<span>{helpTiers[allow_suggestions]}</span>
								)}
							</h4>
							{canEdit() ? (
								<button
									className={`block ${
										(suggestions && suggestions.length) || "disabled"
									}`}
									onClick={_ =>
										openModal({
											title: "Resolve Suggestions",
											content: <ResolveSuggestions />,
										})
									}>
									Pending ({suggestions ? suggestions.length : 0})
								</button>
							) : (
								<div>
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
									{!canSuggest() && !canEdit() && allow_suggestions > 1 ? (
										<p className="asterisk">*Log in to make suggestions</p>
									) : null}
								</div>
							)}
						</div>
					</div>
				</section>
				<section className="side-bar">
					<DeckStats offset={offset} />
				</section>
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

			<button
				className={`mini-block success-button ${t === text && "disabled"}`}
				onClick={_ => callBack(t)}>
				Update {name}
			</button>
		</div>
	)
}
