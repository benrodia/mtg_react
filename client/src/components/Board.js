import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DropSlot from "./DropSlot"
import BasicSearch1 from "./BasicSearch1"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import PrintSelector from "./PrintSelector"
import Card from "./Card"
import Icon from "./Icon"
import EditableText from "./EditableText"

const {
	Q,
	itemizeDeckList,
	isLegal,
	titleCaps,
	pluralize,
	chooseCommander,
	legalCommanders,
	filterCardType,
	COLORS,
	FILTER_TERMS,
	ItemTypes,
	MAIN_BOARD,
	SINGLETON,
	log,
	canEdit,
} = utilities

export default connect(
	({
		filters,
		main: {sets, legalCards},
		deck: {list, format, author, editing, unsaved},
	}) => {
		return {
			sets,
			legalCards,
			...filters,
			list,
			format,
			author,
			editing,
			unsaved,
		}
	},
	actions
)(
	({
		header,
		customFields,
		legalCards,
		sets,
		list,
		format,
		author,
		editing,
		unsaved,
		view,
		sortBy,
		focus,
		board,
		openModal,
		addCard,
		changeCard,
		changeDeck,
		changeFilters,
	}) => {
		let inBoard = list.filter(c => c.board === board && !c.commander)
		const commanders = list.filter(c => board === MAIN_BOARD && !!c.commander)

		const boardInner = _ => {
			const Filter_By = FILTER_TERMS.filter(t => t.name === sortBy)[0] || {}
			const category = {
				...Filter_By,
				vals:
					sortBy === "Custom"
						? customFields.map(f => f.key)
						: Filter_By.vals || inBoard.map(c => c[Filter_By.key]).sort(),
				valNames:
					sortBy === "Custom"
						? customFields.map(f => f.name)
						: Filter_By.valNames,
				other: Filter_By.other || `Missing ${Filter_By.name}`,
			}

			const sorted = (val = "", ind = null) => {
				const filteredCards =
					ind === null ? inBoard : filterCardType(inBoard, category, val)
				inBoard = inBoard.filter(
					b => !filteredCards.filter(c => c.key === b.key).length
				)

				const cardStacks = itemizeDeckList(filteredCards).orderBy("name")
				const valName =
					(category.valNames && category.valNames[ind]) || val.toString()

				if (category.name === "Custom") {
					return (
						<DropSlot
							key={"custom" + valName}
							field={val}
							accept={[ItemTypes.CARD, ItemTypes.COMMANDER]}
							callBack={c =>
								c.key ? changeCard(c, {customField: val}) : addCard(c, board)
							}>
							<div
								key={board + "_" + category.key + "_" + valName}
								className={`${valName}-list list ${view}-view`}>
								<h3>
									<EditableText
										changeable
										removable
										value={{name: titleCaps(valName), key: val}}
										list={customFields}
										callBack={n => changeFilters("customFields", n)}
									/>{" "}
									({filteredCards.length})
								</h3>
								<div className={`${view}-inner`}>
									{cardStacks.map(c => renderCardStack(c, valName))}
								</div>
							</div>
						</DropSlot>
					)
				} else
					return !cardStacks.length ? null : (
						<div
							key={board + "_" + category.key + "_" + valName}
							className={`${valName}-list list ${view}-view`}>
							<h3>
								<div
									className={`icon ms ms-${
										category.icon && val.toString().toLowerCase()
									}`}
								/>{" "}
								{titleCaps(valName)} ({filteredCards.length})
							</h3>
							<div className={`${view}-inner`}>
								{cardStacks.map(c => renderCardStack(c, valName))}
							</div>
						</div>
					)
			}
			const commandHeader = (
				<div className={`Commander-list list grid-view`}>
					<DropSlot
						field={"Command"}
						accept={ItemTypes.CARD}
						callBack={c => chooseCommander(c, list)}>
						<h3>
							<div className={`icon`} />
							Commander {commanders.length > 1 ? "s" : ""}
						</h3>
						<div className={`grid-inner`}>
							{commanders.length ? (
								renderCardStack(commanders, "Commander")
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
			)

			return (
				<div className={`board-inner ${view}`}>
					{SINGLETON(format) ? commandHeader : null}
					{category.vals.map((val, ind) => sorted(val, ind))}
					{sorted(category.other)}
				</div>
			)
		}

		const renderCardStack = (cards = []) => {
			if (!cards[0]) return null
			const legal = isLegal(cards[0], format)
			const numOfSets = itemizeDeckList(cards, ["set_name"])

			const renderedCard = ({card, cardInd, cardsOfSet}) => {
				const setLogo = (
					<Icon
						name={card.set_name}
						className={`${card.rarity} ${editing ? "clicky-icon" : ""}`}
						loader={card.set}
						src={
							!sets.length
								? null
								: (sets.filter(s => s.name === card.set_name)[0] || {})
										.icon_svg_uri
						}
					/>
				)
				const controls = (
					<>
						<div className={`quantity `}>
							<span
								className={`icon-plus ${
									cards.length >= legal ? "disabled" : ""
								} ${!cardInd || "invisible"}`}
								onClick={_ => addCard(card, board)}
							/>
							<span
								className="icon-minus"
								onClick={_ => addCard(card, board, true)}
							/>
						</div>
						<span
							onClick={_ =>
								openModal({
									title: "Change Printing",
									content: <PrintSelector change card={card} />,
								})
							}>
							{view === "list" || card.commander ? (
								setLogo
							) : (
								<button>
									{setLogo} {card.set_name}
								</button>
							)}
						</span>
					</>
				)
				const quant = <h3 className="quant">{cards.length}x</h3>
				const style = {
					position: cardInd > 0 && view === "grid" && "absolute",
					marginTop:
						cardInd > 0 &&
						view === "grid" &&
						cardInd - cardsOfSet.length - 10 + "rem",
					pointerEvents:
						cardInd !== cardsOfSet.length - 1 && view === "grid" && "none",
					marginBottom:
						cardsOfSet.length > 1 &&
						!cardInd &&
						view === "grid" &&
						cardsOfSet.length + "rem",
				}
				return (
					<CardControls
						options={"Move"}
						key={card.key}
						card={card}
						itemType={
							!editing
								? "NA"
								: card.commander
								? ItemTypes.COMMANDER
								: ItemTypes.CARD
						}
						imgSize="small"
						classes={`
										${cards.length > legal && cardInd >= legal && "illegal "} 
										${Q(card, focus.key, focus.val) && "highlighted"}
									`}
						cardHeadOnly={view === "list" && !card.commander}
						style={style}>
						{editing ? controls : quant}
					</CardControls>
				)
			}

			return (
				<div key={board + cards[0].key} className={`of-name`}>
					{!(view === "grid" || editing)
						? renderedCard({
								card: cards[0],
								cardInd: 0,
								cardsOfSet: cards.length,
						  })
						: numOfSets.map(cardsOfSet =>
								cardsOfSet.map((card, cardInd) =>
									renderedCard({card, cardInd, cardsOfSet})
								)
						  )}
				</div>
			)
		}

		return (
			<div className={`board ${board}-board`}>
				{inBoard.length || commanders.length ? (
					boardInner()
				) : (
					<Loading
						spinner={" "}
						anim="none"
						message={`No Cards in ${board}board`}
					/>
				)}
			</div>
		)
	}
)

// <BasicSearch
// 	searchable
// 	limit={20}
// 	options={legalCommanders(format, legalCards)}
// 	label={"name"}
// 	callBack={c =>
// 		changeDeck("list", chooseCommander(c, list, legalCards, true))
// 	}
// 	placeholder="Choose a Commander"
// />
