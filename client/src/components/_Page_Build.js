import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import AdvancedField from "./AdvancedField"
import BulkEdit1 from "./BulkEdit1"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import Loading from "./Loading"
import CounterInput from "./CounterInput"

const {
	BOARDS,
	COLORS,
	ADVANCED_GREPS,
	OPs,
	formatManaSymbols,
	filterColors,
	formatText,
	filterAdvanced,
	audit,
	Q,
	rnd,
	sum,
	titleCaps,
	paginate,
	advancedFields,
	getAllCardTypes,
} = utilities
export default connect(
	({
		main: {legalCards, cardData},
		filters: {board, advanced},
		deck: {list, format},
	}) => {
		return {legalCards, cardData, board, advanced, list, format}
	},
	actions
)(
	({
		list,
		format,
		legalCards,
		cardData,
		board,
		advanced,
		addCard,
		changeAdvanced,
		openModal,
		newMsg,
		getCardData,
	}) => {
		const {terms, by, asc} = advanced
		const pageLimit = 10
		const maxRes = 50

		const [loadingCards, setLoadingCards] = useState(false)
		const [results, setResults] = useState([[]])
		const [page, setPage] = useState(0)

		const [allCardTypes, setAllCardTypes] = useState([])
		const [allKeywords, setAllKeywords] = useState([])

		useEffect(_ => {
			getAllCardTypes().then(res => {
				setAllCardTypes(res)
				axios
					.get(`https://api.scryfall.com/catalog/keyword-abilities`)
					.then(res => setAllKeywords(res.data.data))
			})
		}, [])

		useEffect(
			_ => {
				if (!cardData.length) {
					getCardData()
					setLoadingCards(true)
				} else {
					const filtered = filterAdvanced(cardData, advanced)
					if (!terms.length) setResults([rnd(filtered, pageLimit)])
					else setResults(paginate(filtered.slice(0, maxRes), pageLimit))
					setLoadingCards(false)
					setPage(0)
				}
			},
			[cardData, advanced]
		)

		const listTerms = ({name, numeric}) => {
			const ofName = terms.filter(n => n.name === name)
			return !ofName.length ? null : (
				<div className="block bar mini-spaced-bar indent">
					<h3>{name}</h3>
					<div className="col mini-spaced-col">
						{OPs(numeric).map((OP, i) => {
							const matches = ofName.filter(n => n.op === OP)
							return !matches.length ? null : (
								<div key={matches[0].id} className=" mini-spaced-col">
									<div className="bar even mini-spaced-bar">
										<b>{OP}</b>
										<div className="bar even mini-spaced-bar">
											{matches.map(({val, id}) => (
												<button
													key={id}
													className={" warning-button inverse-small-button"}
													onClick={_ => {
														changeAdvanced({
															terms: terms.filter(tx => tx.id !== id),
														})
													}}>
													{val}
												</button>
											))}
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)
		}
		const applyTemplate = grep => {
			let newTerms = []
			const gs = Object.entries(grep).map(g => {
				const [name, ops] = g
				return Object.entries(ops).map(o => {
					const [op, vs] = o
					return vs.map(val => {
						const {trait} = advancedFields.filter(a => a.name === name)[0] || {}
						const id = name + op + val
						newTerms.push({name, trait, op, val, id})
						return
					})
				})
			})
			changeAdvanced({terms: [...terms, ...newTerms]})
		}

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
			<div key={c.id} className="bar even spread">
				<div className="bar">
					<CardControls key={uuidv4()} card={c} context={"builder"} />
					<div className="info">
						<div className="bar even mini-spaced-bar">
							<h3>{c.name}</h3>
							<span>{formatManaSymbols(c.mana_cost)}</span>
						</div>
						<h4>{c.type_line}</h4>
						<div>{formatText(c.oracle_text)}</div>
					</div>
				</div>
				<div className="add-to col">
					{BOARDS.map(B => (
						<button
							key={B}
							className="small-button"
							onClick={_ => {
								addCard(c, B)
								newMsg(`Added ${c.name} to ${B}board`, "success")
							}}>
							{B} ({list.filter(l => l.name === c.name && l.board === B).length}
							)
						</button>
					))}
				</div>
			</div>
		)

		return (
			<div className="advanced ">
				<h1>Advanced Search</h1>
				<div className="inner">
					<AdvancedForm applyTemplate={applyTemplate} />
					<div className="advanced-search-results">
						<div className="big-block">
							<div className={"block bar even mini-spaced-bar"}>
								<h2>Filters</h2>
								<button
									className={`warning-button inverse-small-button ${
										terms.length || "hide"
									}`}
									onClick={_ => changeAdvanced({terms: []})}>
									Clear
								</button>
							</div>
							{!terms.length ? (
								<Loading
									spinner=" "
									anim="none"
									subMessage="No Terms Added Yet"
								/>
							) : (
								advancedFields.map(a => listTerms(a))
							)}
						</div>
						{terms.length ? (
							<h2 className={"block"}>Search Results</h2>
						) : (
							<div className="block bar even mini-spaced-bar">
								<h2>Some Cards</h2>
								<button
									className="small-button"
									onClick={_ =>
										setResults([
											rnd(filterAdvanced(cardData, advanced), pageLimit),
										])
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
							results[page].map(c => <ResultCard c={c} />)
						)}
						{pages}
					</div>

					<BulkEdit1 list={list} callBack={l => l} />
				</div>
			</div>
		)
	}
)
const AdvancedForm = ({applyTemplate}) => {
	return (
		<div className="advanced-search spaced-col big-block gap">
			<div className="bar">
				<div className="col">
					<h4>Templates</h4>
					<BasicSearch
						searchable
						preview
						placeholder={`ex. ${rnd(ADVANCED_GREPS).name}`}
						options={ADVANCED_GREPS}
						callBack={({grep}) => applyTemplate(grep)}
					/>
				</div>
			</div>
			<div className="block">
				{advancedFields.map((a, i) => {
					return <AdvancedField index={i} />
				})}
			</div>
		</div>
	)
}
