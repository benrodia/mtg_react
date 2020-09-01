import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {COLORS} from "../constants/definitions"
import GameLog from "./GameLog"
import CounterInput from "./CounterInput"

export default connect(({playtest, settings: {gameLog}}) => {
  return {...playtest, gameLog}
}, actions)(
  ({
    gameLog,
    deck,
    turn,
    life,
    eLife,
    mana,
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
    return (
      <div className="test-controls">
        <div className="mini-spaced-bar bar even">
          <p className="thin-block turn">
            Turn {turn}: {phase}{" "}
          </p>
          <button className="smaller-button" onClick={handleTurns}>
            Pass
          </button>
          <button className="smaller-button warning-button" onClick={startTest}>
            Restart
          </button>
          {!gameLog ? null : <GameLog />}
        </div>
        <div className="bar">
          <CounterInput value={life} neg addOnClick={life - 1} icon="icon-heart" callBack={e => gameState("life", e)} />
          <CounterInput
            value={eLife}
            neg
            addOnClick={eLife - 1}
            icon="icon-heart-empty"
            callBack={e => gameState("eLife", e)}
          />
          <div className="mana-counters">
            {COLORS("symbol").map((C, ind) => (
              <CounterInput
                key={`counter${C}`}
                value={mana[ind]}
                addOnClick={1 + mana[ind]}
                icon={`ms ms-${C.toLowerCase()}`}
                callBack={e => handleMana(COLORS().map((c, i) => (i === ind ? e - mana[ind] : 0)))}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
)

// <button className="smaller-button" onClick={_ => cardState(deck, "tapped", false)}>
//   Untap
// </button>
// <button className="smaller-button" onClick={handleCombat}>
//   Attack All
// </button>
