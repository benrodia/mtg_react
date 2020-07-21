//Dependencies
import React,{useState,useEffect} from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

//Components
import Loading from './Loading'
import Zone from './Zone'
import TestControls from './TestControls'
import CardSelect from './CardSelect'

import CardControls from './CardControls'

// CONSTANTS
import {COLORS,SINGLETON} from '../constants/definitions'

// Functions
import '../functions/utility'
import {timestamp} from '../functions/utility'
import * as g from '../functions/gameLogic'
import {Q, prepCardsForTest,normalizePos} from '../functions/cardFunctions'


let started
export default function DeckTester(props) {

  const initGameState = {
    deck: prepCardsForTest(props.deckInfo),
    life: SINGLETON(props.deckInfo.format)?40:20,
    eLife: SINGLETON(props.deckInfo.format)?40:20,
    poison: 0,
    energy: 0,
    turn: 0,
    mana: COLORS().map(C=>0),
    phase: 'untap'
  }

  const [state,setstate] = useState({
      game: initGameState,
      gameHistory: [],
      gameNumber: 1,
  })

  const startTest = () => {
    setstate({
      game:initGameState,
      gameHistory: [],
      gameNumber: state.gameNumber+1,
    })
    handleTurns(true)
  }

  useEffect(()=>{
    if (!started){
      startTest()
      started = true
    }
  })


  const gameState = (key,val,addTo,action) => {
    val = addTo?state.game[key]+val:val
    val = key==='deck'?normalizePos(val):val
    const newState = {...state.game,[key]:val}
    setstate({...state,
      game:newState,
      gameHistory: !action?state.gameHistory:
      [...state.gameHistory,{
        index:state.gameHistory.length,
        state:state.game,
        action:action,
        timestamp: timestamp()
      }]
    })
  }

  const undoAction = ind => {
    const newState = state.gameHistory[ind]!==undefined
      ?state.gameHistory[ind]
      :(state.gameHistory.length-2)>=0
        ?state.gameHistory[state.gameHistory.length-2]
        :state.gameHistory[state.gameHistory.length-1]
    props.newMsg('Undid: "'+newState.action+'"','info')
    setstate({...state,
      game: newState.state,
      gameHistory: state.gameHistory.slice(0,ind)
    })
  }
  const handleShuffle = first => {
    let shuffled = []
    if (first) shuffled = state.game.deck.shuffle()
      .map((c,i)=>{c.order=i;return c})
    console.log('handled Shuffle',shuffled)
    gameState('deck',shuffled,false,'Shuffled library')
  }
  const inZone = (zone,col,row) => {
    let inZone = state.game.deck
    if(zone) {inZone=inZone.filter(c=>c.zone===zone)}
    if(col) {inZone=inZone.filter(c=>c.col===col)}
    if(row) {inZone=inZone.filter(c=>c.row===row)}
    return inZone
  }

  const moveCard = (card,dest,col,row,src) => {
    let deck = [...state.game.deck]
    const toMove = card?card.name?card:Q(deck,'key',card.key)[0]:inZone("Library")[0]
    const toDest = dest || "Hand"
    if(!toMove) {return console.error('cannot draw card')}
    const ind = deck.findIndex(c=>c.key===toMove.key)
    
    const movedMsg = toDest!==toMove.zone
        ?g.cardMoveMsg(deck[ind],toDest,src)
        :undefined

    deck[ind] = {
      ...deck[ind],
      col: col>=0?col:inZone(dest,null,row).length,
      row: row>=0?row:0,
      stack: inZone(dest,col,row).length,
      order: inZone(dest).length,
      zone: toDest,
      faceDown: toDest=="Library"
    }
    console.log('MOVED',deck[ind].key,toDest,'order',deck[ind].order)
    return gameState('deck',deck,false,movedMsg)
  }

  const cardState = (cards,prop,val) => {
    let deck = [...state.game.deck]
    cards = cards.constructor===Array?cards:[cards]
    let toHandle = deck.filter(c=>cards.map(id=>id.key).includes(c.key))||deck
    toHandle.map(h=>{h[prop] = val;return h})
    gameState('deck',deck)     
  }



  const handleTurns = first => {
    if (!state.game.turn) {
      handleShuffle(true)
      setTimeout(()=>{
        let init = 7
        const drawTimer = setInterval(()=>{init--
          !init&&clearInterval(drawTimer)
          moveCard()
        },70)
      },150)     
      // KEEP OR MULL
      moveCard()
    }
    else {
      cardState(state.game.deck,'tapped',false)
      gameState('mana',COLORS().map(C=>0),false,'Go to main phase')   
      // UPKEEP EFFECTS
      moveCard()
    }
      gameState('turn',1,true,'Go to turn '+(state.game.turn+1))   
  }



  const cardClick = card => {
    if (card.zone==="Battlefield") {return cardState(card,'tapped',!card.tapped)} 
    moveCard(...g.clickPlace(card,state.game.deck))
  }

  const spawnToken = token => {
    const deck = [
        ...state.game.deck,
        ...prepCardsForTest([token],true)
      ]     
    gameState('deck',deck,true,
      `Created ${token.power?token.power+'/'+token.toughness:''} ${token.name} token`
    )
  }


  const handleMana = mana => {
    console.log('handleMana',mana)
    gameState({game:{...state.game,
        mana:mana
        ?state.game.mana.map((m,i)=>m+=mana[i])
        :COLORS().map(C=>0)
    }})     
  }

    
  const zone = (name,settings) => {
    return <Zone zone={name} key={name}
      {...state.game}
      context={settings.context}
      header={settings.header}
      cardHeadOnly={settings.cardHeadOnly}
      moveCard={moveCard}
      handleMana={handleMana}
      cardState={cardState}
      cardClick={cardClick}
      openModal={props.openModal}
    />
  }

  if (!state.gameNumber)return <Loading message="Starting Playtest..."/>

  else return <div className="tester">
    <TestControls {...state}
      cardData={props.cardData}
      newMsg={props.newMsg}
      gameState={gameState}
      undoAction={undoAction}
      moveCard={moveCard}
      startTest={startTest}
      cardState={cardState}
      handleTurns={handleTurns}
      handleShuffle={handleShuffle}
      spawnToken={spawnToken}
    />

      <div className="main-area">
        <div className="side-row">                
            <div className="library-cont">
              {zone("Library",{
                context: 'single',
                facedown:props.look===0,
                header: true
              })}
              <div className="library-controls">
                <button className={'smaller-button'} onClick={handleShuffle}>Shuffle</button>
                <div className="lookBtn">
                </div>
                <CardSelect 
                options={inZone("Library")} 
                onChange={c=>moveCard(c,'Hand')}
                />
              </div>
            </div>
            {zone("Graveyard",{
                context: 'list',
                cardHeadOnly: true,
                header: true
              })}
            {zone("Exile",{
                context: 'list',
                cardHeadOnly: true,
                header: true,
              })}
            {props.deckInfo.list.filter(c=>c.board==='Command').length
            &&zone("Command",{context: 'single'})}
        </div>
        {zone("Battlefield",{context: 'grid'})}
      </div>

      {zone("Hand",{context: 'list',})}
    </div>   
}


            // <CardSelect 
            // options={Q(props.cardData,'type_line','Token')} 
            // dest="Battlefield" 
            // callBack={props.spawnToken}
            // />
