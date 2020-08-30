import React, {useState, useEffect, useRef} from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {CARD_SIZE} from "../constants/definitions"
import {ItemTypes} from "../constants/data"
import {Q} from "../functions/cardFunctions"
import {tutorableCards, clickPlace} from "../functions/gameLogic"

import DropSlot from "./DropSlot"

import ManaSource from "./ManaSource"
import Counters from "./Counters"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"

export default connect(({playtest: {deck, look, size, hideHand}}) => {
  return {deck, look, size, hideHand}
}, actions)(
  ({
    zone,
    deck,
    look,
    size,
    hideHand,
    context,
    cardHeadOnly,
    header,
    handleMana,
    handleShuffle,
    gameState,
    cardState,
    moveCard,
    cardClick,
    spawnToken,
    toggleHand,
  }) => {
    const zoneDiv = useRef()
    const [sizeFlag, setSizeFlag] = useState(false)
    const getSize = _ => {
      return {
        cols: Math.floor(zoneDiv.current.clientWidth / CARD_SIZE.w),
        rows: Math.floor(zoneDiv.current.clientHeight / CARD_SIZE.h),
      }
    }
    const shouldUpdateSize =
      context === "grid" &&
      !sizeFlag &&
      zoneDiv.current &&
      Math.floor(zoneDiv.current.clientWidth / CARD_SIZE.w) !== size.cols
    if (shouldUpdateSize) {
      gameState("size", getSize())
      setSizeFlag(true)
      setTimeout(_ => setSizeFlag(false), 1000)
    }

    const cards = deck.filter(c => c.zone === zone).orderBy("order")

    const slot = (col, row) => {
      const cardStack =
        context === "grid"
          ? cards.filter(c => col === c.col && row === c.row)
          : context === "list" || zone === "Command"
          ? cards
          : cards.splice(cards.length - (look || 1), look || 1).map(c => {
              return {...c, face_down: !look}
            })

      return (
        <DropSlot
          key={"slot" + col}
          zone={zone}
          col={col}
          row={row}
          accept={zone === "Command" ? ItemTypes.COMMANDER : [ItemTypes.CARD, ItemTypes.COMMANDER]}
          callBack={card => moveCard({card, dest: zone, col, row})}>
          {cardStack[0] && cardStack.map((c, i) => renderCard(c, i))}
        </DropSlot>
      )
    }

    const Zone = _ => {
      const inner = [...Array(context === "grid" ? 4 : 1)].map((und, row) => (
        <div key={"row" + row} className={`row row-${row}`}>
          {[...Array(context === "grid" ? size.cols : 1)].map((und, col) => slot(col, row))}
        </div>
      ))
      return (
        <div key={zone} className={`zone ${zone.toLowerCase()} ${context}`} ref={zoneDiv}>
          <div className="title bar even" style={{display: !header && "none"}}>
            {zone !== "Hand" ? null : (
              <h2 className={`clicky-icon icon-eye${hideHand ? "-off" : ""}`} onClick={_ => toggleHand(hideHand)} />
            )}
            <BasicSearch
              isHeader
              searchable
              options={cards}
              placeholder={`${zone} (${cards.length})`}
              callBack={c => moveCard({card: c, dest: "Hand"})}
            />
          </div>
          {context !== "grid" ? inner : <div className="inner">{inner}</div>}
        </div>
      )
    }

    const renderCard = (card, ind) => {
      const tutorable = tutorableCards(card, deck)
      return (
        <CardControls
          key={card.key}
          card={card}
          faceDown={zone === "Hand" && hideHand}
          cardHeadOnly={cardHeadOnly}
          itemType={card.commander ? ItemTypes.COMMANDER : ItemTypes.CARD}
          inArea={cards}
          style={{
            position: context !== "list" ? "absolute" : "default",
            top: (zone === "Library" ? -ind : ind) + "rem",
            left: (zone === "Library" ? ind * 3 : ind) + "rem",
            zIndex: ind,
          }}>
          {tutorable.from !== zone ? null : (
            <BasicSearch
              options={tutorable.cards}
              placeholder="Tutor"
              labelBy={"name"}
              callBack={c => {
                if (tutorable.sac) cardClick(card, true, "Graveyard")
                cardClick(c, false, tutorable.dest)
                handleShuffle()
              }}
            />
          )}
          {!(zone === "Library" && look) ? null : (
            <div>
              <button className="small-button" onClick={_ => moveCard({card, dest: "Library", bottom: true})}>
                Bottom
              </button>
              <button className="small-button" onClick={_ => moveCard({card, dest: "Graveyard"})}>
                Graveyard
              </button>
            </div>
          )}
          {zone !== "Battlefield" ? null : (
            <>
              <Counters card={card} />
              <ManaSource card={card} />
              {!Q(card, "type_line", "Token") ? null : <button onClick={_ => spawnToken(card)}>Clone</button>}
            </>
          )}
        </CardControls>
      )
    }

    return Zone()
  }
)