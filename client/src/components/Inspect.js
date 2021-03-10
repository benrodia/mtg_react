import React, {useState, useEffect} from "react"
import {Link, NavLink, useLocation} from "react-router-dom"
import utilities from "../utilities"
import {connect} from "react-redux"
import actions from "../actions"
import Tilt from "react-tilt"

import Loading from "./Loading"
import CardControls from "./CardControls"
import Icon from "./Icon"
import QuickSearch from "./QuickSearch"
import AdvancedCart from "./AdvancedCart"
import Card from "./Card"
import BasicSearch from "./BasicSearch"
import ToolTip from "./ToolTip"
import Tags from "./Tags"

const {
	HOME_DIR,
	CARD_SLEEVES,
	Q,
	BOARDS,
	ZONES,
	formatText,
	formatManaSymbols,
	audit,
	getSimilarCards,
	getCardFace,
	titleCaps,
	createSlug,
	reorderDate,
	pluralize,
} = utilities

export default connect(({// auth: {
	// 	user: {cardCombos},
	// },
	filters: {advanced: {cart}}, main: {page, cardData, cardCombos, sets, cardPage}, deck: {list}}) => {
	return {cardCombos, page, cardData, cardPage, cart, sets, list}
}, actions)(
	({
		back,
		cardCombos,
		page,
		cardData,
		cardPage,
		cart,
		sets,
		list,
		inArea,
		options,
		card,
		getCardData,
		openModal,
		addCart,
		newMsg,
		changeCard,
		updateUser,
		changeAdvanced,
	}) => {
		const [target, setTarget] = useState(card)
		const [rulings, setRulings] = useState([])
		const [flipped, flip] = useState(false)
		const [similar, setSimilar] = useState([])
		const [prints, setPrints] = useState([])

		const {
			id,
			card_faces,
			rulings_uri,
			ind,
			set,
			set_name,
			rarity,
			released_at,
			related_uris,
			cmc,
			legalities,
			collector_number,
		} = target
		const {
			name,
			oracle_text,
			flavor_text,
			mana_cost,
			image_uris,
			type_line,
			artist,
		} = card_faces ? card_faces[flipped ? 1 : 0] : target

		const slug = createSlug(card.name)
		const [param] = useLocation().pathname.split("/").slice(-1)
		const links = related_uris || {}
		const img = (image_uris || target.image_uris || {})["png" || "large"]

		useEffect(
			_ => {
				console.log(card)
				if (target.name !== card.name) {
					setTarget(card)
					setSimilar([])
				}
				if (!prints.length || target.name !== card.name)
					fetch(
						`https://api.scryfall.com/cards/search?unique=prints&order=released&q=${encodeURIComponent(
							card.name
						)}`
					)
						.then(res => res.json())
						.then(res =>
							setPrints(
								res.data
									.filter(d => d.name === card.name)
									.orderBy("released_at", true)
							)
						)
						.catch(err => console.log(err))

				if (param === "rulings")
					fetch(rulings_uri)
						.then(response => {
							if (!response.ok)
								throw new Error("HTTP status " + response.status)
							return response.json()
						})
						.then(data => setRulings(data.data))
				else if (param === "related")
					setSimilar(getSimilarCards(cardData, card, 6))
			},
			[cardData.length, card.name, param]
		)

		// const combos = cardCombos
		// 	.filter(([a, b]) => a === name || b === name)
		// 	.map(([a, b]) => Q(cardData, "name", a === name ? b : a)[0] || null)
		// 	.filter(c => !!c)

		const Info = _ => (
			<div className="details mini-spaced-col ">
				<div className="mini-block">
					<Tags of={card} />
				</div>
				<div className="mini-spaced-bar bar even">
					<h1>{name}</h1>
				</div>

				{type_line.includes("Land") ? null : (
					<span className={"bar even"}>
						<h3 className="mini-spaced-bar">{formatManaSymbols(mana_cost)}</h3>
						<span className="cmc">({cmc})</span>
					</span>
				)}

				<h3 className="mini-spaced-bar bar even">{type_line}</h3>
				<div className="oracle-text">
					{oracle_text && oracle_text.length
						? formatText(oracle_text)
						: "No text"}
				</div>
				<div className="asterisk">
					{flavor_text ? formatText(flavor_text) : "No flavor text"}
				</div>
				<div className="bar even mini-spaced-bar">
					<Icon
						name={`(${set}) ${set_name}`}
						className={`${rarity}`}
						loader={set}
						src={
							!sets.length
								? null
								: (sets.filter(s => s.name === set_name)[0] || {}).icon_svg_uri
						}
					/>{" "}
					<span>{set_name} — </span>
					<span>{reorderDate(released_at)}</span>
				</div>
				<div>Illustrated by {artist}</div>
				<div className="">
					<div className="col-2 mini-spaced-col">
						{Object.entries(legalities).map(([n, l]) => (
							<ToolTip
								message={titleCaps(`${l.replace("not_", "il")} in ${n}`)}>
								<div
									className={`icon-${
										l === "legal"
											? "ok green"
											: l === "not_legal"
											? "minus  disabled"
											: l === "banned"
											? "cancel red"
											: l === "restricted"
											? "attention yellow"
											: null
									}`}>
									{titleCaps(n)}
								</div>
							</ToolTip>
						))}
					</div>
				</div>
			</div>
		)
		const Rulings = _ => (
			<div className="rulings">
				{!rulings.length ? (
					<Loading anim=" " spinner=" " subMessage="No Rulings Found" />
				) : (
					<>
						<h3 className="big-block">
							{rulings.length} {pluralize("Ruling", rulings.length)}
						</h3>
						{rulings.map(r => (
							<div key={r.comment} className="ruling mini-spaced-col">
								{formatText(r.comment)}
								<p className="asterisk thin-indent">
									— {r.source} {reorderDate(r.published_at)}
								</p>
							</div>
						))}
					</>
				)}
			</div>
		)

		const Related = _ => (
			<div className="related spaced-col">
				<div className="mini-block">
					<Tags of={card} />
				</div>

				<div className="similar ">
					<h3 className="">Similar Cards</h3>
					<div className="bar inner">
						{cardData.length ? (
							similar.length ? (
								similar.map(({card, weight}) => {
									const added = Q(cart, "name", card.name).length
									return (
										<div className="result-card">
											<CardControls key={id} card={card} param={param} />
											<button
												className={`add-button icon-plus ${
													added && "icon-ok selected"
												}`}
												onClick={_ => addCart(card)}>
												{added ? added : ""}
											</button>
										</div>
									)
								})
							) : (
								<Loading subMessage={"Finding Similar..."} />
							)
						) : (
							<Loading subMessage="Loading Cards..." />
						)}
					</div>
				</div>
			</div>
		)

		return (
			<div className="inspect-container bar full block">
				<div className="content flex-row spaced-bar">
					<div className="col">
						<div
							onClick={_ =>
								openModal({title: name, content: <img src={img} />})
							}>
							<Card card={{...target, flipped}} imgSize={"png"} />
						</div>
						{!card_faces ? null : (
							<button className="small-button" onClick={_ => flip(!flipped)}>
								Flip
							</button>
						)}
						<button
							className="add-button icon-plus"
							onClick={_ => addCart(target)}>
							Add
						</button>
						<div className="links bar  mini-spaced-bar">
							<a target="_blank" href={links.gatherer}>
								<button className="inverse-small-button">Gatherer</button>
							</a>
							<a target="_blank" href={links.mtgtop8}>
								<button className="inverse-small-button">MTGtop8</button>
							</a>
							<a target="_blank" href={links.tcgplayer_decks}>
								<button className="inverse-small-button">
									TCGplayer Decks
								</button>
							</a>
						</div>
						<div className="">
							<div className="bar even mini-spaced-bar">
								<Icon
									name={`(${set}) ${set_name}`}
									className={`${rarity}`}
									loader={set}
									src={
										!sets.length
											? null
											: (sets.filter(s => s.name === set_name)[0] || {})
													.icon_svg_uri
									}
								/>
								<h4>{set.toUpperCase()}</h4>
								<h4>${target.prices.usd || "???"}</h4>
							</div>
						</div>
						<div className="sets mini-spaced-bar">
							{prints.length > 8 ? (
								<BasicSearch
									searchable
									preview
									self={target.set_name}
									options={prints}
									callBack={p => setTarget(p)}
									renderAs={p => (
										<div className="flex-row even">
											<Icon
												key={p.id}
												name={p.set_name}
												className={`${p.rarity}`}
												loader={p.set}
												src={
													!sets.length
														? null
														: (sets.filter(s => s.name === p.set_name)[0] || {})
																.icon_svg_uri
												}
											/>
											<span>{p.set_name}</span>
										</div>
									)}
								/>
							) : (
								prints.map(p => (
									<button
										className={id === p.id && "selected"}
										onClick={_ => setTarget(p)}>
										<Icon
											key={p.id}
											name={p.set_name}
											className={`${p.rarity}`}
											loader={p.set}
											src={
												!sets.length
													? null
													: (sets.filter(s => s.name === p.set_name)[0] || {})
															.icon_svg_uri
											}
										/>
									</button>
								))
							)}
						</div>
					</div>
					<div className="text">
						<div className="bar tab-switch">
							<NavLink
								className="tab"
								activeClassName="selected"
								to={`${HOME_DIR}/card/${slug}/info`}>
								Info
							</NavLink>
							<NavLink
								className="tab"
								activeClassName="selected"
								to={`${HOME_DIR}/card/${slug}/rulings`}>
								Rulings
							</NavLink>
							<NavLink
								className="tab"
								activeClassName="selected"
								to={`${HOME_DIR}/card/${slug}/related`}>
								Related
							</NavLink>
						</div>
						{param === "rulings" ? (
							<Rulings />
						) : param === "related" ? (
							<Related />
						) : (
							<Info />
						)}
					</div>
				</div>
			</div>
		)
	}
)

