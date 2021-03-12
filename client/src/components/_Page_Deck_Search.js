import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import matchSorter, {rankings} from "match-sorter"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DeckTile from "./DeckTile"
import BasicSearch from "./BasicSearch"
import Paginated from "./Paginated"

const {
	HOME_DIR,
	COLORS,
	FORMATS,
	getDecks,
	creator,
	titleCaps,
	formatManaSymbols,
} = utilities

export default connect(
	({
		main: {decks, users, cardData},
		filters: {deckSearch},
		auth: {
			user: {_id, followed},
		},
	}) => {
		return {decks, users, cardData, deckSearch, _id, followed}
	},
	actions
)(
	({
		noLink,
		decks,
		users,
		cardData,
		_id,
		followed,
		deckSearch,
		newDeck,
		openModal,
		refreshData,
		loadDecks,
		changeDeckSearch,
	}) => {
		const {name, flags, sortBy, asc, format, colors, author} = deckSearch

		const [results, setResults] = useState(decks || [])
		useEffect(
			_ => {
				setResults(
					matchSorter(
						decks.filter(d => {
							let included = true
							if (format !== "---") included = d.format === format
							if (author !== "---") included = d.author === author
							if (colors.length)
								included = colors.every(
									co => d.colors[COLORS("symbol").indexOf(co)] > 0
								)

							const inc = inc => included && flags.includes(inc)
							if (inc("followed")) included = followed.includes(d._id)
							if (inc("complete")) included = d.complete
							if (inc("helpWanted")) included = d.helpWanted >= 3
							return included
						}),
						name,
						{keys: ["name"]}
					).orderBy(sortBy, asc)
				)
			},
			[deckSearch, decks]
		)

		const handleFlags = flag => {
			changeDeckSearch({
				flags: flags.includes(flag)
					? flags.filter(f => f !== flag)
					: [...flags, flag],
			})
		}

		const authors = [
			{name: "---", _id: "---"},
			...(_id
				? [users.find(u => u._id === _id), ...users.filter(u => u._id !== _id)]
				: users),
		].orderBy("name")

		return (
			<div className="decks section">
				<h1 className="block">Deck Search</h1>
				<span className="bar mini-spaced-bar">
					<div className="mini-block">
						<h4>Name</h4>
						<input
							type="text"
							id="deck-name-search"
							value={name}
							placeholder={"Search Decks by Name"}
							onChange={e => changeDeckSearch({name: e.target.value})}
						/>
					</div>
					<div className="mini-block">
						<h4>Author</h4>
						<BasicSearch
							searchable
							preview
							limit={20}
							self={creator(author)}
							options={authors}
							labelBy={a =>
								`${a && a.name ? a.name : "---"} ${
									a && a._id === _id ? "(you)" : ""
								}`
							}
							callBack={a => changeDeckSearch({author: a._id})}
						/>
					</div>
					<div className="mini-block">
						<h4>Format</h4>
						<BasicSearch
							self={format}
							options={["---", ...FORMATS]}
							labelBy={f => titleCaps(f)}
							callBack={f => changeDeckSearch({format: f})}
						/>
					</div>
					<div className="mini-block">
						<h4>Colors</h4>
						<div className="flex-row even mini-spaced-bar">
							{COLORS("symbol").map((co, i) => (
								<span
									key={"color_filter_" + co}
									className={`mana-button ${colors.includes(co) && "selected"}`}
									onClick={_ =>
										changeDeckSearch({
											colors: colors.includes(co)
												? colors.filter(c => c !== co)
												: [...colors, co],
										})
									}>
									{formatManaSymbols(`{${co}}`)}
								</span>
							))}
						</div>
					</div>
					<div className="mini-block">
						<h4>Show Only</h4>
						<div className="bar even">
							<button
								className={`small-button ${
									flags.includes("complete") && "selected"
								}`}
								onClick={_ => handleFlags("complete")}>
								Complete Decks
							</button>
							{followed && followed.length ? (
								<button
									className={`small-button ${
										flags.includes("followed") && "selected"
									}`}
									onClick={_ => handleFlags("followed")}>
									Followed Users
								</button>
							) : null}
							<button
								className={`small-button ${
									flags.includes("helpWanted") && "selected"
								}`}
								onClick={_ => handleFlags("helpWanted")}>
								Help Wanted
							</button>
						</div>
					</div>
				</span>

				<div className="decks ">
					{decks.length ? (
						results.length ? (
							<Paginated
								options={results}
								render={d => (
									<DeckTile
										key={"TILE__" + d._id}
										deck={d}
										newDeck={d.new}
										noLink={noLink}
									/>
								)}
								sorts={[
									{name: "Recent", key: "updated"},
									{name: "Popular", key: "views"},
									{name: "Format", key: "format"},
								]}
							/>
						) : (
							<Loading spinner={null} message="No Decks Found :(" />
						)
					) : (
						<Loading message="Loading Decks" />
					)}
				</div>
			</div>
		)
	}
)
