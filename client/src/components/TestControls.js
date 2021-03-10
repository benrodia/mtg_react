import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import {COLORS} from "../constants/definitions"
import GameLog from "./GameLog"
import CounterInput from "./CounterInput"

export default connect(({playtest, settings: {game_log}}) => {
  return {...playtest, game_log}
}, actions)(
  ({
    game_log,
    deck,
    turn,
    life,
    eLife,
    mana,
    active,
    phase,
    handleCost,
    handleCombat,
    goToPhase,
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
        <div className="mini-spaced-bar bar">
          <p className="thin-block turn">
            T{turn} | P{active + 1} | {phase}
          </p>
          <button className="smaller-button" onClick={_ => goToPhase()}>
            Pass Phase
          </button>
          <button className="smaller-button" onClick={_ => handleTurns()}>
            Pass Turn
          </button>
          <button
            className="smaller-button warning-button"
            onClick={_ => startTest()}>
            Restart
          </button>
          {!game_log ? null : <GameLog />}
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
// <div className="bar">
//   <CounterInput value={life} neg addOnClick={life - 1} icon="icon-heart" callBack={e => gameState("life", e)} />
//   <CounterInput
//     value={eLife}
//     neg
//     addOnClick={eLife - 1}
//     icon="icon-heart-empty"
//     callBack={e => gameState("eLife", e)}
//   />
//   <div className="mana-counters">
//     {COLORS("symbol").map((C, ind) => (
//       <CounterInput
//         key={`counter${C}`}
//         value={mana[ind]}
//         addOnClick={1 + mana[ind]}
//         icon={`ms ms-${C.toLowerCase()}`}
//         callBack={e => handleMana(COLORS().map((c, i) => (i === ind ? e - mana[ind] : 0)))}
//       />
//     ))}
//   </div>
// </div>
