import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DeckTile from "./DeckTile"
import NewDeck from "./NewDeck"

const {HOME_DIR, getDecks} = utilities

export default connect(
	({
		main: {decks, cardData, refresh},
		auth: {
			user: {_id, followed},
		},
	}) => {
		return {decks, cardData, refresh, _id, followed}
	},
	actions
)(
	({
		context,
		direct,
		decks,
		flags,
		params,
		you,
		hasHeader,
		cardData,
		children,
		refresh,
		_id,
		followed,
		newDeck,
		openModal,
		refreshData,
		loadDecks,
	}) => {
		const viewDecks = (direct || decks || []).filter(d => {
			flags = flags || []
			let included = true
			const inc = inc => included && flags.includes(inc)
			if (inc("followed")) included = followed.includes(d._id)
			if (inc("published")) included = d.published
			if (inc("helpWanted")) included = d.helpWanted >= 3
			if (inc("others")) included = d.author !== _id
			if (you) included = d.author === _id
			return included && (d.privacy === "Public" || you)
		})

		return (
			<div className="browse">
				{children}
				<div className="decks big-block center full-width fill wrap">
					{viewDecks.map(d => (
						<DeckTile key={"TILE__" + d._id} deck={d} context={context} />
					))}
				</div>
			</div>
		)
	}
)
