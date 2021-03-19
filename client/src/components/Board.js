import React, {useState} from "react"
import {connect} from "react-redux"
import {useHistory} from "react-router-dom"
import actions from "../actions"
import utilities from "../utilities"

import CardTuner from "./CardTuner"
import Loading from "./Loading"
import DropSlot from "./DropSlot"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import ContextMenu from "./ContextMenu"

const {
	Q,
	HOME_DIR,
	BOARDS,
	itemizeDeckList,
	isLegal,
	titleCaps,
	pluralize,
	chooseCommander,
	legalCommanders,
	filterCardType,
	COLORS,
	FILTER_TERMS,
	THEN_FILTERS,
	ItemTypes,
	MAIN_BOARD,
	SINGLETON,
	canEdit,
	createSlug,
} = utilities

export default connect(
	({main: {cardData}, filters, deck: {loading, list, format, custom}}) => {
		return {
			cardData,
			...filters,
			loading,
			list,
			format,
			custom,
		}
	},
	actions
)(
	({
		cardData,
		loading,
		list,
		format,
		custom,
		view,
		sortBy,
		thenSortBy,
		focus,
		tune,
		board,
		editing,
		changeFilters,
		changeCustom,
		addCard,
		changeDeck,
		changeCard,
	}) => {
		const [contextLink, setContextLink] = useState(null)

		const edit = canEdit() && editing

		if (contextLink) {
			setContextLink(null)
			useHistory().push(contextLink)
		}

		let inBoard = list.filter(c => c.board === board && !c.commander)
		if (sortBy === "Custom") {
			inBoard = inBoard.map(c => {
				return {
					...c,
					custom: (custom.filter(cu => cu.name === c.name)[0] || {})
						.category,
				}
			})
		}
		const commanders = list.filter(c => board === MAIN_BOARD && c.commander)

		const CommandHeader = _ => {
			return board === MAIN_BOARD ? (
				<div className={` ${view}-view`}>
					<DropSlot
						field={"Command"}
						accept={edit ? ItemTypes.CARD : "N/A"}
						callBack={c =>
							changeDeck("list", chooseCommander(c, list))
						}
					>
						<h2 className="label">
							Commander{commanders.length > 1 ? "s" : ""}
						</h2>
						<div className={`grid-inner`}>
							{commanders.length ? (
								commanders.map(c => renderCardStack([c], true))
							) : edit ? (
								<BasicSearch
									searchable
									limit={5}
									placeholder="Choose a Commander"
									options={legalCommanders(format, cardData)}
									renderAs={c => (
										<CardControls card={c} cardHeadOnly />
									)}
									callBack={c =>
										changeDeck(
											"list",
											chooseCommander(c, list)
										)
									}
								/>
							) : (
								<Loading
									anim={"none"}
									spinner={" "}
									subMessage={"No Commander Chosen"}
								/>
							)}
						</div>
					</DropSlot>
				</div>
			) : null
		}

		const BoardInner = _ => {
			const F = FILTER_TERMS.filter(t => t.name === sortBy)[0] || {}
			const category = {
				...F,
				vals:
					sortBy === "Custom"
						? custom
								.unique("category")
								.map(cu => cu.category)
								.filter(cu => !!cu && cu !== "uncategorized")
						: F.vals || inBoard.map(c => c[F.key]).sort(),
				other: F.other || `Missing ${F.name}`,
			}

			const sorted = (val = "", ind = null) => {
				const filteredCards =
					ind === null
						? inBoard
						: filterCardType(inBoard, category, val)
				inBoard = inBoard.filter(
					b => !filteredCards.filter(c => c.key === b.key).length
				)

				const cardStacks = itemizeDeckList(
					filteredCards.orderBy(
						(
							THEN_FILTERS.filter(
								t => t.name === thenSortBy
							)[0] || {}
						).key
					)
				)
				const valName =
					(category.valNames && category.valNames[ind]) ||
					val.toString()

				return !cardStacks.length ? null : (
					<div
						key={board + "_" + category.key + "_" + valName}
						className={`list ${view}-view`}
					>
						<DropSlot
							accept={
								sortBy === "Custom" && edit
									? ItemTypes.CARD
									: "N/A"
							}
							field={val}
							callBack={c =>
								changeCustom(c.name, {category: val})
							}
						>
							<h2 className="label mini-spaced-bar">
								<span
									className={`icon ms ms-${
										category.icon &&
										val.toString().toLowerCase()
									}`}
								/>
								<span>
									{titleCaps(valName)} ({filteredCards.length}
									)
								</span>
							</h2>
							<div className={`${view}-inner thinner-pad`}>
								{cardStacks.map(c => renderCardStack(c))}
							</div>
						</DropSlot>
					</div>
				)
			}

			return (
				<div className={`board-inner ${view} spaced-col`}>
					{SINGLETON(format) ? <CommandHeader /> : null}
					{category.vals.map((val, ind) => sorted(val, ind))}
					{sorted(category.other)}
				</div>
			)
		}

		const renderCardStack = (cards = [], noQuant) => {
			if (!cards.length) return null
			const legal = isLegal(
				cards[0],
				format,
				commanders
					.map(co => co.color_identity)
					.flat()
					.unique()
			)

			const renderedCard = ({card, cardInd}) => {
				const imageStyle = {
					position: !!cardInd && "absolute",
					marginTop: !!cardInd && cardInd - cards.length - 10 + "rem",
					marginBottom:
						cards.length > 1 && !cardInd && cards.length + "rem",
				}
				return (
					<div className="flex-row mini-spaced-bar board-card">
						{!edit || cardInd ? null : (
							<div className="col quant-tickers">
								<div
									className="button icon-plus"
									onClick={_ => addCard(card)}
								/>
								<div
									className="button icon-minus"
									onClick={_ => addCard(card, null, true)}
								/>
							</div>
						)}
						<span
							onClick={_ => changeFilters("tune", card)}
							key={card.key}
						>
							<ContextMenu
								options={[
									{
										label: "View Card Page",
										callBack: _ =>
											setContextLink(
												`${HOME_DIR}/card/${createSlug(
													card.name
												)}/info`
											),
									},
									...BOARDS.filter(B => B !== board).map(
										B => {
											return {
												label: `Move to ${B}board`,
												callBack: _ =>
													changeCard(card, {
														board: B,
													}),
											}
										}
									),
									{
										label: "Add a Copy",
										callBack: _ => addCard(card, board),
									},
									{
										label: "Remove a Copy",
										callBack: _ =>
											addCard(card, null, true),
									},
									{
										label: "Remove All",
										color: "red",
										callBack: _ =>
											addCard(
												list.filter(
													l => l.name === card.name
												),
												null,
												true
											),
									},
								]}
							>
								<CardControls
									card={card}
									quant={noQuant ? null : cards.length}
									itemType={ItemTypes.CARD}
									imgSize="small"
									classes={`
										${edit && cards.length > legal && cardInd >= legal && "illegal "} 
										${(Q(card, focus.key, focus.val) || tune.name === card.name) && "selected"}
									`}
									cardHeadOnly={view === "list"}
									nameOnly={view === "text"}
									style={view === "grid" ? imageStyle : {}}
								/>
							</ContextMenu>
						</span>
					</div>
				)
			}

			return (
				<div key={board + cards[0].key} className={`of-name`}>
					{view !== "grid"
						? renderedCard({
								card: cards[0],
								cardInd: 0,
						  })
						: cards.map((card, cardInd) =>
								renderedCard({card, cardInd})
						  )}
				</div>
			)
		}

		return (
			<DropSlot
				accept={edit ? ItemTypes.CARD : "N/A"}
				field={board}
				callBack={c =>
					c.key ? changeCard(c, {board}) : addCard(c, board)
				}
			>
				<div className={`board ${board}-board flex-row`}>
					{loading ? (
						<Loading message={"Fetching Decklist"} />
					) : inBoard.length ? (
						<BoardInner />
					) : (
						<Loading
							spinner={" "}
							anim="none"
							message={`No Cards in ${board}board`}
						/>
					)}
				</div>
			</DropSlot>
		)
	}
)
