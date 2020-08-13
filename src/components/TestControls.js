import React from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import {COLORS} from '../constants/definitions'
import {Q} from '../functions/cardFunctions'
import GameLog from './GameLog'
import CounterInput from './CounterInput'

function TestControls({
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
  cardState
}) {

  return <div className="test-controls">
    <p>
      <span>Turn {turn}: {phase} </span>
      <button className="smaller-button" onClick={_=>cardState(deck,'tapped',false)}>Untap</button>
      <button className="smaller-button" onClick={handleCombat}>Attack All</button>
      <button className="smaller-button" onClick={handleTurns}>Next</button>
      <button className="smaller-button warning-button" onClick={startTest}>Restart</button>
    </p>  
    <div className="mana-counters">
      {COLORS('symbol').map((C,ind)=><CounterInput key={`counter${C}`}
        value={mana[ind]} addOnClick={1+mana[ind]}
        icon={`ms ms-${C.toLowerCase()}`} 
        callBack={e=>handleMana(COLORS().map((c,i)=>i===ind?e-mana[ind]:0))}
        />)}
    </div>
    <CounterInput value={life} neg addOnClick={life-1} icon='icon-heart' callBack={e=>gameState('life',e)}/>   
    <CounterInput value={eLife} neg addOnClick={eLife-1} icon='icon-heart-empty' callBack={e=>gameState('eLife',e)}/>   
    {!gameLog?null:<GameLog/>}
    </div>
}

const select = state => {
  return {
    ...state.playtest,
    gameLog: state.settings.gameLog,
  }
}

export default connect(select,actions)(TestControls)