import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import utilities from "../utilities"
import {connect} from "react-redux"
import actions from "../actions"

import ToolTip from "./ToolTip"
import Loading from "./Loading"
const {
	HOME_DIR,
	getTags,
	getCardFace,
	titleCaps,
	convertTag,
	cls,
	renderVal,
	advancedFields,
} = utilities

export default connect(({filters: {advanced: {termSets}}}) => {
	return {termSets}
}, actions)(({of, tags, col, termSets, children, changeAdvanced}) => {
	const allTags =
		tags || (of && of.object === "card" ? getTags(getCardFace(of)) : [])

	return (
		<div className={`mini-spaced-grid ${col || "bar"}`}>
			{allTags.map(t => (
				<Tag
					t={t}
					of={of}
					tags={tags}
					termSets={termSets}
					children={children}
					changeAdvanced={changeAdvanced}>
					{children}
				</Tag>
			))}
		</div>
	)
})

const Tag = ({t, deletable, termSets, children, changeAdvanced}) => {
	const [tip, setTip] = useState(null)
	const converted = convertTag(t)

	console.log("converted", converted)
	useEffect(_ => {
		if (converted.failed) setTip("")
		else
			setTip(
				<div>
					<p>
						Tag: <b>{t.name}</b>
					</p>
					<p>
						Type: <b>{titleCaps(t.type)}</b>
					</p>
					<p>
						Desc: <b>{t.desc || "---"}</b>
					</p>
					{converted.unique("name").map(d => (
						<p className="mini-spaced-bar">
							{d.name}:{" "}
							{converted
								.filter(c => d.trait === c.trait)
								.map(d => {
									const {colored, numeric} =
										advancedFields.find(a => a.name === d.name) || {}
									return (
										<span>
											<span className={`icon-${cls(d.op)}`} />
											<b>{renderVal(d.val, numeric, colored)}</b>
										</span>
									)
								})}
						</p>
					))}
				</div>
			)
	}, [])

	return children ? (
		<ToolTip message={tip}>{children}</ToolTip>
	) : (
		<div className={"flex-row"}>
			<Link to={`${HOME_DIR}/card/search`}>
				<ToolTip message={tip}>
					<div
						key={t.name}
						className={`tag ${
							termSets.find(({name}) => name === t.name) && "selected"
						}`}
						onClick={_ =>
							termSets.find(({name}) => name === t.name) ||
							changeAdvanced({
								termSets: [...termSets, {name: t.name, data: converted}],
							})
						}>
						{t.type === "effect" || t.type === "trigger" ? (
							<b>{t.type}: </b>
						) : null}
						{t.name}
					</div>
				</ToolTip>
			</Link>
		</div>
	)
}