// <div className="combo ">
// 	<h3 className="">Combos With</h3>
// 	<div className="bar inner">
// 		{cardData.length ? (
// 			combos.length ? (
// 				combos.map(c => {
// 					const added = Q(cart, "name", c.name).length
// 					return (
// 						<div>
// 							<button
// 								className={`add-button icon-plus ${
// 									added && "icon-ok selected"
// 								}`}
// 								onClick={_ => addCart(c)}>
// 								{added ? added : ""}
// 							</button>

// 							<CardControls key={c.id} card={c} param={param} />
// 						</div>
// 					)
// 				})
// 			) : (
// 				<Loading
// 					anim="none"
// 					spinner=" "
// 					subMessage={"None Submitted"}
// 				/>
// 			)
// 		) : (
// 			<Loading subMessage="Loading Cards..." />
// 		)}
// 	</div>
// 	<BasicSearch
// 		searchable
// 		placeholder="Search Card Names"
// 		options={cardData}
// 		callBack={c =>
// 			updateUser({cardCombos: [...cardCombos, [name, c.name]]})
// 		}
// 	/>
// </div>

// const shiftList = by => {
// 	if (inArea && ind) {
// 		const nextInd =
// 			by + ind >= inArea.length
// 				? 0
// 				: by + ind < 0
// 				? inArea.length - 1
// 				: by + ind
// 		setTarget(inArea[nextInd])
// 	}
// }

