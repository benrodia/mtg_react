import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import DropSlot from "./DropSlot"
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
		auth: {
			user: {_id},
			isAuthenticated,
		},
		filters,
		main: {sets, legalCards},
		deck: {list, format, author},
	}) => {
		return {sets, legalCards, ...filters, list, format, _id, isAuthenticated, author}
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
		_id,
		isAuthenticated,
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
				valNames: sortBy === "Custom" ? customFields.map(f => f.name) : Filter_By.valNames,
				other: Filter_By.other || `Missing ${Filter_By.name}`,
			}

			const sorted = (val = "", ind = null) => {
				const filteredCards = ind === null ? inBoard : filterCardType(inBoard, category, val)
				inBoard = inBoard.filter(b => !filteredCards.filter(c => c.key === b.key).length)

				const cardStacks = itemizeDeckList(filteredCards, ["name"]).orderBy("name")
				const valName = (category.valNames && category.valNames[ind]) || val.toString()

				if (category.name === "Custom") {
					return (
						<DropSlot
							key={"custom" + valName}
							field={val}
							accept={[ItemTypes.CARD, ItemTypes.COMMANDER]}
							callBack={c => changeCard(c, {customField: val})}>
							<div key={board + "_" + category.key + "_" + valName} className={`${valName}-list list ${view}-view`}>
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
								<div className={`${view}-inner`}>{cardStacks.map(c => renderCardStack(c, valName))}</div>
							</div>
						</DropSlot>
					)
				} else
					return !cardStacks.length ? null : (
						<div key={board + "_" + category.key + "_" + valName} className={`${valName}-list list ${view}-view`}>
							<h3>
								<div className={`icon ms ms-${category.icon && val.toString().toLowerCase()}`} /> {titleCaps(valName)} (
								{filteredCards.length})
							</h3>
							<div className={`${view}-inner`}>{cardStacks.map(c => renderCardStack(c, valName))}</div>
						</div>
					)
			}
			const commandHeader = (
				<div className={`Commander-list list grid-view`}>
					<h3>
						<div className={`icon`} /> {pluralize("Commander", commanders.length)}
					</h3>
					{canEdit() ? (
						<BasicSearch
							searchable
							limit={20}
							options={legalCommanders(format, legalCards)}
							label={"name"}
							callBack={c => changeDeck("list", chooseCommander(c, list, legalCards, true))}
							placeholder="Choose a Commander"
						/>
					) : null}
					<div className={`grid-inner`}>{renderCardStack(commanders, "Commander")}</div>
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
			return (
				<div key={board + cards[0].key} className={`of-name`}>
					{numOfSets.map(cardsOfSet =>
						cardsOfSet.map((card, cardInd) => {
							const setLogo = (
								<Icon
									name={card.set_name}
									className={card.rarity}
									loader={card.set}
									src={!sets.length ? null : sets.filter(s => s.name === card.set_name)[0].icon_svg_uri}
								/>
							)
							const controls = (
								<>
									<div className={`quantity ${view === "list" && cardInd !== 0 ? "hide" : ""}`}>
										<span
											className={`icon-plus ${cards.length >= legal ? "disabled" : ""}`}
											onClick={_ => addCard(card, board)}
										/>
										/<span className="icon-minus" onClick={_ => addCard(card, board, true)} />
									</div>
									<span
										onClick={_ => openModal({title: "Change Printing", content: <PrintSelector change card={card} />})}>
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
							return (
								<CardControls
									options={"Move"}
									inArea={inBoard}
									key={card.key}
									card={card}
									itemType={card.commander ? ItemTypes.COMMANDER : ItemTypes.CARD}
									imgSize="small"
									classes={`
										${cards.length > legal && cardInd >= legal && "illegal "} 
										${Q(card, focus.key, focus.val) && "highlighted"}
									`}
									cardHeadOnly={view === "list" && !card.commander}
									style={{
										position: cardInd > 0 && view === "grid" && "absolute",
										marginTop: cardInd > 0 && view === "grid" && cardInd - cardsOfSet.length - 10 + "rem",
										pointerEvents: cardInd !== cardsOfSet.length - 1 && view === "grid" && "none",
										marginBottom: cardsOfSet.length > 1 && !cardInd && view === "grid" && cardsOfSet.length + "rem",
									}}>
									{canEdit() ? controls : null}
								</CardControls>
							)
						})
					)}
				</div>
			)
		}

		return (
			<div className={`board ${board}-board`}>
				{inBoard.length || commanders.length ? (
					boardInner()
				) : (
					<Loading spinner={" "} anim="none" message={`No Cards in ${board}board`} />
				)}
			</div>
		)
	}
)
