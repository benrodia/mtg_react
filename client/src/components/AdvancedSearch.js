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

const {
	BOARDS,
	COLORS,
	CARD_TYPES,
	SUB_TYPES,
	formatManaSymbols,
	filterColors,
	audit,
	Q,
	rnd,
	sum,
	titleCaps,
	paginate,
} = utilities
export default connect(({main: {legalCards, cardData}, filters: {board, advanced}, deck: {list, format}}) => {
	return {legalCards, cardData, board, advanced, list, format}
}, actions)(({list, format, legalCards, cardData, board, advanced, addCard, changeAdvanced, openModal, newMsg}) => {
	const {legalOnly, colors, all, only, text, types, searchBy, cmc, cmcOp, rarity} = advanced

	const [nameEntry, setNameEntry] = useState("")
	const [textEntry, setTextEntry] = useState("")
	const [results, setResults] = useState([[]])
	const [page, setPage] = useState(0)

	const pageLimit = 20
	const maxRes = 200

	useEffect(
		_ => {
			let filtered = filterColors(legalOnly ? legalCards : cardData, colors, all, only)
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

			if (rarity !== "any") filtered = filtered.filter(f => f.rarity === rarity)
			if (text.length) filtered = Q(filtered, "oracle_text", text, true)
			if (types.length) filtered = Q(filtered, "type_line", types, true)
			if (nameEntry.length) filtered = matchSorter(filtered, nameEntry, {keys: ["name"]})
			setResults(paginate(filtered.orderBy("name").slice(0, maxRes), pageLimit))
			setPage(0)
		},
		[legalCards, advanced, nameEntry]
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

	const listTerms = term => {
		const [title, arr] = Object.entries(term)[0]
		return arr.length ? (
			<div className="block mini-spaced-col">
				<div className="bar even">
					<button className="smaller-button warning-button icon-cancel" onClick={_ => changeAdvanced({text: []})} />
					<h4>{titleCaps(title)} Includes:</h4>
				</div>
				<div className="bar mini-spaced-bar">
					{arr.map((t, i) => (
						<span
							key={t.key}
							className="smaller-button warning-button"
							onClick={_ => changeAdvanced({[title]: arr.filter(tx => tx !== t)})}>
							{titleCaps(t)}
						</span>
					))}
				</div>
			</div>
		) : null
	}

	const allTypes = [...CARD_TYPES, ...SUB_TYPES].filter(T => !types.includes(T))

	return (
		<div className="advanced-search spaced-col big-block gap">
			<button
				className={`mini-block ${legalOnly && "selected"}`}
				onClick={_ => changeAdvanced({legalOnly: !legalOnly})}>
				Only Cards Legal in {titleCaps(format)}
			</button>
			<div className="big-block bar spaced-bar">
				<div>
					<h4>Search Name</h4>
					<input
						type="text"
						value={nameEntry}
						onChange={e => setNameEntry(e.target.value)}
						placeholder={`Enter Card Name`}
					/>
				</div>
				<div className="terms col">
					<h4>Search Text</h4>
					<div className="bar even">
						<input
							type="text"
							value={textEntry}
							onChange={e => setTextEntry(e.target.value)}
							placeholder={`Filter Card Text`}
						/>
						<button
							className={`success-button ${!textEntry.length && "disabled"}`}
							onClick={_ => {
								changeAdvanced({text: [...text, ...textEntry.trim().split(" ")]})
								setTextEntry("")
							}}>
							Add Terms
						</button>
					</div>
				</div>
				<div className="col">
					<h4>Types</h4>
					<BasicSearch
						searchable
						preview
						string
						placeholder={`ex. ${rnd(allTypes)}`}
						options={allTypes}
						callBack={t => changeAdvanced({types: [...types, t]})}
					/>
				</div>
			</div>

			{listTerms({text})}
			{listTerms({types})}
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
					<h4>Colors</h4>
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
				<div className="filter-rarity">
					<h4>Rarity</h4>
					<BasicSearch
						self={rarity}
						labelBy={r => titleCaps(r)}
						options={["any", "common", "uncommon", "rare", "mythic"]}
						callBack={r => changeAdvanced({rarity: r})}
					/>
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
