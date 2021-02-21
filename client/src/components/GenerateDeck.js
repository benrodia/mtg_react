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
	generateRandomDeck,
	legalCommanders,
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
		const [seedCommander, setSeedCommander] = useState(null)
		const [seedTags, setSeedTags] = useState([])

		const TagSearch = _ => {
			const separations = ADVANCED_GREPS.unique("type")
				.map(({type}) => {
					return type
						? {
								n: type,
								s: ADVANCED_GREPS.filter(g => g.type === type),
						  }
						: null
				})
				.filter(s => !!s)

			return (
				<div className=" bar mini-spaced-grid ">
					{separations.map(({n, s}) => (
						<div key={n}>
							<h4>{pluralize(titleCaps(n), 2)}</h4>
							<BasicSearch
								searchable
								preview
								placeholder={`Card ${n}`}
								options={s}
								callBack={t =>
									termSets.find(ts => ts.name === t.name) ||
									changeAdvanced({
										termSets: [
											...termSets,
											{name: t.name, data: convertTag(t)},
										],
										termTab: termSets.length,
									})
								}
							/>
						</div>
					))}
				</div>
			)
		}

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
									setName(c.name)
									setSeedCommander(c)
								}}
								placeholder="Search for a Commander"
							/>
						</div>
						{seedCommander ? (
							<CardControls card={seedCommander} param="info" />
						) : null}
					</div>
					<div className={seedCommander || "disabled"}>
						<h4>2: Choose Tags to Include</h4>
						<BasicSearch
							searchable
							preview
							placeholder={`Card Tags`}
							options={ADVANCED_GREPS.filter(G => G.type !== "faction")}
							callBack={t =>
								seedTags.find(ts => ts.name === t.name) ||
								setSeedTags([...seedTags, {name: t.name, data: convertTag(t)}])
							}
						/>
						<Tags
							tags={seedTags}
							deletable
							col
							callBack={(t, rm) =>
								rm && setSeedTags(seedTags.filter(({name}) => name !== t.name))
							}
						/>
					</div>
					<div className={seedTags.length || "disabled"}>
						<h4>Generate List</h4>
						<button
							onClick={_ => {
								seedCommander &&
									generateRandomDeck({
										seedCommander,
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
