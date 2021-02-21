import React, {useEffect, useState} from "react"
import {connect} from "react-redux"
import axios from "axios"

import {Link} from "react-router-dom"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DropSlot from "./DropSlot"
import BasicSearch from "./BasicSearch"
import PrintSelector from "./PrintSelector"
import Card from "./Card"
import Icon from "./Icon"

const {
	HOME_DIR,
	Q,
	titleCaps,
	canEdit,
	orderBy,
	getTags,
	getCardFace,
	itemizeDeckList,
	createSlug,
} = utilities

export default connect(
	({
		filters,
		main: {sets},
		deck: {list, format, author, editing, unsaved, custom},
	}) => {
		return {
			sets,
			...filters,
			list,
			format,
			author,
			editing,
			unsaved,
			custom,
		}
	},
	actions
)(
	({
		tune,
		sets,
		list,
		custom,
		board,
		addCard,
		changeCard,
		changeDeck,
		changeCustom,
		changeFilters,
	}) => {
		const tuneSet = !list.length ? [] : Q(list, "name", tune.name)
		const getCustom = _ =>
			(tune && tune.name && custom.find(cu => cu.name === tune.name)) || {}

		const [active, setActive] = useState(getCardFace(tuneSet[0] || {}))
		const [notes, setNotes] = useState(getCustom().notes || "")
		const [prints, setPrints] = useState([])
		useEffect(
			_ => {
				setActive(tuneSet[0])
				setNotes(getCustom().notes || "")
				axios
					.get(
						`https://api.scryfall.com/cards/search?unique=prints&order=released&q=${encodeURIComponent(
							tune.name
						)}`
					)
					.then(res => setPrints(res.data.data.orderBy("released_at", true)))
					.catch(err => console.log(err))
			},
			[tune]
		)

		const setLine = c => (
			<div className="flex-row even mini-spaced-bar">
				<Icon
					name={c.set_name}
					className={`${c.rarity}`}
					loader={c.set}
					src={
						!sets.length
							? null
							: (sets.filter(s => s.name === c.set_name)[0] || {}).icon_svg_uri
					}
				/>
				<span>{c.set_name}</span>
			</div>
		)

		const Prints = _ => (
			<div className="mini-spaced-col">
				{itemizeDeckList(tuneSet, ["set"]).map((ofSet, ind) => {
					const copy = ofSet[ofSet.length - 1]
					return (
						<div
							key={copy.key}
							className={`flex-row even spread ${
								active.id === copy.id && "selected"
							}`}
							onClick={_ => setActive(copy)}>
							<span onClick={e => e.stopPropagation()}>
								<BasicSearch
									options={prints}
									labelBy={setLine}
									placeholder={setLine(copy)}
									callBack={c => {
										changeCard(copy, c)
										setActive(c)
									}}
								/>
							</span>
							<div
								className={`bar even mini-spaced-bar ${
									active.id === copy.id && "dark-text"
								}`}>
								<h3>{ofSet.length}</h3>
								<div className="bar">
									<button
										className="small-button icon-plus"
										onClick={_ => addCard(copy, board)}
									/>
									<button
										className="small-button icon-minus"
										onClick={_ => addCard(copy, null, true)}
									/>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		)

		const Links = _ => {
			const links = active.related_uris || {}
			return (
				<div className="links mini-spaced-col">
					<h4 className="light-text">Related Links</h4>
					<div className="bar">
						<a target="_blank" href={links.gatherer}>
							<button className="small-button">Gatherer</button>
						</a>
						<a target="_blank" href={links.mtgtop8}>
							<button className="small-button">MTGtop8</button>
						</a>
						<a target="_blank" href={links.tcgplayer_decks}>
							<button className="small-button">TCGplayer Decks</button>
						</a>
					</div>
				</div>
			)
		}

		return (
			<div className="card-tuner">
				{!tuneSet.length || !active ? (
					<Loading
						spinner=" "
						anim=" "
						subMessage={"Select a card to highlight"}
					/>
				) : (
					<div className="inner mini-spaced-col">
						<span className="tune-card">
							<Card card={active} />
							<Link to={`${HOME_DIR}/card/${createSlug(active.name)}/info`}>
								<button className="smaller-button">View Card Page</button>
							</Link>
						</span>
						<div className="thin-pad">
							<Prints />
							<div className="mini-block">
								<h4 className="light-text">Category</h4>
								<BasicSearch
									options={[
										...custom
											.unique("category")
											.map(cu => cu.category)
											.filter(cu => !!cu),
										...getTags(active).map(t => t.name),
									]}
									self={getCustom().category || "Uncategorized"}
									searchable
									preview
									addable
									callBack={e => changeCustom(active.name, {category: e})}
								/>
							</div>
							<div className="mini-block">
								<h4 className="light-text">Notes</h4>
								<textarea
									cols="30"
									rows="10"
									placeholder="Add notes about this card"
									value={notes}
									onChange={e =>
										changeCustom(active.name, {notes: e.target.value})
									}
								/>
							</div>
							<Links />
						</div>
					</div>
				)}
			</div>
		)
	}
)
// <div className="mini-block">
// 	<h4>Tags</h4>
// 	<div className="row">
// 		{getTags(active).map(t => (
// 			<div className="tag">{t.name}</div>
// 		))}
// 	</div>
// </div>

// {active.prices ? (
// 	<h4 className="light-text">${active.prices.usd}</h4>
// ) : null}
