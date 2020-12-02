import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import NewDeck from "./NewDeck"
import DeckFeed from "./DeckFeed"
import AdvancedFilters from "./AdvancedFilters"
import AdvancedField from "./AdvancedField"
import AdvancedCart from "./AdvancedCart"
import CardControls from "./CardControls"
import Loading from "./Loading"
import CounterInput from "./CounterInput"

const {
	BOARDS,
	formatManaSymbols,
	formatText,
	filterAdvanced,
	rnd,
	sum,
	paginate,
} = utilities
export default connect(
	({main: {cardData}, deck: {list, _id}, filters: {advanced}}) => {
		return {cardData, list, _id, advanced}
	},
	actions
)(
	({
		cardData,
		list,
		_id,
		advanced,
		changeAdvanced,
		openModal,
		newMsg,
		addCard,
		getCardData,
	}) => {
		const {terms, by, asc, interested, nameEntry} = advanced
		const pageLimit = 10
		const maxRes = 50

		const [loadingCards, setLoadingCards] = useState(false)
		const [filtered, setFiltered] = useState(cardData)
		const [results, setResults] = useState([[]])
		const [page, setPage] = useState(0)

		useEffect(
			_ => {
				setLoadingCards(true)
				if (!cardData.length) {
					getCardData()
				}
				if (nameEntry.length)
					setFiltered(matchSorter(filtered, nameEntry, {keys: ["name"]}))
				else setFiltered(filterAdvanced(cardData, advanced))
			},
			[cardData, terms, nameEntry]
		)
		useEffect(
			_ => {
				if (cardData.length) {
					setPage(0)
					setLoadingCards(false)
					if (terms.length && !nameEntry.length)
						setResults(
							paginate(filtered.orderBy(by).slice(0, maxRes), pageLimit)
						)
					if (nameEntry.length)
						setResults(paginate(filtered.slice(0, maxRes), pageLimit))
					else setResults([rnd(filterAdvanced(cardData, advanced), pageLimit)])
				}
			},
			[cardData, filtered, by, asc]
		)
		const pages =
			results.length === 1 ? null : (
				<div className="pages block bar even mini-spaced-bar">
					<h4>
						{results.length > 1
							? `${page * pageLimit + 1}-${
									page * pageLimit + results[page].length
							  } of ${sum(results.map(r => r.length))}${
									sum(results.map(r => r.length)) === maxRes ? "+" : ""
							  }`
							: results.length
							? `${results[0].length}`
							: ""}
					</h4>
					<div className="bar">
						<button
							key={"paginate_last"}
							className={`icon-left smaller-button ${page <= 0 && "disabled"}`}
							onClick={_ => setPage(page - 1)}
						/>
						{results.map((_, i) => (
							<button
								key={"page_btn_" + i}
								className={`smaller-button ${page === i && "selected"}`}
								onClick={_ => setPage(i)}>
								{i + 1}
							</button>
						))}
						<button
							key={"paginate_next"}
							className={`icon-right smaller-button ${
								page >= results.length - 1 && "disabled"
							}`}
							onClick={_ => setPage(page + 1)}
						/>
					</div>
				</div>
			)

		const ResultCard = ({c}) => (
			<div key={c.id} className="mini-block bar even spread">
				<div className="bar">
					<CardControls card={c} context={"builder"} />
					<div className="info">
						<div className="bar even mini-spaced-bar">
							<h3>{c.name}</h3>
							<span>{formatManaSymbols(c.mana_cost)}</span>
						</div>
						<h4>{c.type_line}</h4>
						<div>{formatText(c.oracle_text)}</div>
						{c.power === undefined ? null : `${c.power}/${c.toughness}`}
					</div>
				</div>
				<div className="add-to col">
					{!_id
						? null
						: BOARDS.map(B => (
								<button
									key={B}
									className={`small-button ${
										!!list.filter(l => l.board === B && c.name === l.name)[0] &&
										"selected"
									}`}
									onClick={_ => addCard(c, B)}>
									{B}:{" "}
									{list.filter(l => l.board === B && c.name === l.name).length}
								</button>
						  ))}
				</div>
			</div>
		)
		return (
			<div>
				{terms.length || nameEntry.length ? (
					<h2 className={"block"}>Results</h2>
				) : (
					<div className="block bar even mini-spaced-bar">
						<h2>Random Cards</h2>
						<button
							className="small-button icon-loop"
							onClick={_ =>
								setResults([rnd(filterAdvanced(cardData, advanced), pageLimit)])
							}>
							Shuffle
						</button>
					</div>
				)}
				{pages}
				{loadingCards ? (
					<Loading message={"Loading Cards"} />
				) : !results[page].length ? (
					<Loading spinner={" "} anim="none" message="No Matches :(" />
				) : (
					results[page].map(c => <ResultCard key={c.id} c={c} />)
				)}
				{pages}
			</div>
		)
	}
)

// <button
// 	className={`small-button ${
// 		!!interested.filter(int => int.name === c.name)[0] && "selected"
// 	}`}
// 	onClick={_ => {
// 		const wo = interested.filter(int => int.name !== c.name)
// 		changeAdvanced({
// 			interested:
// 				wo.length === interested.length
// 					? [{...c, key: uuidv4()}, ...interested]
// 					: wo,
// 		})
// 	}}>
// 	Interested
// </button>
