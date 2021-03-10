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
import ToolTip from "./ToolTip"
import Tags from "./Tags"

const {
	Q,
	COLORS,
	ADVANCED_GREPS,
	OPs,
	formatManaSymbols,
	itemizeDeckList,
	rnd,
	advancedFields,
	convertTag,
	pluralize,
	titleCaps,
	generateRandomDeck,
	legalCommanders,
	cls,
	renderVal,
} = utilities
export default connect(({main: {cardData, fieldData}, filters: {advanced}}) => {
	return {cardData, fieldData, ...advanced}
}, actions)(
	({
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
		const [showFilters, setShowFilters] = useState(false)
		const [ex, setEx] = useState(`ex. ${rnd(ADVANCED_GREPS).name}`)
		const [seedCommander, setSeedCommander] = useState(null)

		useEffect(_ => {
			fieldData.gotten || getFieldData()
		}, [])

		const termSet = termSets[termTab]

		const Terms = ({name, colored, numeric, legality}) => {
			const ofName = termSet.data.filter(n => n.name === name).orderBy("op")
			return !ofName.length ? null : (
				<div className="block mini-spaced-col">
					<h3>{name}</h3>
					<div className="indent bar even">
						{ofName.map(({op, val, id}, i) => (
							<button
								className="mini-spaced-bar even warning-button"
								onClick={_ => {
									const newTermSets = [
										...termSets
											.map((t, ind) => {
												const data = t.data.filter(tx => tx.id !== id)
												return data.length || ind === 0
													? {
															...t,
															data,
													  }
													: null
											})
											.filter(t => !!t),
									]
									if (newTermSets.length !== termSets.length)
										changeAdvanced({
											termTab: Math.max(
												Math.min(termTab, termSets.length - 2),
												0
											),
										})
									changeAdvanced({termSets: newTermSets})
								}}>
								<span className={`dark-text icon-${cls(op)}`}>
									{numeric ? op : null}
								</span>
								<span key={id}>{renderVal(val, numeric, colored)}</span>
							</button>
						))}
					</div>
				</div>
			)
		}
		const TagSearch = _ => {
			return (
				<div className="mini-spaced-col">
					<span className="bar start">
						<h2>Tags</h2>
						<ToolTip message="Tags are collections of preset search terms. Use them to help find cards with a certain effect or feel. GET INSPIRED!">
							<span className="icon-help-circled asterisk" />
						</ToolTip>
					</span>
					<div className="bar mini-spaced-bar">
						<div className="quick-search">
							<BasicSearch
								searchable
								preview
								sort={"name"}
								placeholder={ex}
								options={ADVANCED_GREPS}
								separate={"type"}
								renderAs={t => (
									<Tags tags={[t]}>
										<div className="thinner-pad">
											<b>{titleCaps(t.type)}: </b>
											<span>{t.name}</span>
										</div>
									</Tags>
								)}
								callBack={t =>
									termSets.filter(ts => ts.name === t.name)[0] ||
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
					</div>
				</div>
			)
		}

		const Filters = _ => (
			<div className="col fill spread start ">
				<div className="bar even tab-switch">
					{termSets.map((t, i) => (
						<div
							key={t.name}
							onClick={_ => changeAdvanced({termTab: i})}
							className={`flex-row mini-spaced-bar even tab ${
								i === termTab && "selected"
							}`}>
							<div
								className={i === 0 && !termSets[0].data.length && "disabled"}
								title={t.desc}>
								{t.name} ({t.data.length})
							</div>
							<button
								className={`warning-button inverse-button icon-cancel ${
									i === 0 && !termSets[0].data.length && "disabled"
								}`}
								onClick={e => {
									e.stopPropagation()
									changeAdvanced({
										termTab: Math.max(
											Math.min(termTab, termSets.length - 2),
											0
										),
										termSets: termSets
											.map((term, ind) =>
												ind === i
													? ind === 0
														? {name: "Custom Filters", data: []}
														: null
													: term
											)
											.filter(_ => !!_),
									})
								}}
							/>
						</div>
					))}
				</div>

				<div className="filters flex-row mini-spaced-bar full-width thin-pad">
					{!termSet.data.length ? (
						<Loading spinner=" " anim="none" subMessage="Add Some Filters" />
					) : (
						<div className="advanced-terms">
							{advancedFields.map(a => (
								<Terms key={a.name} {...a} />
							))}
						</div>
					)}
				</div>
			</div>
		)
		return (
			<div className="advanced-search spaced-col">
				<h1 className="block">Card Search</h1>
				<div className=" max ">
					<h2>Filters</h2>
					<div className={showFilters || "more-less"}>
						<div className="col-2 thinner-pad mini-spaced-col">
							{advancedFields.map((a, i) =>
								!showFilters && (i > 5 || i == 1 || i == 2) ? null : (
									<AdvancedField key={"field__" + a.name} {...a} />
								)
							)}
						</div>
						<button
							className="full-width more-less-button"
							onClick={_ => setShowFilters(!showFilters)}>
							{showFilters ? "Hide" : "Show All"} Filters
						</button>
					</div>
				</div>
				<TagSearch />
				<Filters />
			</div>
		)
	}
)
