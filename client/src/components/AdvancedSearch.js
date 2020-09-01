import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import Loading from "./Loading"
import CounterInput from "./CounterInput"

const {BOARDS, COLORS, formatManaSymbols, filterColors, audit, Q, rnd, sum, titleCaps, paginate} = utilities
export default connect(({main: {legalCards}, filters, deck: {list}}) => {
	return {legalCards, ...filters, list}
}, actions)(({list, legalCards, board, advanced, addCard, changeAdvanced, openModal, newMsg}) => {
	const {colors, all, only, terms, searchBy, cmc, cmcOp} = advanced

	const [results, setResults] = useState([[]])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(0)

	const pageLimit = 20
	const maxRes = 200
	// console.log(
	// 	"advanced results",
	// 	results.map(r => r.map(c => c.artist)),
	// 	// legalCards
	// )
	const searchTerms = [
		{label: "Name", key: "name"},
		{label: "Types", key: "type_line"},
		{label: "Text", key: "oracle_text"},
	]
	useEffect(
		_ => {
			let filtered = filterColors(legalCards, colors, all, only)
			filtered =
				cmcOp === "="
					? filtered.filter(c => c.cmc === cmc)
					: cmcOp === ">"
					? filtered.filter(c => c.cmc > cmc)
					: cmcOp === "<"
					? filtered.filter(c => c.cmc < cmc)
					: cmcOp === ">="
					? filtered.filter(c => c.cmc >= cmc)
					: cmcOp === "<="
					? filtered.filter(c => c.cmc <= cmc)
					: filtered

			for (var i = 0; i < searchTerms.length; i++) {
				const termsI = terms.filter(t => t.searchBy === searchTerms[i].key).map(t => t.text)
				if (termsI.length) filtered = Q(filtered, searchTerms[i].key, termsI, true)
			}
			setResults(paginate(filtered.orderBy("name").slice(0, maxRes), pageLimit))
			setPage(0)
		},
		[legalCards, advanced]
	)

	const pages =
		results.length === 1 ? null : (
			<div className="pages bar">
				<h4>
					{results.length > 1
						? `Results ${page * pageLimit + 1}-${page * pageLimit + results[page].length} of ${sum(
								results.map(r => r.length)
						  )}${sum(results.map(r => r.length)) === maxRes ? "+" : ""}`
						: results.length
						? `${results[0].length} Results`
						: ""}
				</h4>
				<div className="bar">
					<button
						key={"paginate_last"}
						className={`smaller-button ${page <= 0 && "disabled"}`}
						onClick={_ => setPage(page - 1)}>
						Last
					</button>
					<button
						key={"paginate_next"}
						className={`smaller-button ${page >= results.length - 1 && "disabled"}`}
						onClick={_ => setPage(page + 1)}>
						Next
					</button>
				</div>
			</div>
		)

	return (
		<div className="advanced-search spaced-col big-block gap">
			<div className="terms big-block col">
				<h4>Search Terms</h4>
				<div className="mini-block bar even">
					{searchTerms.map(s => (
						<button
							key={s.label}
							className={`smaller-button ${searchBy === s.key && "selected"}`}
							onClick={_ => changeAdvanced({searchBy: s.key})}>
							{s.label}
						</button>
					))}
				</div>
				<div className="bar even">
					<input
						type="terms"
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder={`Filter Card ${searchTerms.filter(s => s.key === searchBy)[0].label}`}
					/>
					<button
						className={`success-button ${!search.length && "disabled"}`}
						onClick={_ => {
							changeAdvanced({
								terms: [
									...terms,
									...search
										.trim()
										.split(" ")
										.map((text, i) => {
											return {key: text + i + searchBy, text, searchBy}
										}),
								],
							})
							setSearch("")
						}}>
						Add Term
					</button>
					<button
						className={`warning-button ${!terms.length && "disabled"}`}
						onClick={_ => changeAdvanced({terms: []})}>
						Clear All
					</button>
				</div>
				<div className="block mini-spaced-col">
					{searchTerms.map(s =>
						!terms.filter(t => t.searchBy === s.key).length ? null : (
							<div key={s.label} className={`${s.label}`}>
								<h4>{s.label} Includes:</h4>
								<div className="bar mini-spaced-bar">
									{terms
										.filter(t => t.searchBy === s.key)
										.map((t, i) => (
											<span
												key={t.key}
												className="smaller-button warning-button"
												onClick={_ => changeAdvanced({terms: terms.filter(term => term.key !== t.key)})}>
												{titleCaps(t.text)}
											</span>
										))}
								</div>
							</div>
						)
					)}
				</div>
			</div>
			<div className="bar block spaced-bar">
				<div className="cmc">
					<h4>CMC</h4>
					<div className="bar">
						<BasicSearch
							options={["any", "=", "<", ">", "<=", ">="]}
							self={cmcOp}
							labelBy={l => l}
							callBack={e => changeAdvanced({cmcOp: e})}
							className={"cmc-op"}
						/>
						{cmcOp === "any" ? null : (
							<CounterInput
								value={cmc}
								callBack={val => {
									if (val >= 0) changeAdvanced({cmc: val})
								}}
							/>
						)}
					</div>
				</div>
				<div className="filter-colors">
					<h4>Filter Colors</h4>
					<div className="bar even mini-spaced-bar">
						<div className="bar even">
							<button className={`small-button ${all && "selected"}`} onClick={_ => changeAdvanced({all: !all})}>
								Each
							</button>
							<button className={`small-button ${only && "selected"}`} onClick={_ => changeAdvanced({only: !only})}>
								Only
							</button>
						</div>
						<div className="bar-even">
							{COLORS("symbol").map((co, i) => (
								<span
									key={"color_filter_" + co}
									className={`${colors[i] && "selected"}`}
									onClick={_ => changeAdvanced({colors: colors.map((f, ind) => (i === ind ? !colors[i] : f))})}>
									{formatManaSymbols(`{${co}}`)}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>

			{pages}
			<div className="advanced-search-results mini-spaced-grid">
				{results[page].length ? (
					results[page].map((c, ind) => (
						<CardControls key={uuidv4()} card={c}>
							{BOARDS.map(B => (
								<button
									key={B}
									className="small-button"
									onClick={_ => {
										addCard(c, B)
										newMsg(`Added ${c.name} to ${B}board`, "success")
									}}>
									{B} ({list.filter(l => l.name === c.name && l.board === B).length})
								</button>
							))}
						</CardControls>
					))
				) : (
					<Loading anim="none" message="No Matches :(" />
				)}
			</div>
			{pages}
		</div>
	)
})
