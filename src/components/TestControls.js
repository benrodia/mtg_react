import React from 'react'
import Search from './Search'
import TesterShortcuts from './TesterShortcuts'

export default function TestControls(props) {
      return (
          <div className="testControls">
          <div className="left">      
            <p>
              <span>Turn {props.turn}</span>
              <button className="view-turns" onClick={()=>props.handleTurns(true)}>Last</button>
              <button className="next-turn" onClick={()=>props.handleTurns()}>Next</button>
            </p>     
            <p>
                <span>Your Life: {props.life}</span>
                <button onClick={()=>props.gameState('life',1,true)}>+</button>
                <button onClick={()=>props.gameState('life',-1,true)}>-</button>
            </p> 
            <p>
                <span>Opponent Life: {props.eLife}</span>
                <button onClick={()=>props.gameState('eLife',1,true)}>+</button>
                <button onClick={()=>props.gameState('eLife',-1,true)}>-</button>
            </p> 
                <p><button className="attack" onClick={()=>props.gameFunction('attack')}>Attack All</button></p>
          </div>
            <p>
              <button className="restart" onClick={props.startTest}>New Game</button>
            </p> 

          <TesterShortcuts
            handleTurns={props.handleTurns}
            startTest={props.startTest}
            moveCard={props.moveCard}
            gameState={props.gameState}
            gameFunction={props.gameFunction}
            handleShuffle={props.handleShuffle}
          />
          </div>

      )

}
