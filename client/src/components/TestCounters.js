import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {COLORS} from "../constants/definitions"
import GameLog from "./GameLog"
import CounterInput from "./CounterInput"
import BasicSearch from "./BasicSearch"

import utilities from "../utilities"

const {sum} = utilities

export default connect(({playtest, settings: {game_log}}) => {
  return {...playtest, game_log}
}, actions)(
  ({
    P2,
    game_log,
    players,
    first_seat,
    second_seat,
    active,
    turn,
    phase,
    handleCost,
    handleCombat,
    landDrop,
    gameState,
    handleTurns,
    undoAction,
    startTest,
    handleShuffle,
    moveCard,
    handleMana,
    cardState,
  }) => {
    const p = P2 ? second_seat : first_seat
    const {deck, look, life, mana} = players[p] || {}

    return (
      <div className="test-counters flex-row">
        <CounterInput
          value={life}
          neg
          addOnClick={life - 1}
          icon={`icon-heart${P2 ? "-empty" : ""}`}
          callBack={e => gameState("life", e, null, p)}
        />
        <div className="mana-counters flex-row even">
          {COLORS("symbol").map((C, ind) => (
            <CounterInput
              key={`counter${C}`}
              value={mana ? mana[ind] : 0}
              addOnClick={1 + (mana ? mana[ind] : 0)}
              icon={`ms ms-${C.toLowerCase()}`}
              callBack={e => {
                console.log("mana", p)
                handleMana(
                  COLORS().map((c, i) =>
                    i === ind ? e - (mana ? mana[ind] : 0) : 0
                  ),
                  null,
                  p
                )
              }}
            />
          ))}
          <button
            className={`smaller-button inverse-button icon-cancel ${
              sum(mana) || "disabled"
            }`}
            onClick={_ => handleMana()}
          />
        </div>
        <div className="library-controls bar">
          <button
            className={"smaller-button"}
            onClick={_ => handleShuffle(false)}>
            Shuffle
          </button>
          <div className="lookBtn">
            <button
              className={"smaller-button warning-button"}
              onClick={_ => gameState("look", 0)}
              style={{display: look || "none"}}>
              X
            </button>
            <button
              className={"smaller-button"}
              onClick={_ => gameState("look", 1, true)}>
              Top {look ? look : ""}
            </button>
          </div>
        </div>
      </div>
    )
  }
)
// <BasicSearch
//   searchable
//   placeholder="Create Token"
//   options={tokens}
//   labelBy={t => TOKEN_NAME(t)}
//   valueBy={"id"}
//   callBack={spawnToken}
// />

// <button className="smaller-button" onClick={_ => cardState(deck, "tapped", false)}>
//   Untap
// </button>
// <button className="smaller-button" onClick={handleCombat}>
//   Attack All
// </button>
