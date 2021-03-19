import React, {useState, useEffect} from "react"
import matchSorter from "match-sorter"
import {v4 as uuidv4} from "uuid"

import EditableText from "./EditableText"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import ToolTip from "./ToolTip"

import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

const {
	Q,
	log,
	sum,
	pluralize,
	titleCaps,
	rnd,
	chooseCommander,
	legalCommanders,
	interpretForm,
	listDiffs,
} = utilities

export default connect(
	({
		deck: {format, desc, list, allow_suggestions},
		main: {cardData, sets},
	}) => {
		return {format, desc, list, allow_suggestions, cardData, sets}
	},
	actions
)(
	({
		showDiffs,
		list,
		allow_suggestions,
		format,
		desc,
		sets,
		cardData,
		addCard,
		openModal,
		submitSuggestion,
	}) => {
		const changeInit = {
			id: uuidv4(),
			added: [],
			removed: [],
			reason: "",
		}

		const [changes, setChanges] = useState(changeInit)
		const {id, author, date, added, removed, reason} = changes

		const updateChanges = (key, val, concat) =>
			setChanges({
				...changes,
				[key]:
					concat === true
						? [...changes[key], val]
						: concat === false
						? changes[key].filter(ck => ck.name !== val.name)
						: val,
			})
		// const addChange = _ => setChanges([...changes, changeInit])
		const removeChange = _ => setChanges(changeInit)

		const goodLine = c =>
			(c.added.length || c.removed.length) &&
			(allow_suggestions > 1 ||
				(c.added.length === c.removed.length &&
					c.reason.length >= 16)) &&
			c.reason.length <= 160

		// const allLinesGood = changes.every(c => goodLine(c))

		return (
			<div className="changes big-block col spaced-col">
				<div key={id} className={`section change`}>
					<div className="block flex-row even spread">
						<h1>New Suggestion</h1>
						<div className="bar mini-spaced-bar">
							<button
								className={`icon-ok
										${
											goodLine({
												added,
												removed,
												reason,
											}) || "disabled"
										}
										`}
								onClick={_ => {
									openModal(null)
									submitSuggestion(changes)
								}}
							/>

							<button
								className="warning-button icon-trash"
								onClick={removeChange}
							/>
						</div>
					</div>
					<div key={id} className={`flex-row spaced-bar`}>
						<div className="add">
							<div className="flex-row even icon-plus">
								<BasicSearch
									placeholder={"Card to Add"}
									searchable
									limit={10}
									options={cardData}
									renderAs={c => (
										<ToolTip card={c}>
											<span className="thin-pad">
												{c.name}
											</span>
										</ToolTip>
									)}
									callBack={c =>
										updateChanges("added", c, true)
									}
								/>
							</div>
							<div className="bar">
								{added.map((add, i) => (
									<div key={add.name + i}>
										<CardControls card={add} />
										<button
											className="smaller-button icon-cancel"
											onClick={_ =>
												updateChanges(
													"added",

													add,
													false
												)
											}
										>
											Nevermind
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="remove">
							<div className="flex-row even icon-minus">
								<BasicSearch
									placeholder={"Card to Remove"}
									options={list.filter(
										l =>
											!(
												changes.removed &&
												changes.removed.key === l.key
											)
									)}
									searchable
									preview
									sortBy={"name"}
									renderAs={c => (
										<ToolTip card={c}>
											<span className="thin-pad">
												{c.name}
											</span>
										</ToolTip>
									)}
									callBack={c =>
										updateChanges("removed", c, true)
									}
								/>
							</div>
							<div className="bar">
								{removed.map((remove, i) => (
									<div key={remove.name + i}>
										<CardControls card={remove} />
										<button
											className="smaller-button icon-cancel"
											onClick={_ =>
												updateChanges(
													"removed",

													remove,
													false
												)
											}
										>
											Nevermind
										</button>
									</div>
								))}
							</div>
						</div>
						<div className="reason ">
							<h4>
								Reason{" "}
								<span className="asterisk">
									(
									{allow_suggestions > 1
										? "Optional"
										: "Required"}
									)
								</span>
							</h4>
							<textarea
								value={reason}
								placeholder="A persuasive reason for you to make this change."
								rows={10}
								onChange={e =>
									e.target.value.length <= 160 &&
									updateChanges("reason", e.target.value)
								}
							/>
							<p
								className={`asterisk icon-{reason.length >= 16 &&
						reason.length <= 160?'ok':'cancel disabled'}`}
							>
								({reason.length}/160)
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
)
// <div className="newChange">
// 	{!allLinesGood ? null : (
// 		<div className="block bar even mini-spaced-bar">
// 			<button onClick={addChange}>
// 				Add {changes.length ? "Another" : "Suggestion"}
// 			</button>
// 			{changes.length ? (
// 				<button
// 					onClick={_ => {
// 						openModal(null)
// 						submitSuggestion(changes)
// 					}}
// 				>
// 					Submit{" "}
// 					{pluralize("Suggestion", changes.length)}
// 				</button>
// 			) : null}
// 		</div>
// 	)}
// </div>
