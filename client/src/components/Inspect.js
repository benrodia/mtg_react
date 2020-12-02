import React, { useState, useEffect } from "react"
import utilities from "../utilities"
import { connect } from "react-redux"
import actions from "../actions"

const { BOARDS, ZONES, formatText, formatManaSymbols, audit } = utilities

export default connect(({ main: { page }, deck: { list } }) => {
	return { page, list }
}, actions)(
	({
		back,
		page,
		list,
		inArea,
		options,
		card,
		openModal,
		addCard,
		newMsg,
		changeCard,
	}) => {
		const [target, setTarget] = useState(card)
		const [rulings, setRulings] = useState([])
		const [cooledDown, coolDown] = useState(true)
		const [flipped, flip] = useState(false)

		const { id, card_faces, rulings_uri, ind } = target
		const {
			name,
			oracle_text,
			flavor_text,
			mana_cost,
			image_uris,
			type_line,
		} = card_faces ? card_faces[flipped ? 1 : 0] : target
		console.log("inspect", card)
		const shiftList = by => {
			if (inArea && ind) {
				const nextInd =
					by + ind >= inArea.length
						? 0
						: by + ind < 0
						? inArea.length - 1
						: by + ind
				setTarget(inArea[nextInd])
			}
		}

		useEffect(
			_ => {
				fetch(rulings_uri)
					.then(response => {
						if (!response.ok) throw new Error("HTTP status " + response.status)
						return response.json()
					})
					.then(data => setRulings(data.data))
			},
			[rulings_uri]
		)

		useEffect(_ => {
			const keyEvent = e => {
				if (cooledDown) {
					coolDown(false)
					setTimeout(_ => coolDown(true), 100)
					switch (e.key) {
						case "ArrowLeft":
							return shiftList(-1)
						case "ArrowRight":
							return shiftList(1)
					}
				}
			}
			window.addEventListener("keydown", keyEvent)
			return _ => window.removeEventListener("keydown", keyEvent)
		}, [])

		const inner =
			options === "Add" ? (
				<div className="options">
					{BOARDS.map(B => (
						<button
							key={B}
							className="small-button"
							onClick={_ => {
								addCard(card, B)
								newMsg(`Added ${card.name} to ${B}board`, "success")
							}}>
							{B} (
							{list.filter(l => l.name === card.name && l.board === B).length})
						</button>
					))}
				</div>
			) : options === "Move" ? (
				page === "Build" ? (
					<div className="options">
						In {card.board}board, Move to:
						{BOARDS.filter(B => B !== card.board).map(B => {
							const cards = list.filter(
								l => l.name === card.name && l.board === B
							)
							return (
								<button
									key={B}
									className="small-button"
									onClick={_ => changeCard(card, { board: B })}>
									{B} ({cards.length})
								</button>
							)
						})}
					</div>
				) : page === "Test" ? (
					<div className="options">
						In {card.zone}, Move to:
						{ZONES.filter(Z => Z !== card.zone).map(Z => (
							<button
								key={Z}
								className="small-button"
								onClick={_ => changeCard(card, { zone: Z })}>
								{Z} (
								{list.filter(l => l.name === card.name && l.zone === Z).length})
							</button>
						))}
					</div>
				) : null
			) : null

		const header = (
			<div className="header">
				<div className="inspect-nav">
					<button
						className="warning-button icon-cancel"
						onClick={_ => openModal(back || null)}
					/>
					<button
						style={{ display: !list && "none" }}
						onClick={_ => shiftList(-1)}>
						{"<"}
					</button>
					<button
						style={{ display: !list && "none" }}
						onClick={_ => shiftList(1)}>
						{">"}
					</button>
				</div>
			</div>
		)
		// {!options ? null : inner}
		// {header}

		return (
			<div key={"inspectTarget" + name} className="inspect-container">
				<div className="info">
					<div className="text">
						<div className="oracle-text">
							<h1>{formatText(name)}</h1>
							{formatManaSymbols(mana_cost)}
							<h3>{type_line}</h3>
							<div className="mini-block thin-indent">
								{formatText(oracle_text)}
								<div className="asterisk">{formatText(flavor_text)}</div>
							</div>
						</div>
						{!rulings.length ? null : (
							<div className="block">
								<h4>Rulings</h4>
								<div className="rulings">
									{rulings.map(r => (
										<div key={r.comment} className="ruling">
											<h4>{r.published_at}</h4>
											{formatText(r.comment)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
					<img src={image_uris && image_uris["png" || "large"]} alt={name} />
					{!card_faces ? null : (
						<button className="small-button" onClick={_ => flip(!flipped)}>
							Flip
						</button>
					)}
				</div>
			</div>
		)
	}
)
