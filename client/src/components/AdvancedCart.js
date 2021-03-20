import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import {NavLink, useLocation, useHistory, Link} from "react-router-dom"
import actions from "../actions"
import utilities from "../utilities"
import {PieChart} from "react-minimal-pie-chart"

import Icon from "./Icon"
import CardTuner from "./CardTuner"
import Loading from "./Loading"
import DropSlot from "./DropSlot"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import DeckFeed from "./DeckFeed"
import ContextMenu from "./ContextMenu"
import ToolTip from "./ToolTip"
import DeckSearch from "./_Page_Deck_Search"

const {
	HOME_DIR,
	Q,
	BOARDS,
	itemizeDeckList,
	isLegal,
	titleCaps,
	pluralize,
	chooseCommander,
	legalCommanders,
	filterCardType,
	COLORS,
	ItemTypes,
	MAIN_BOARD,
	SINGLETON,
	canEdit,
	textList,
	generateRandomDeck,
	creator,
	createSlug,
} = utilities

export default connect(
	({
		main: {cardData},
		filters: {
			advanced: {cart},
		},
		settings: {editing},
		auth: {isAuthenticated},
		deck: {_id, name, slug, colors, list, format, custom, unsaved, feature},
	}) => {
		return {
			cart,
			cardData,
			isAuthenticated,
			_id,
			name,
			slug,
			colors,
			list,
			format,
			custom,
			unsaved,
			feature,
			editing,
		}
	},
	actions
)(
	({
		cardData,
		_id,
		name,
		slug,
		colors,
		list,
		format,
		unsaved,
		feature,
		editing,
		cart,
		isAuthenticated,
		changeAdvanced,
		changeCard,
		addCart,
		addCard,
		openModal,
		newMsg,
		saveDeck,
		openDeck,
		changeSettings,
	}) => {
		const param = useLocation().pathname.split("/").slice(-1)[0]
		const edit = canEdit() && editing

		const [contextLink, setContextLink] = useState(null)
		const [opened, open] = useState(false)
		const [tab, setTab] = useState("Cart")
		const [listed, setListed] = useState([])

		useEffect(
			_ => {
				setListed(
					tab === "Cart" ? cart : list.filter(c => c.board === tab)
				)
			},
			[cart, list, tab]
		)

		if (contextLink) {
			setContextLink(null)
			useHistory().push(contextLink)
		}

		const addC = (c, rm, to = tab) => {
			const inCart = cart.find(_ => _.key === c.key)
			if (!(inCart && to === "Cart") || to !== c.board || rm) {
				if (to === "Cart") addCart(c, rm)
				else addCard(c, to, rm)
				if (inCart) addCart(c, true)
				else if (c.board) addCard(c, c.board, true)
			}
		}

		const Cart = _ => (
			<div className={`sub-cart-head ${_id && "deck"}`}>
				<DropSlot callBack={c => addC(c, null, tab)}>
					<div className={`board-inner ${opened || "hide"}`}>
						<div className="list-inner">
							{!listed.length ? (
								<Loading
									spinner=" "
									subMessage={`No Cards in ${tab}${
										tab === "Cart" ? "" : "board"
									}`}
								/>
							) : (
								itemizeDeckList(listed).map(cards => (
									<div
										key={cards.length + cards[0].id}
										className="flex-row mini-spaced-bar"
									>
										{edit || tab === "Cart" ? (
											<div
												className={`col quant-tickers`}
											>
												<div
													className="button icon-plus"
													onClick={_ =>
														addC(cards[0])
													}
												/>
												<div
													className="button icon-minus"
													onClick={_ =>
														addC(cards[0], true)
													}
												/>
											</div>
										) : null}
										<CardControls
											card={cards[0]}
											quant={cards.length}
											itemType={ItemTypes.CARD}
											param={param}
											cardHeadOnly
											contextMenu={[
												{
													label: "Add to Cart",
													callBack: _ =>
														addCart(cards[0]),
												},
												{
													label: "Remove from Cart",
													callBack: _ =>
														addCart(cards[0], true),
													color:
														cart.find(
															({name}) =>
																name ===
																cards[0].name
														) || "disabled",
												},
												...BOARDS.map(B => {
													return {
														label: `Add to ${B}board`,
														callBack: _ =>
															addCard(
																cards[0],
																B
															),
													}
												}),
											]}
										/>
									</div>
								))
							)}
						</div>
					</div>
				</DropSlot>
			</div>
		)

		return (
			<div className={`cart ${opened && "open"}`}>
				<div className="cart-head">
					<button
						className={`full-width icon-${
							opened ? "right" : "left"
						}`}
						onClick={_ => open(!opened)}
					>
						Cart ({cart.length})
					</button>
					<div className="flex-row">
						{_id ? (
							<>
								<NavLink
									to={`${HOME_DIR}/deck/${slug}`}
									className={
										"icon flex-row even mini-spaced-bar"
									}
								>
									<ToolTip message={`View "${name}"`}>
										<div className="deck-nav">
											<div className="col title mini-spaced-col">
												<div
													className="splash"
													style={{
														background: `url(${feature}) no-repeat center center`,
														backgroundSize: "cover",
													}}
												>
													<span className="grad" />
												</div>
												<div className=" icon flex-row even mini-spaced-bar">
													<PieChart
														data={COLORS(
															"fill"
														).map((color, i) => {
															return {
																value:
																	colors[i],
																color,
															}
														})}
														startAngle={270}
													/>
													<span
														className={
															opened || "hide"
														}
													>
														<h1 className="sub-title ">
															{name || "Untitled"}
														</h1>
														<h4>
															{titleCaps(format)}
														</h4>
													</span>
												</div>
											</div>
										</div>
									</ToolTip>
								</NavLink>
							</>
						) : null}
					</div>
					<div className={opened || "hide"}>
						<div className="bar even thin-pad">
							<button
								className={`icon-folder-open small-button`}
								onClick={_ =>
									openModal({
										title: "Add cart to deck",
										content: <DeckSearch you noLink />,
									})
								}
							>
								Open Deck
							</button>
							{canEdit() ? (
								<button
									className={`icon-pencil small-button ${
										edit && "selected"
									}`}
									onClick={_ =>
										changeSettings("editing", !editing)
									}
								>
									Edit List
								</button>
							) : null}

							<button
								className={`small-button `}
								onClick={_ => {
									newMsg("Copied to clipboard!", "success")
									navigator.clipboard.writeText(
										textList(cart)
									)
								}}
							>
								<span className="icon-clipboard" />
								Copy
							</button>
						</div>

						<div className="tab-switch flex-row full-width fill">
							{(_id ? ["Cart", ...BOARDS] : ["Cart"]).map(t => (
								<DropSlot callBack={c => addC(c, null, t)}>
									<div
										className={`tab ${
											t === tab && "selected"
										}`}
										onClick={_ => setTab(t)}
									>
										{t}{" "}
										{
											(t === "Cart"
												? cart
												: list.filter(
														c => c.board === t
												  )
											).length
										}
									</div>
								</DropSlot>
							))}
						</div>
					</div>
				</div>
				<Cart />
			</div>
		)
	}
)

// {edit && unsaved ? (
// 								<ToolTip message={`Save Changes to "${name}"`}>
// 									<button onClick={saveDeck}>
// 										<button className="inverse-small-button icon-unsaved" />
// 									</button>
// 								</ToolTip>
// 							) : (
// 								<ToolTip message={`Close "${name}"`}>
// 									<button
// 										className="small-button warning-button icon-cancel"
// 										onClick={openDeck}
// 									/>
// 								</ToolTip>
// 							)}
// <button
// 	className={`inverse-small-button warning-button ${
// 		cart.length || "disabled"
// 	}`}
// 	onClick={_ => {
// 		open(false)
// 		addCart(null)
// 	}}>
// 	<span className="icon-cancel" />
// 	Clear
// </button>
