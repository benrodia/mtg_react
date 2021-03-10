import React, {useState, useEffect} from "react"
import {Link, useHistory} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import ImportFile from "./ImportFile"
import BasicSearch from "./BasicSearch"
import GenerateDeck from "./GenerateDeck"
import ToolTip from "./ToolTip"
import CardControls from "./CardControls"

const {
	HOME_DIR,
	ItemTypes,
	BOARDS,
	FORMATS,
	EXAMPLE_DECK_NAMES,
	rnd,
	createSlug,
	collapseDeckData,
	interpretForm,
	pluralize,
	textList,
	titleCaps,
	itemizeDeckList,
	getCardFace,
	mapColors,
} = utilities

export default connect(
	({
		auth: {
			user: {_id},
			isAuthenticated,
		},
		main: {cardData, decks},
		filters: {
			advanced: {cart},
		},
	}) => {
		return {
			_id,
			isAuthenticated,
			cardData,
			decks,
			cart,
		}
	},
	actions
)(
	({
		cards,
		_id,
		setPage,
		isAuthenticated,
		cardData,
		decks,
		cart,
		newDeck,
		openModal,
		openDeck,
	}) => {
		const [name, setName] = useState("")
		const [slug, setSlug] = useState("")
		const [format, setFormat] = useState("casual")
		const [desc, setDesc] = useState("")
		const [feature, setFeature] = useState("")
		const [list, setList] = useState(cards || cart || [])
		const [listForm, setListForm] = useState(textList(cards || cart) || "")

		const [exName, setExName] = useState(rnd(EXAMPLE_DECK_NAMES))
		const [exList, setExList] = useState("")

		useEffect(
			_ => {
				cardData.length &&
					setExList(
						[...Array(7)]
							.map((_, i) => {
								if (!i) return "ex."
								return rnd(3) + 1 + " " + rnd(cardData.map(c => c.name))
							})
							.join("\n")
					)
			},
			[cardData.length]
		)

		useEffect(
			_ => {
				setSlug(createSlug(name, decks))
			},
			[name]
		)
		useEffect(
			_ => {
				if (list.length) {
					const feat = list.find(li => getCardFace(li).image_uris.art_crop)
					setFeature(feat ? getCardFace(feat).image_uris.art_crop : "")
				}
			},
			[list]
		)

		const pageHistory = useHistory()
		return (
			<div className="new-deck section">
				<h1 className="block">New Deck</h1>
				<div className="block flex-row mini-spaced-bar">
					<div>
						<h2>Create From File</h2>
						<p className="asterisk mini-block">
							Import a .txt, .dek, or .mwDeck file. Please remember to credit
							the creator in the description below.
						</p>
						<ImportFile
							accept=".txt,.dek,.mwDeck"
							callBack={({meta: {name, format, creator}, cards, text, err}) => {
								if (!err) {
									setList(cards)
									setListForm(text)
									if (name) setName(name)
									if (format) setFormat(format)
									if (creator) setDesc(`Original Creator: ${creator}`)
								}
							}}
						/>
					</div>
					<GenerateDeck
						setName={n => setName(n)}
						callBack={d => {
							setFormat("commander")
							setList(d)
							setListForm(textList(d))
						}}
					/>
				</div>

				<div className="block col">
					<h3>Name</h3>
					<input
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={`ex. "${exName}"`}
					/>
					<span className="asterisk">
						{name.length ? `URL: "deck/${slug}/"` : "Name Required"}
					</span>
				</div>
				<div className="block">
					<h3>Format</h3>
					<BasicSearch
						options={FORMATS}
						self={titleCaps(format)}
						labelBy={f => titleCaps(f)}
						callBack={f => setFormat(f)}
					/>
				</div>
				<div className="block col">
					<span className="bar start">
						<h3>List</h3>
						<ToolTip
							message={
								"You can add cards later if you want. Check out the card search to find and add a variety of cards easily."
							}>
							<span className="asterisk icon-help-circled" />
						</ToolTip>
					</span>
					<span className="quick-search">
						<BasicSearch
							options={cardData}
							searchable
							placeholder={"Enter card names"}
							renderAs={c => <CardControls card={c} cardHeadOnly />}
							callBack={c => {
								const newD = [...list, c]
								setList(newD)
								setListForm(textList(newD))
							}}
						/>
					</span>
					<div className="flex-row mini-spaced-bar">
						<textarea
							className="full-width"
							value={listForm}
							rows={"15"}
							// cols={"50"}
							onChange={e => {
								const val = e.target.value
								setListForm(val)
								setList(interpretForm(val, cardData))
							}}
							placeholder={exList}
						/>
						<div className={`board-inner `}>
							<h2>Cards ({list.length})</h2>
							<div className="list-inner">
								{itemizeDeckList(list).map(cards => (
									<div
										key={cards.length + cards[0].id}
										className="flex-row mini-spaced-bar">
										<div className="col quant-tickers">
											<div
												className="button icon-plus"
												onClick={_ => {
													const newD = [...list, cards[0]]
													setList(newD)
													setListForm(textList(newD))
												}}
											/>
											<div
												className="button icon-minus"
												onClick={_ => {
													const removed = list.findIndex(
														li => li.name === cards[0].name
													)
													const newD = list.filter((c, i) => i !== removed)
													setList(newD)
													setListForm(textList(newD))
												}}
											/>
										</div>
										<CardControls
											card={cards[0]}
											quant={cards.length}
											itemType={ItemTypes.CARD}
											cardHeadOnly
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="block">
					<h3>Featured Card</h3>
					<div
						className={`feature-full ${list.length || "disabled"}`}
						onClick={_ =>
							openModal({
								title: "Choose Featured Card",
								content: (
									<div className="bar">
										{list.unique("id").map(c => (
											<span
												key={c.id}
												onClick={_ => {
													setFeature(getCardFace(c).image_uris.art_crop)
													openModal(null)
												}}>
												<CardControls card={c} />
											</span>
										))}
									</div>
								),
							})
						}>
						<img src={feature} alt={"featured image"} className="icon" />
					</div>
				</div>
				<button
					className={`success-button block ${name.length || "disabled"}`}
					onClick={_ => {
						if (isAuthenticated) {
							newDeck(_id, {
								name: name.length ? name : "New Deck",
								slug,
								format,
								desc,
								list: collapseDeckData(list),
								feature,
								colors: mapColors(list),
							})
							openDeck(slug)
							pageHistory.push(`${HOME_DIR}/deck/${slug}`)
						}
					}}>
					CREATE!
				</button>
			</div>
		)
	}
)
