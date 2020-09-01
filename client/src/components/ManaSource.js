import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {COLORS} from "../constants/definitions"

export default connect(
	null,
	actions
)(({card, cardState, handleMana}) => {
	const addMana = (type, amt) => {
		if (!card.tapped) {
			cardState(card, "tapped", true)
			handleMana(COLORS().map((C, i) => (type === i ? amt : 0)))
		}
	}

	if (card.mana_source) {
		const manaTapDisplay = card.mana_source.map((amt, i) =>
			!amt ? null : (
				<div key={`tapfor${COLORS("symbol")[i]}`} className={`tap-for`} onClick={_ => addMana(i, amt)}>
					{[...Array(amt)].map(_ => (
						<span key={amt} className={`ms ms-${COLORS("symbol")[i].toLowerCase()}`} />
					))}
				</div>
			)
		)
		return card.mana_source.filter(co => !!co).length <= 1 ? null : (
			<div className="mana-source">
				<span className={`ms ms-tap`} />: Add {manaTapDisplay}
			</div>
		)
	} else return null
})
