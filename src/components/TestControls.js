import React from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import {COLORS} from '../constants/definitions'
import {Q} from '../functions/cardFunctions'
import CardSelect from './CardSelect'
import GameLog from './GameLog'
import CounterInput from './CounterInput'

function TestControls(props) {
  const {manaTolerance,gameLog,deck,turn,life,eLife,mana,gameFunction,gameState,handleTurns,undoAction,startTest,handleShuffle,moveCard,handleMana,cardState} = props

  return <div className="test-controls">
    <p>
      <span>Turn {turn}</span>
      <button className="smaller-button" onClick={_=>cardState(deck,'tapped',false)}>Untap</button>
      <button className="smaller-button" onClick={_=>gameFunction('playLand')}>Play Land</button>
      <button className="smaller-button" onClick={_=>gameFunction('attack')}>Attack All</button>
      <button className="smaller-button" onClick={_=>handleTurns()}>Next</button>
      <button className="smaller-button warning-button" onClick={startTest}>Restart</button>
    </p>  
    {!manaTolerance?null:<div className="mana-counters">
          {COLORS('symbol').map((C,ind)=><CounterInput key={`counter${C}`}
            value={mana[ind]} addOnClick={1+mana[ind]}
            icon={`ms ms-${C.toLowerCase()}`} 
            callBack={e=>handleMana(COLORS().map((c,i)=>i===ind?e-mana[ind]:0))}
            />)}
        </div>}
    <CounterInput value={life} neg addOnClick={life-1} icon='icon-heart' callBack={e=>gameState('life',e)}/>   
    <CounterInput value={eLife} neg addOnClick={eLife-1} icon='icon-heart-empty' callBack={e=>gameState('eLife',e)}/>   
    {!gameLog?null:<GameLog {...props} undoAction={undoAction}/>}
    </div>
}

const select = state => {
  return {
    ...state.playtest,
    gameLog: state.settings.gameLog,
    manaTolerance: state.settings.manaTolerance,
    list: state.deck.list,
    format: state.deck.format,
    legalCards: state.main.legalCards,
    customFields: state.filters.customFields,
  }
}

export default connect(select,actions)(TestControls)