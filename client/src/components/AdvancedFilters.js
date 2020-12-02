import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import AdvancedField from "./AdvancedField"
import BasicSearch from "./BasicSearch"
import Loading from "./Loading"

const {
	COLORS,
	ADVANCED_GREPS,
	OPs,
	formatManaSymbols,
	rnd,
	advancedFields,
} = utilities
export default connect(({filters: {advanced: {terms, by, asc, nameEntry}}}) => {
	return {terms, by, asc, nameEntry}
}, actions)(({terms, by, asc, nameEntry, changeAdvanced}) => {
	const [ex, setEx] = useState(`ex. ${rnd(ADVANCED_GREPS).name}`)
	const [delay, setDelay] = useState(null)
	const [search, setSearch] = useState(nameEntry || "")

	useEffect(
		_ => {
			if (delay === false) {
				console.log("search delay", search)
				changeAdvanced({nameEntry: search})
			}
		},
		[search, delay]
	)

	const listTerms = ({name, numeric}) => {
		const ofName = terms.filter(n => n.name === name)
		return !ofName.length ? null : (
			<div key={name} className="block bar mini-spaced-bar indent">
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
												{name === "Colors"
													? COLORS().filter(C => C.symbol === val)[0].name
													: val}
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
		changeAdvanced({terms: newTerms})
	}

	const byOps = [
		{name: "Name", trait: "name"},
		{name: "Oldest", trait: "released_at"},
		{name: "EDHREC", trait: "edhrec_rank"},
	]

	const delaySearch = e => {
		setSearch(e.target.value)
		clearTimeout(delay)
		setDelay(setTimeout(_ => setDelay(false), 300))
	}

	return (
		<div className="big-block">
			<div className="bar spaced-bar">
				<div className="col">
					<h4>Templates</h4>
					<BasicSearch
						searchable
						preview
						placeholder={ex}
						options={ADVANCED_GREPS}
						callBack={({grep}) => applyTemplate(grep)}
					/>
				</div>
				<div className="col">
					<h4>Order By</h4>
					<div className="bar even">
						<BasicSearch
							self={byOps.filter(b => b.trait === by)[0].name}
							options={byOps}
							callBack={({trait}) => changeAdvanced({by: trait})}
						/>
					</div>
				</div>
			</div>
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
				<Loading spinner=" " anim="none" subMessage="Try Adding Some Filters" />
			) : (
				advancedFields.map(a => listTerms(a))
			)}
			<div className="basic-search">
				<div className="search-bar bar even">
					<input
						type="text"
						value={search}
						onChange={delaySearch}
						placeholder={"Enter Card Name"}
					/>
				</div>
			</div>
		</div>
	)
})

const AdvancedForm = _ => {
	return (
		<div className="advanced-search spaced-col big-block gap">
			{advancedFields.map((a, i) => {
				return <AdvancedField key={"field__" + i} index={i} />
			})}
		</div>
	)
}
