import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import matchSorter, {rankings} from "match-sorter"
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

	const searchTerms = [
		{label: "Name", key: "name"},
		{label: "Types", key: "type_line"},
		{label: "Text", key: "oracle_text"},
	]
	const filterCMC =
		cmcOp === "="
			? legalCards.filter(c => c.cmc === cmc)
			: cmcOp === ">"
			? legalCards.filter(c => c.cmc > cmc)
			: cmcOp === "<"
			? legalCards.filter(c => c.cmc < cmc)
			: cmcOp === ">="
			? legalCards.filter(c => c.cmc >= cmc)
			: cmcOp === "<="
			? legalCards.filter(c => c.cmc <= cmc)
			: legalCards

	useEffect(
		_ => {
			let filtered = filterColors(
				filterCMC.map(c => audit(c)),
				colors,
				all,
				only
			)
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
		<div className="advanced-search">
			<h2>Advanced Search</h2>
			<section className="terms">
				{searchTerms.map(s => (
					<button
						key={s.label}
						className={`small-button ${searchBy === s.key && "selected"}`}
						onClick={_ => changeAdvanced({searchBy: s.key})}>
						{s.label}
					</button>
				))}
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
					Add
				</button>
				<button className={`warning-button ${!terms.length && "disabled"}`} onClick={_ => changeAdvanced({terms: []})}>
					Clear
				</button>
				{searchTerms.map(s =>
					!terms.filter(t => t.searchBy === s.key).length ? null : (
						<div key={s.label} className={s.label}>
							{s.label}:
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
					)
				)}
			</section>
			<section className="bar">
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
					<button className={`small-button ${all && "selected"}`} onClick={_ => changeAdvanced({all: !all})}>
						Each
					</button>
					<button className={`small-button ${only && "selected"}`} onClick={_ => changeAdvanced({only: !only})}>
						Only
					</button>
					{COLORS("symbol").map((co, i) => (
						<span
							key={"color_filter_" + co}
							className={`${colors[i] && "selected"}`}
							onClick={_ => changeAdvanced({colors: colors.map((f, ind) => (i === ind ? !colors[i] : f))})}>
							{formatManaSymbols(`{${co}}`)}
						</span>
					))}
				</div>
			</section>
			{pages}
			<section className="advanced-search-results">
				{results[page].length ? (
					results[page].map((c = {}, ind) => {
						c = {...c, ind}
						const options = BOARDS.map(B => (
							<button
								key={B}
								className="small-button"
								onClick={_ => {
									addCard(c, B)
									newMsg(`Added ${c.name} to ${B}board`, "success")
								}}>
								{B} ({list.filter(l => l.name === c.name && l.board === B).length})
							</button>
						))
						return (
							<CardControls options="Add" inArea={results[page]} key={(c.id || uuidv4()) + ind} card={audit(c)}>
								{options}
							</CardControls>
						)
					})
				) : (
					<Loading anim="none" message="No Matches :(" />
				)}
			</section>
			{pages}
		</div>
	)
})
