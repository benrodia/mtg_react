import React from 'react'
import {COLORS} from '../constants/definitions'
import {Q} from '../functions/cardFunctions'
import TesterShortcuts from './TesterShortcuts'
import CardSelect from './CardSelect'
import GameLog from './GameLog'
import CounterInput from './CounterInput'

export default function TestControls(props) {
  const {settings,game,gameFunction,gameState,handleTurns,undoAction,startTest,handleShuffle,moveCard,handleMana,cardState} = props

  return <div className="test-controls">
    <p>
      <span>Turn {game.turn}</span>
      <button className="smaller-button" onClick={_=>cardState(game.deck,'tapped',false)}>Untap</button>
      <button className="smaller-button" onClick={_=>gameFunction('playLand')}>Play Land</button>
      <button className="smaller-button" onClick={_=>gameFunction('attack')}>Attack All</button>
      <button className="smaller-button" onClick={_=>handleTurns(true)}>Next</button>
      <button className="smaller-button warning-button" onClick={startTest}>Restart</button>

    </p>  
    {!settings.manaTolerance?null:<div className="mana-counters">
          {COLORS('symbol').map((C,ind)=><CounterInput key={`counter${C}`}
            value={game.mana[ind]} addOnClick={1+game.mana[ind]}
            icon={`ms ms-${C.toLowerCase()}`} 
            callBack={e=>handleMana(COLORS().map((c,i)=>i===ind?e-game.mana[ind]:0))}
            />)}
        </div>}
    <CounterInput value={game.life} neg addOnClick={game.life-1} icon='icon-heart' callBack={e=>gameState('life',e)}/>   
    <CounterInput value={game.eLife} neg addOnClick={game.eLife-1} icon='icon-heart-empty' callBack={e=>gameState('eLife',e)}/>   
    {!settings.gameLog?null:<GameLog {...props} undoAction={undoAction}/>}
    <TesterShortcuts
      {...game}
      handleTurns={handleTurns}
      startTest={startTest}
      moveCard={moveCard}
      cardState={cardState}
      gameState={gameState}
      undoAction={undoAction}
      gameFunction={gameFunction}
      handleShuffle={handleShuffle}
    />
    </div>
}
