import React, {useEffect, useRef} from "react"
import {Link, useParams} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import {PieChart} from "react-minimal-pie-chart"
import actions from "../actions"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import AdvancedSearch from "./AdvancedSearch"
import DeckStats from "./DeckStats"
import BoardFilters from "./BoardFilters"
import BulkEdit from "./BulkEdit"
import Board from "./Board"
import DownloadFile from "./DownloadFile"
import EditableText from "./EditableText"
import Card from "./Card"

const {HOME_DIR, FORMATS, COLORS, ItemTypes, sum, audit, titleCaps, textList, formattedDate} = utilities

export default connect(
	({
		auth: {
			user: {_id},
		},
		main: {cardData, legalCards, users, decks},
		deck,
		filters: {board, basic},
	}) => {
		return {_id, cardData, legalCards, users, decks, ...deck, board, basic}
	},
	actions
)(
	({
		_id,
		name,
		format,
		desc,
		list,
		author,
		created,
		updated,
		feature,
		changes,
		board,
		cardData,
		legalCards,
		users,
		decks,
		basic,
		openModal,
		changeDeck,
		changeFilters,
		newMsg,
		setPage,
		addCard,
		openDeck,
		cloneDeck,
		canEdit,
		updateDeck,
	}) => {
		const stickyRef = useRef(null)
		const {slug} = useParams()
		useEffect(
			_ => {
				if (decks.length) {
					console.log("openDeck w cardData")
					openDeck(slug)
				}
			},
			[slug, decks]
		)
		const creator = users.filter(u => u._id === author)[0] || {}

		const colorData = COLORS().map(color => {
			const value = sum(list.map(c => c.mana_cost.split("").filter(i => i === color.symbol).length))
			return {label: color.name, value, color: color.fill}
		})
		const featureImg = feature || (list[0] && list[0].image_uris.art_crop)
		console.log("canEdit", canEdit(author))

		const pickFeatured = (
			<div className="block mini-spaced-grid bar wrap">
				{list.unique("id").map(c => (
					<div onClick={_ => changeDeck("feature", c.image_uris.art_crop)}>
						<Card card={c} />
					</div>
				))}
			</div>
		)

		const Info = _ => (
			<div className="info-readme">
				<div className="bar spaced-bar">
					<span
						className="feature icon"
						onClick={_ => canEdit(author) && openModal({title: "Featured Card", content: pickFeatured})}>
						{canEdit(author) ? (
							<div className="change-img flex-centered">
								<span>Change</span>
							</div>
						) : null}
						<img src={featureImg} alt="" />
					</span>
					<div className="col">
						<div className="name bar even">
							<EditableText
								changeable={canEdit(author)}
								text={name}
								callBack={({text, method}) => method === "change" && changeDeck("name", text)}>
								<h1>{name}</h1>
							</EditableText>
							{canEdit(author) ? (
								<BasicSearch isHeader options={FORMATS} placeholder={format} callBack={f => changeDeck("format", f)} />
							) : (
								<h3 className="tag">{titleCaps(format)}</h3>
							)}
						</div>
						<div className="mini-block bar even mini-spaced-bar">
							<h4>by</h4>
							<Link to={`${HOME_DIR}/user/${creator.slug}`}>
								<h4 className="inverse-button ">{creator.name}</h4>
							</Link>
							<p className="asterisk">
								{formattedDate(new Date(created))} - Updated {ago(new Date(updated))}
							</p>
						</div>
					</div>
				</div>
				<div className="block">
					<EditableText
						changeable={canEdit(author)}
						area
						text={desc}
						callBack={({text, method}) => method === "change" && changeDeck("desc", text)}>
						{desc.length ? (
							desc.split("\n").map(d => (
								<p key={d} className={"mini-block"}>
									{d}
								</p>
							))
						) : (
							<p>No Description</p>
						)}
					</EditableText>
				</div>
			</div>
		)

		const EditOptions = _ => (
			<div className="add-search big-block mini-spaced-col">
				<div className="search-bar">
					<div className="bar even mini-block mini-spaced-bar">
						<h4>Search Cards By</h4>
						<div className="bar even">
							<button
								className={`smaller-button ${basic.by === "name" && "selected"}`}
								onClick={_ => changeFilters("basic", {by: "name"})}>
								Name
							</button>
							<button
								className={`smaller-button ${basic.by === "oracle_text" && "selected"}`}
								onClick={_ => changeFilters("basic", {by: "oracle_text"})}>
								Text
							</button>
						</div>
					</div>
					<BasicSearch
						className="big"
						searchable
						searchBy={basic.by}
						unique
						orderBy={"name"}
						limit={10}
						options={legalCards}
						callBack={c => addCard(c, board)}
						placeholder={"Search For Cards"}
					/>
				</div>
				<div className="col">
					<button
						className="small-button"
						onClick={_ => openModal({title: "Advanced Search", content: <AdvancedSearch />})}>
						Advanced Search
					</button>
					<button
						className="small-button icon-upload"
						onClick={_ => openModal({title: "Bulk Edit", content: <BulkEdit />})}>
						Bulk Edit
					</button>
				</div>
				{canEdit(author) && changes ? (
					<div className="mini-block mini-spaced-bar bar full-width fill">
						<button className="small-button success-button icon-ok" onClick={updateDeck}>
							Save Changes
						</button>
						<button className="inverse-small-button warning-button icon-cancel" onClick={updateDeck}>
							Discard Changes
						</button>
					</div>
				) : null}
			</div>
		)
		const offset = stickyRef.current && stickyRef.current.clientHeight
		return (
			<div className="builder">
				<section className="deck-area">
					<div ref={stickyRef}>
						<Info />
					</div>
					<BoardFilters offset={offset} />
					<Board />
				</section>
				<section className="side-bar">
					{canEdit(author) ? <EditOptions /> : null}

					<div className="quick-import">
						<div className="playtest-button">
							<Link to={`${HOME_DIR}/deck/${slug}/playtest`}>
								<button className="success-button">Playtest Deck</button>
							</Link>
						</div>
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
					<DeckStats offset={offset} />
				</section>
			</div>
		)
	}
)
