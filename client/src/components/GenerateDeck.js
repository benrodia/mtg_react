import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import AdvancedField from "./AdvancedField"
import AdvancedFilters from "./AdvancedFilters"
import BasicSearch from "./BasicSearch"
import Loading from "./Loading"
import CardControls from "./CardControls"
import Tags from "./Tags"

const {
	COLORS,
	ADVANCED_GREPS,
	OPs,
	formatManaSymbols,
	rnd,
	advancedFields,
	convertTag,
	pluralize,
	titleCaps,
	legendName,
	generateRandomDeck,
	legalCommanders,
	getTags,
	chooseCommander,
} = utilities
export default connect(({main: {cardData, fieldData}, filters: {advanced}}) => {
	return {cardData, fieldData, ...advanced}
}, actions)(
	({
		setName,
		callBack,
		cardData,
		fieldData,
		termSets,
		termTab,
		by,
		asc,
		tags,
		changeAdvanced,
		getFieldData,
		addCart,
		getCardData,
	}) => {
		// const [seedCommanders, setSeedCommanders] = useState([])
		const [seedTags, setSeedTags] = useState([])
		const [seedDeck, setSeedDeck] = useState([])
		const seedCommanders = seedDeck.filter(c => c.commander)

		// useEffect(
		// 	_ => {
		// 		if (seedCommanders.length) {
		// 			setSeedTags(seedCommanders.map(c => getTags(c)).flat())
		// 		}
		// 	},
		// 	[seedCommanders]
		// )
		return (
			<div className="">
				<h2>Create Seeded EDH Deck</h2>
				<div className="bar spaced-bar">
					<div>
						<h4>1: Choose a Commander</h4>
						<div>
							<BasicSearch
								searchable
								limit={20}
								options={legalCommanders("commander", cardData)}
								renderAs={c => <CardControls card={c} cardHeadOnly />}
								callBack={c => {
									if (c.name) {
										const newd = chooseCommander(c, seedDeck)
										const commanders = newd.filter(_ => !!_.commander)
										setName(
											commanders.map(co => legendName(co.name)).join(" & ")
										)
										setSeedTags(
											commanders
												.map(c => getTags(c))
												.flat()
												.filter(t => t.type !== "faction")
										)

										setSeedDeck(newd)
									}
								}}
								placeholder="Search for a Commander"
							/>
						</div>
						{seedCommanders.map(c => (
							<CardControls card={c} param="info" />
						))}
					</div>
					<div className={seedCommanders.length || "disabled"}>
						<h4>2: Choose Tags to Include</h4>
						<BasicSearch
							searchable
							preview
							placeholder={`Card Tags`}
							options={ADVANCED_GREPS.filter(t => t.type !== "faction").orderBy(
								"type"
							)}
							labelBy={t => (t ? `${t.type}: ${t.name} ` : "")}
							callBack={t =>
								convertTag(t).failed ||
								seedTags.find(ts => ts.name === t.name) ||
								setSeedTags([...seedTags, t])
							}
						/>
						<div className="mini-spaced-col">
							{seedTags.map(t => (
								<div className="bar">
									<Tags tags={[t]} />
									<button
										className="warning-button inverse-button smaller-button icon-cancel"
										onClick={_ =>
											setSeedTags(seedTags.filter(({name}) => name !== t.name))
										}
									/>
								</div>
							))}
						</div>
					</div>
					<div className={seedTags.length || "disabled"}>
						<h4>Generate List</h4>
						<button
							onClick={_ => {
								seedCommanders.length &&
									generateRandomDeck({
										seedCommanders,
										seedTags,
										cardData,
									}).then(d => callBack(d))
							}}>
							Go!
						</button>
					</div>
				</div>
			</div>
		)
	}
)