// useEffect(_ => {
// 	const keyEvent = e => {
// 		if (cooledDown) {
// 			coolDown(false)
// 			setTimeout(_ => coolDown(true), 100)
// 			switch (e.key) {
// 				case "ArrowLeft":
// 					return shiftList(-1)
// 				case "ArrowRight":
// 					return shiftList(1)
// 			}
// 		}
// 	}
// 	window.addEventListener("keydown", keyEvent)
// 	return _ => window.removeEventListener("keydown", keyEvent)
// }, [])

// const header = (
// 	<div className="header">
// 		<div className="inspect-nav">
// 			<button
// 				className="warning-button icon-cancel"
// 				onClick={_ => openModal(back || null)}
// 			/>
// 			<button
// 				style={{display: !list && "none"}}
// 				onClick={_ => shiftList(-1)}>
// 				{"<"}
// 			</button>
// 			<button
// 				style={{display: !list && "none"}}
// 				onClick={_ => shiftList(1)}>
// 				{">"}
// 			</button>
// 		</div>
// 	</div>
// )

// const inner =
// 	options === "Add" ? (
// 		<div className="options">
// 			{BOARDS.map(B => (
// 				<button
// 					key={B}
// 					className="small-button"
// 					onClick={_ => {
// 						addCard(card, B)
// 						newMsg(`Added ${name} to ${B}board`, "success")
// 					}}>
// 					{B} (
// 					{list.filter(l => l.name === name && l.board === B).length})
// 				</button>
// 			))}
// 		</div>
// 	) : options === "Move" ? (
// 		page === "Build" ? (
// 			<div className="options">
// 				In {board}board, Move to:
// 				{BOARDS.filter(B => B !== board).map(B => {
// 					const cards = list.filter(
// 						l => l.name === name && l.board === B
// 					)
// 					return (
// 						<button
// 							key={B}
// 							className="small-button"
// 							onClick={_ => changeCard(card, {board: B})}>
// 							{B} ({cards.length})
// 						</button>
// 					)
// 				})}
// 			</div>
// 		) : page === "Test" ? (
// 			<div className="options">
// 				In {zone}, Move to:
// 				{ZONES.filter(Z => Z !== zone).map(Z => (
// 					<button
// 						key={Z}
// 						className="small-button"
// 						onClick={_ => changeCard(card, {zone: Z})}>
// 						{Z} (
// 						{list.filter(l => l.name === name && l.zone === Z).length})
// 					</button>
// 				))}
// 			</div>
// 		) : null
// 	) : null
