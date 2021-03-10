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
		auth: {isAuthenticated},
		deck: {_id, name, slug, colors, list, format, custom, unsaved},
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
	}) => {
		const param = useLocation().pathname.split("/").slice(-1)[0]

		const [contextLink, setContextLink] = useState(null)
		const [opened, open] = useState(false)
		const [tab, setTab] = useState("Cart")
		const [listed, setListed] = useState([])

		useEffect(
			_ => {
				setListed(tab === "Cart" ? cart : list.filter(c => c.board === tab))
			},
			[cart, list, tab]
		)

		if (contextLink) {
			setContextLink(null)
			useHistory().push(contextLink)
		}

		const addC = (c, rm, to) =>
			to || tab === "Cart" ? addCart(c, rm) : addCard(c, to || tab, rm)

		const Cart = _ => (
			<div className="sub-cart-head">
				<DropSlot
					callBack={c => {
						if (list.find(_ => _.key === c.key)) addCard(c, null, true)
						addC(c)
					}}>
					<div className={`board-inner ${opened || "hide"}`}>
						<div className="list-inner">
							{itemizeDeckList(listed).map(cards => (
								<div
									key={cards.length + cards[0].id}
									className="flex-row mini-spaced-bar">
									<div className="col quant-tickers">
										<div
											className="button icon-plus"
											onClick={_ => addC(cards[0])}
										/>
										<div
											className="button icon-minus"
											onClick={_ => addC(cards[0], true)}
										/>
									</div>
									<CardControls
										card={cards[0]}
										quant={cards.length}
										itemType={ItemTypes.CARD}
										param={param}
										cardHeadOnly
										contextMenu={[
											{
												label: "Add to Cart",
												callBack: _ => addCart(cards[0]),
											},
											{
												label: "Remove from Cart",
												callBack: _ => addCart(cards[0], true),
												color:
													cart.find(({name}) => name === cards[0].name) ||
													"disabled",
											},
											...BOARDS.map(B => {
												return {
													label: `Add to ${B}board`,
													callBack: _ => addCard(cards[0], B),
												}
											}),
										]}
									/>
								</div>
							))}
						</div>
					</div>
				</DropSlot>
			</div>
		)

		return (
			<div className={`cart ${opened && "open"}`}>
				<div className="cart-head">
					<button className={`full-width`} onClick={_ => open(!opened)}>
						Cart ({cart.length})
					</button>
					<div className="flex-row">
						{_id ? (
							<>
								<NavLink
									to={`${HOME_DIR}/deck/${slug}`}
									className={"icon flex-row even mini-spaced-bar"}>
									<ToolTip message={`View "${name}"`}>
										<button className="flex-row even mini-spaced-bar">
											<PieChart
												data={COLORS("fill").map((color, i) => {
													return {value: colors[i], color}
												})}
												startAngle={270}
											/>
											<h5>
												{opened
													? name.length > 20
														? `${name.slice(0, 23)}...`
														: name
													: `(${
															list.filter(l => l.board === BOARDS[0]).length
													  })`}
											</h5>
										</button>
									</ToolTip>
								</NavLink>
								{canEdit() && unsaved ? (
									<ToolTip message={`Save Changes to "${name}"`}>
										<button onClick={saveDeck}>
											<button className="inverse-small-button icon-unsaved" />
										</button>
									</ToolTip>
								) : (
									<ToolTip message={`Close "${name}"`}>
										<button
											className="small-button warning-button icon-cancel"
											onClick={openDeck}
										/>
									</ToolTip>
								)}
							</>
						) : null}

						<button
							className={`icon-folder-open small-button`}
							onClick={_ =>
								openModal({
									title: "Add cart to deck",
									content: <DeckSearch you noLink />,
								})
							}
						/>
					</div>
					<div className={opened || "hide"}>
						<div className="bar even thin-pad">
							<button
								className={`small-button `}
								onClick={_ => {
									newMsg("Copied to clipboard!", "success")
									navigator.clipboard.writeText(textList(cart))
								}}>
								<span className="icon-clipboard" />
								Copy
							</button>
						</div>

						<div className="tab-switch flex-row full-width fill">
							{(_id ? ["Cart", ...BOARDS] : ["Cart"]).map(t => (
								<DropSlot callBack={c => addC(c)}>
									<div
										className={`tab ${t === tab && "selected"}`}
										onClick={_ => setTab(t)}>
										{t}{" "}
										{
											(t === "Cart" ? cart : list.filter(c => c.board === t))
												.length
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
