import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import {useLocation, useHistory, Link} from "react-router-dom"
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
		deck: {name, slug, colors, list, format, custom},
	}) => {
		return {
			cart,
			cardData,
			isAuthenticated,
			name,
			slug,
			colors,
			list,
			format,
			custom,
		}
	},
	actions
)(
	({
		cardData,
		name,
		slug,
		colors,
		list,
		format,
		cart,
		isAuthenticated,
		changeAdvanced,
		changeCard,
		addCart,
		addCard,
		openModal,
		newMsg,
	}) => {
		const param = useLocation().pathname.split("/").slice(-1)[0]

		const [contextLink, setContextLink] = useState(null)
		const [copied, setCopied] = useState(false)
		const [opened, open] = useState(false)

		useEffect(
			_ => {
				setCopied(false)
			},
			[cart]
		)
		if (contextLink) {
			setContextLink(null)
			useHistory().push(contextLink)
		}

		const Cart = ({l}) => (
			<DropSlot
				callBack={c => {
					if (list.find(_ => _.key === c.key)) addCard(c, null, true)
					addCart(c)
				}}>
				<div className="list-inner">
					{itemizeDeckList(l).map(cards => (
						<div
							key={cards.length + cards[0].id}
							className="flex-row mini-spaced-bar">
							<div className="col quant-tickers">
								<div
									className="button icon-plus"
									onClick={_ => addCart(cards[0])}
								/>
								<div
									className="button icon-minus"
									onClick={_ => addCart(cards[0], true)}
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
			</DropSlot>
		)

		return (
			<div className={`cart ${opened && "open"}`}>
				<div className="cart-head thin-pad">
					<button
						className={`full-width ${cart.length || "disabled"}`}
						onClick={_ => open(!opened)}>
						Cart ({cart.length})
					</button>
					{opened ? (
						<div className="bar even">
							<button
								className={`small-button ${
									(cart.length && isAuthenticated) || "disabled"
								}`}
								onClick={_ =>
									openModal({
										title: "Add cart to deck",
										content: <DeckFeed you addCards />,
									})
								}>
								<span className="icon-folder-open" />
								Add cart to deck
							</button>
							<button
								className={`small-button ${
									(cart.length && !copied) || "disabled"
								}`}
								onClick={_ => {
									newMsg("Copied to clipboard!", "success")
									setCopied(true)
									navigator.clipboard.writeText(textList(cart))
								}}>
								<span className="icon-clipboard" />
								Copy
							</button>
							<button
								className={`inverse-small-button warning-button ${
									cart.length || "disabled"
								}`}
								onClick={_ => {
									open(false)
									addCart(null)
								}}>
								<span className="icon-cancel" />
								Clear
							</button>
						</div>
					) : null}
				</div>
				{opened ? (
					<div className={`board-inner`}>
						<Cart l={cart} />
					</div>
				) : null}
			</div>
		)
	}
)
// {!slug
// 	? null
// 	: BOARDS.map(B => {
// 			const cards = list.filter(c => c.board === B)
// 			return (
// 				<DropSlot
// 					accept={ItemTypes.CARD}
// 					callBack={c => {
// 						if (list.find(({key}) => c.key === key))
// 							changeCard({board: B})
// 						else {
// 							addCard(c, B)
// 							addCart(c, true)
// 						}
// 					}}>
// 					<h1>
// 						{B}board ({cards.length})
// 					</h1>
// 					{cards.length ? (
// 						<Cart l={cards} />
// 					) : (
// 						<Loading
// 							spinner={" "}
// 							anim="none"
// 							subMessage={`No Cards in ${B}board`}
// 						/>
// 					)}
// 				</DropSlot>
// 			)
// 	  })}
