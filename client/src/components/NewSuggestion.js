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
	({deck: {format, desc, list}, main: {cardData, sets}}) => {
		return {format, desc, list, cardData, sets}
	},
	actions
)(
	({
		showDiffs,
		list,
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
			added: null,
			removed: null,
			reason: "",
		}

		const [changes, setChanges] = useState([changeInit])

		const updateChanges = (key, id, val) =>
			setChanges(changes.map(c => (c.id !== id ? c : {...c, [key]: val})))
		const addChange = _ => setChanges([...changes, changeInit])
		const removeChange = id => setChanges(changes.filter(c => c.id !== id))

		const allLinesGood = !changes.filter(
			c => !c.added || !c.removed || c.reason.length < 8 || c.reason.length > 48
		).length
		const removable = list.filter(
			l => !changes.filter(c => c.removed && c.removed.key === l.key).length
		)
		return (
			<div className="changes big-block col spaced-col">
				{changes.map(({id, added, removed, reason}) => {
					const goodLine =
						added && removed && reason.length >= 8 && reason.length <= 49
					return (
						<div
							key={id}
							className={`section change flex-row spaced-bar ${
								goodLine && "icon-ok"
							}`}>
							<div className="add mini-block col even">
								<div className="bar start">
									<div className="icon-plus" />
									<BasicSearch
										self={added || "Card to Add"}
										searchable
										limit={10}
										options={cardData}
										renderAs={c => (
											<ToolTip card={c}>
												<span className="thin-pad">{c.name}</span>
											</ToolTip>
										)}
										callBack={c => updateChanges("added", id, c)}
									/>
								</div>
								{!added ? null : <CardControls card={added} />}
							</div>
							<div className="remove mini-block col even">
								<div className="flex-row even">
									<div className="icon-minus" />
									<BasicSearch
										self={removed || "Card to Remove"}
										options={removable}
										searchable
										preview
										sortBy={"name"}
										renderAs={c => (
											<ToolTip card={c}>
												<span className="thin-pad">{c.name}</span>
											</ToolTip>
										)}
										callBack={c => updateChanges("removed", id, c)}
									/>
								</div>
								{!removed ? null : <CardControls card={removed} />}
							</div>
							<div className="reason bar even">
								<div className="">Why?</div>
								<input
									type="text"
									value={reason}
									onChange={e => updateChanges("reason", id, e.target.value)}
								/>
							</div>
							<button
								className="warning-button icon-trash"
								onClick={_ => removeChange(id)}
							/>
						</div>
					)
				})}
				<div className="newChange">
					{!allLinesGood ? null : (
						<div className="block bar even mini-spaced-bar">
							<button onClick={addChange}>
								Add {changes.length ? "Another" : "Suggestion"}
							</button>
							{changes.length ? (
								<button
									onClick={_ => {
										openModal(null)
										submitSuggestion(changes)
									}}>
									Submit {pluralize("Suggestion", changes.length)}
								</button>
							) : null}
						</div>
					)}
				</div>
			</div>
		)
	}
)
