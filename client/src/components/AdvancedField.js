import React, {useState, useEffect, useRef} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
const {
	COLORS,
	OPs,
	formatManaSymbols,
	rnd,
	advancedFields,
	getAllCardTypes,
} = utilities
export default connect(
	({
		main: {cardData},
		filters: {
			board,
			advanced: {terms},
		},
		deck: {list, format},
	}) => {
		return {cardData, board, terms, list, format}
	},
	actions
)(
	({
		index,
		list,
		format,
		cardData,
		terms,
		changeAdvanced,
		openModal,
		newMsg,
	}) => {
		const {name, trait, options, numeric, colored} = advancedFields[index] || {}

		const [ex, setEx] = useState(numeric ? "" : `Filter Card ${name}`)
		const [op, setOp] = useState(OPs(numeric)[0])
		const [focused, setFocused] = useState(false)
		const [input, setInput] = useState(numeric ? 0 : colored ? [] : "")

		const [allOptions, setAllOptions] = useState(null)

		useEffect(
			_ => {
				if (trait === "type_line")
					getAllCardTypes().then(res => {
						setAllOptions(res)
					})
				else if (trait === "keywords")
					axios
						.get(`https://api.scryfall.com/catalog/keyword-abilities`)
						.then(res => setAllOptions(res.data.data))
			},
			[trait]
		)

		const inUse = key => {
			const iu = terms.filter(t => t.op === op && t.name === name)
			return key ? iu.map(_ => _[key]) : iu
		}

		const submit = val => {
			const id = name + op + (val || input)
			val = val || input
			changeAdvanced({
				terms: [...terms, {id, name, trait, val, op}],
			})
			setInput(numeric ? 0 : "")
		}

		useEffect(
			_ => {
				const keyEvent = e => e.code === "Enter" && focused && submit()

				window.removeEventListener("keydown", keyEvent)
				window.addEventListener("keydown", keyEvent)
				return _ => window.removeEventListener("keydown", keyEvent)
			},
			[focused, input]
		)

		const inputForm = (
			<div className="bar even">
				<input
					onFocus={_ => setFocused(true)}
					onBlur={_ => setFocused(false)}
					type={numeric ? "number" : "text"}
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder={ex}
				/>
				<button
					className={`icon-plus success-button ${
						(!input.length ||
							terms.filter(t => t.id === name + op + input).length) &&
						"disabled"
					}`}
					onClick={_ => submit()}
				/>
			</div>
		)

		const colorForm = (
			<div className="bar even mini-spaced-bar">
				{COLORS("symbol").map((co, i) => (
					<span
						key={"color_filter_" + co}
						className={`clicky-icon mana-button ${
							inUse("val").includes(co) && "selected"
						}`}
						onClick={_ =>
							inUse("val").includes(co)
								? changeAdvanced({
										terms: terms.filter(
											t => !(t.op === op && t.name === name && t.val === co)
										),
								  })
								: submit(co)
						}>
						{formatManaSymbols(`{${co}}`)}
					</span>
				))}
			</div>
		)

		return (
			<div className="advanced-field mini-block col mini-spaced-col">
				<div className="bar even mini-spaced-bar">
					<h3>{name}</h3>
					<BasicSearch
						className={"small"}
						options={OPs(numeric)}
						self={op}
						callBack={o => setOp(o)}
					/>
				</div>
				{colored ? (
					colorForm
				) : allOptions || (options && options.length) ? (
					<BasicSearch
						searchable
						preview
						placeholder={`ex. ${rnd(allOptions || options)}`}
						options={allOptions || options}
						callBack={submit}
					/>
				) : (
					inputForm
				)}
			</div>
		)
	}
)
