import React, {useEffect, useRef} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import actions from "../actions"
import utilities from "../utilities"

import CardControls from "./CardControls"
import BasicSearch from "./BasicSearch"
import AdvancedSearch from "./AdvancedSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import BulkEdit from "./BulkEdit"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Sticky from "./Sticky"

const {
	HOME_DIR,
	FORMATS,
	ItemTypes,
	SINGLETON,
	legalCommanders,
	chooseCommander,
	titleCaps,
	textList,
	formattedDate,
} = utilities

export default connect(({auth: {user: {_id}}, main: {legalCards}, deck}) => {
	return {_id, legalCards, ...deck}
}, actions)(
	({
		_id,
		name,
		format,
		desc,
		list,
		author,
		created,
		updated,
		url,
		board,
		legalCards,
		openModal,
		changeDeck,
		newMsg,
		setPage,
		addCard,
		cloneDeck,
		canEdit,
	}) => {
		const stickyRef = useRef(null)
		useEffect(_ => {
			setPage("Build")
		}, [])

		// Created {formattedDate(created)} - Lasted Updated {ago(new Date(updated))}

		const Info = _ => (
			<div className="info-readme">
				<div className="name bar even">
					<EditableText
						changeable={canEdit(author)}
						text={name}
						callBack={({text, method}) => method === "change" && changeDeck("name", text)}>
						<h1>{name}</h1>
					</EditableText>
					{canEdit(author) ? (
						<BasicSearch
							isHeader
							searchable
							options={FORMATS}
							placeholder={format}
							callBack={f => changeDeck("format", f)}
						/>
					) : (
						<h3 className="tag">{titleCaps(format)}</h3>
					)}
				</div>
				<div className="block">
					<h4></h4>
				</div>
				<EditableText
					changeable={canEdit(author)}
					area
					text={desc}
					callBack={({text, method}) => method === "change" && changeDeck("desc", text)}>
					{desc.split("\n").map(d => (
						<p key={d} className={"mini-block"}>
							{d}
						</p>
					))}
				</EditableText>
			</div>
		)

		const EditOptions = _ => (
			<div className="add-search col">
				<div className="search-bar">
					<h4>Search Cards</h4>
					<BasicSearch
						searchable
						unique
						orderBy={"name"}
						limit={20}
						label={c => c.name}
						options={legalCards}
						callBack={c => addCard(c, board)}
						placeholder={"Search For Cards"}
					/>
				</div>
				<button onClick={_ => openModal({title: "Advanced Search", content: <AdvancedSearch />})}>
					Advanced Search
				</button>
				<button className="icon-upload" onClick={_ => openModal({title: "Bulk Edit", content: <BulkEdit />})}>
					Bulk Edit
				</button>
			</div>
		)
		const offset = stickyRef.current && stickyRef.current.clientHeight
		return (
			<div className="builder">
				<section className="deck-area">
					<div ref={stickyRef}>
						<Info />
						{canEdit(author) ? <EditOptions /> : null}
					</div>
					<BoardFilters offset={offset} />
					<Board />
				</section>
				<section className="side-bar">
					<div className="quick-import">
						<Sticky offset={offset}>
							<div className="playtest-button">
								<Link to={`${HOME_DIR}/test/${url}`}>
									<button className="success-button">Playtest Deck</button>
								</Link>
							</div>
						</Sticky>
						<div className="exports col">
							<button
								className="small-button icon-download"
								onClick={_ => openModal({title: "Download File", content: <DownloadFile />})}>
								Download File
							</button>
							<button
								className="small-button icon-docs"
								onClick={_ => {
									navigator.clipboard.writeText(textList(list))
									newMsg("Copied list to clipboard!", "success")
								}}>
								Copy to Clipboard
							</button>
							<button className="small-button" onClick={cloneDeck}>
								Clone Deck
							</button>
						</div>
					</div>
					<DeckStats />
				</section>
			</div>
		)
	}
)
