import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {COLORS} from "../constants/definitions"
import GameLog from "./GameLog"
import CounterInput from "./CounterInput"
import BasicSearch from "./BasicSearch"

export default connect(({playtest, settings: {game_log}}) => {
  return {...playtest, game_log}
}, actions)(
  ({
    game_log,
    players,
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
    const {deck, look, life, mana} = players[active] || {}

    return (
      <div className="test-counters flex-row">
        <CounterInput
          value={life}
          neg
          addOnClick={life - 1}
          icon="icon-heart"
          callBack={e => gameState("life", e)}
        />
        <div className="mana-counters flex-row">
          {COLORS("symbol").map((C, ind) => (
            <CounterInput
              key={`counter${C}`}
              value={mana ? mana[ind] : 0}
              addOnClick={1 + (mana ? mana[ind] : 0)}
              icon={`ms ms-${C.toLowerCase()}`}
              callBack={e =>
                handleMana(
                  COLORS().map((c, i) =>
                    i === ind ? e - (mana ? mana[ind] : 0) : 0
                  )
                )
              }
            />
          ))}
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
// <CounterInput
//   value={eLife}
//   neg
//   addOnClick={eLife - 1}
//   icon="icon-heart-empty"
//   callBack={e => gameState("eLife", e)}
// />

// <button className="smaller-button" onClick={_ => cardState(deck, "tapped", false)}>
//   Untap
// </button>
// <button className="smaller-button" onClick={handleCombat}>
//   Attack All
// </button>
