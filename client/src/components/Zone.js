import React, {useState, useEffect, useRef} from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {CARD_SIZE, ZONES} from "../constants/definitions"
import {ItemTypes} from "../constants/data"
import {Q, normalizePos} from "../functions/cardFunctions"
import {cardMoveMsg} from "../functions/text"
import {tutorableCards, clickPlace} from "../functions/gameLogic"

import DropSlot from "./DropSlot"

import ManaSource from "./ManaSource"
import Counters from "./Counters"
import BasicSearch from "./BasicSearch"
import CardControls from "./CardControls"
import ContextMenu from "./ContextMenu"
import utilities from "../utilities"

const {formatText, formatManaSymbols, snip} = utilities

export default connect(
  ({
    main: {
      pos: [x, y, w, h],
    },
    playtest: {players, first_seat, second_seat, cols, hideHand},
  }) => {
    return {w, players, first_seat, second_seat, cols, hideHand}
  },
  actions
)(
  ({
    P2,
    zone,
    w,
    players,
    first_seat,
    second_seat,

    cols,
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
    const bottom = useRef(0)
    useEffect(
      _ => {
        const size = Math.floor(w / CARD_SIZE.w)
        if (size !== cols) gameState("cols", size)
      },
      [w]
    )

    useEffect(
      _ => {
        bottom.current && bottom.current.scrollIntoView()
      },
      [bottom]
    )
    const p = P2 ? second_seat : first_seat
    const {deck, look} = players[p] || {}
    const cards = (deck || []).filter(c => c.zone === zone).orderBy("order")

    const slot = (col, row) => {
      const cardStack =
        context === "grid"
          ? cards.filter(c => col === c.col && row === c.row)
          : context === "list" || zone === "Command"
          ? cards
          : cards.slice(-(look || 1)).map(c => {
              return {...c, face_down: zone === "Library" && !look}
            })

      const renderCard = (card, ind) => {
        const tutorable = tutorableCards(card, deck)
        const moveZones = ZONES.filter(
          z => z !== zone && (deck.find(c => c.commander) || z !== "Command")
        ).map(z => {
          return {
            label: cardMoveMsg(card, z, true),
            callBack: _ => moveCard({card, dest: z}),
          }
        })
        const activated = card.scripts
          .filter(scr => scr.type === "activate")
          .map(act => {
            return {
              label: formatManaSymbols(snip(act.text, 25)),
              // callBack: _ => ,
            }
          })
        return (
          <CardControls
            key={card.key}
            card={card}
            context={"playtest"}
            noHover={zone === "Hand"}
            faceDown={
              zone === "Hand" &&
              (hideHand || (card.owner !== first_seat && !card.revealed))
            }
            cardHeadOnly={cardHeadOnly}
            contextMenu={[...activated, ...moveZones]}
            itemType={card.commander ? ItemTypes.COMMANDER : ItemTypes.CARD}
            style={{
              position: context !== "list" ? "absolute" : "default",
              top: (zone === "Library" ? -ind : ind) + "rem",
              left: (zone === "Library" ? ind * 3 : ind) + "rem",
              zIndex: ind,
            }}
          />
        )
      }

      return (
        <DropSlot
          key={"slot" + col}
          zone={zone}
          col={col}
          row={row}
          accept={
            zone === "Command"
              ? ItemTypes.COMMANDER
              : [ItemTypes.CARD, ItemTypes.COMMANDER]
          }
          callBack={card => moveCard({card, dest: zone, col, row})}
          className={""}>
          {cardStack[0] && cardStack.map((c, i) => renderCard(c, i))}
        </DropSlot>
      )
    }

    const inner = [...Array(context === "grid" ? 2 : 1)].map((und, row) => (
      <div key={"row" + row} className={`row row-${row}`}>
        {[...Array(context === "grid" ? cols || 1 : 1)].map((und, col) =>
          slot(col, row)
        )}
      </div>
    ))

    const LibCont = z => (
      <div className="library-controls bar">
        <button
          className={"smaller-button"}
          onClick={_ => handleShuffle(false)}>
          Shuffle
        </button>
        <div className="lookBtn">
          <button
            className={"smaller-button warning-button"}
            onClick={_ => gameState("look", 0, null, p)}
            style={{display: look || "none"}}>
            X
          </button>
          <button
            className={"smaller-button"}
            onClick={_ => gameState("look", 1, true, p)}>
            Top {look ? look : ""}
          </button>
        </div>
      </div>
    )

    return (
      <div key={zone} className={`zone ${zone.toLowerCase()} ${context}`}>
        <div className="title bar even">
          {zone !== "Hand" || P2 ? null : (
            <h2
              className={`clicky-icon icon-eye${hideHand ? "-off" : ""}`}
              onClick={_ => toggleHand(hideHand)}
            />
          )}
          {zone === "Battlefield" ? null : (
            <BasicSearch
              searchable
              preview
              options={cards}
              placeholder={`${zone} (${cards.length})`}
              callBack={c => moveCard({card: c, dest: "Hand"})}
            />
          )}
        </div>
        {zone === "Library" ? <LibCont /> : null}
        {context !== "grid" ? (
          inner
        ) : (
          <div className="inner">
            <div ref={bottom} />
            {inner}
          </div>
        )}
      </div>
    )
  }
)

// {tutorable.from !== zone ? null : (
//   <BasicSearch
//     options={tutorable.cards}
//     placeholder="Tutor"
//     callBack={c => {
//       if (tutorable.sac) cardClick(card, true, "Graveyard")
//       cardClick(c, false, tutorable.dest)
//       handleShuffle()
//     }}
//   />
// )}

// {!(zone === "Library" && look) ? null : (
//   <div>
//     <button
//       className="small-button"
//       onClick={_ =>
//         moveCard({card, dest: "Library", bottom: true})
//       }>
//       Bottom
//     </button>
//     <button
//       className="small-button"
//       onClick={_ => moveCard({card, dest: "Graveyard"})}>
//       Graveyard
//     </button>
//   </div>
// )}
// {zone !== "Battlefield" ? null : (
//   <>
//     <Counters card={card} />
//     <ManaSource card={card} />
//     {!Q(card, "type_line", "Token") ? null : (
//       <button onClick={_ => spawnToken(card)}>Clone</button>
//     )}
//   </>
// )}
