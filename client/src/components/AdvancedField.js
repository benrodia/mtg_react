import React, {useState, useEffect, useRef} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"
import ToolTip from "./ToolTip"

const {
	titleCaps,
	COLORS,
	OPs,
	formatManaSymbols,
	rnd,
	advancedFields,
	getAllCardTypes,
} = utilities
export default connect(
	({
		main: {fieldData, sets},
		filters: {
			board,
			advanced: {termSets, termTab},
		},
		deck: {list, format},
	}) => {
		return {sets, fieldData, board, termSets, termTab, list, format}
	},
	actions
)(
	({
		name,
		trait,
		subTrait,
		options,
		numeric,
		colored,
		legality,
		bool,
		desc,
		ex,
		list,
		format,
		sets,
		fieldData,
		termSets,
		termTab,
		changeAdvanced,
		getFieldData,
	}) => {
		const [op, setOp] = useState(OPs(numeric, legality)[0])
		// const [focused, setFocused] = useState(false)
		// const [input, setInput] = useState("")

		const [allOptions, setAllOptions] = useState(null)
		const [placeholder, setPlaceholder] = useState(
			ex || `ex. "${rnd(allOptions || options)}"`
		)
		const [getting, setGetting] = useState(false)

		const termData = termSets[termTab].data
		// console.log("FIELDS", fieldData)

		useEffect(
			_ => {
				fieldData[trait] &&
					name !== "# of Keywords" &&
					setAllOptions(fieldData[trait])
				setPlaceholder(ex || `ex. "${rnd(allOptions || options)}"`)
			},
			[fieldData]
		)

		const inUse = key => {
			const iu = termData.filter(t => t.op === op && t.name === name)
			return key ? iu.map(_ => _[key]) : iu
		}

		const submit = val => {
			if (val && ((val.length && val.trim().length) || Number(val))) {
				const id = name + op + val
				if (!termSets[0].data.find(d => d.id === id)) {
					let newTermSets = [...termSets]
					newTermSets[0].data.push({
						id,
						name,
						trait,
						subTrait,
						val:
							trait === "mana_cost"
								? val
										.split("")
										.map(m => `{${m}}`)
										.join("")
								: val,
						op,
					})
					changeAdvanced({
						termSets: newTermSets,
						termTab: 0,
					})
				}
			}
		}

		// useEffect(
		// 	_ => {
		// 		const keyEvent = e => e.code === "Enter" && focused && submit()

		// 		window.removeEventListener("keydown", keyEvent)
		// 		window.addEventListener("keydown", keyEvent)
		// 		return _ => window.removeEventListener("keydown", keyEvent)
		// 	},
		// 	[focused, input]
		// )

		// const inputForm = (
		// 	<div className="flex-row even">
		// 		<input
		// 			onFocus={_ => setFocused(true)}
		// 			onBlur={_ => setFocused(false)}
		// 			type={numeric ? "number" : "text"}
		// 			value={input}
		// 			onChange={e => setInput(e.target.value)}
		// 			placeholder={name}
		// 		/>
		// 		<button
		// 			className={`icon-plus success-button ${
		// 				(!input.length ||
		// 					termData.filter(t => t.id === name + op + input).length) &&
		// 				"disabled"
		// 			}`}
		// 			onClick={_ => submit()}
		// 		/>
		// 	</div>
		// )

		const boolForm = !(options && bool) ? null : (
			<div className="flex-row even">
				{options.map(o => {
					const active = !!termData.filter(
						r => r.name === name && r.val === o.name
					)[0]
					return (
						<button
							key={`bool-o-${o.name}`}
							className={`small-button ${active && "selected"}`}
							onClick={_ =>
								active
									? changeAdvanced({
											refine: termData.filter(
												r => !(r.name === name && r.val === o.name)
											),
									  })
									: submit(o.name)
							}>
							{titleCaps(o.name)}
						</button>
					)
				})}
			</div>
		)

		return (
			<div className="advanced-field flex-row even fill spread">
				<span className="bar start">
					<h3>{name}</h3>
					{desc ? (
						<ToolTip message={desc}>
							<span className="icon-help-circled asterisk" />
						</ToolTip>
					) : null}
				</span>
				<div className="flex-row even mini-spaced-bar end-just">
					<BasicSearch
						className={"small"}
						options={bool ? [] : OPs(numeric, legality)}
						self={op}
						callBack={o => setOp(o)}
					/>
					{colored ? (
						<div className="flex-row even">
							{COLORS("symbol").map((co, i) => (
								<span
									key={"color_filter_" + co}
									className={`mana-button ${
										inUse("val").includes(co) && "selected"
									}`}
									onClick={_ => {
										if (inUse("val").includes(co)) {
											const newTermSets = termSets.map((t, i) => {
												if (i === 0) {
													const data = t.data.filter(
														t =>
															!(t.op === op && t.name === name && t.val === co)
													)
													return {...t, data}
												} else return t
											})

											changeAdvanced({termSets: newTermSets, termTab: 0})
										} else submit(co)
									}}>
									{formatManaSymbols(`{${co}}`)}
								</span>
							))}
						</div>
					) : (
						<BasicSearch
							searchable
							preview
							addable
							sort
							placeholder={placeholder}
							options={allOptions || options || []}
							labelBy={o => titleCaps(o)}
							callBack={submit}
						/>
					)}
				</div>
			</div>
		)
	}
)
