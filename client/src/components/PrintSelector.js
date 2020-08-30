import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import Card from "./Card"

export default connect(({main: {sets, legalCards}, deck: {list}}) => {
	return {sets, legalCards, list}
}, actions)(({change, card, list, sets, legalCards, changeCard, addCard, openModal}) => {
	const [prints, setPrints] = useState([])
	const [artOnly, setArtOnly] = useState(false)
	useEffect(() => {
		fetch(
			`https://api.scryfall.com/cards/search?unique=${artOnly ? "art" : "prints"}&order=released&q=${encodeURIComponent(
				card.name
			)}`
		)
			.then(res => res.json())
			.then(res => {
				console.log("res", res)
				setPrints(res.data)
			})
			.catch(err => console.log(err))
	}, [artOnly])

	const options = !prints.length
		? null
		: prints.map((print, i) => (
				<div
					key={"Printing__" + print.set + i}
					className="print-select-card"
					onClick={_ => {
						if (change) changeCard(card, print)
						else addCard(print)
						openModal(null)
					}}>
					<h4>{print.set_name}</h4>
					<Card card={print} />
				</div>
		  ))
	return (
		<div className="choose-print">
			<div className="bar">
				<button className={`small-button ${artOnly && "selected"}`} onClick={() => setArtOnly(!artOnly)}>
					Unique Art Only
				</button>
			</div>
			<div className="options">{options}</div>
		</div>
	)
})
