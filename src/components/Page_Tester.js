//Dependencies
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

//Components
import Loading from './Loading'
import Zone from './Zone'
import TestControls from './TestControls'
import BasicSelect from './BasicSelect'

import CardControls from './CardControls'

// CONSTANTS
import {INIT_GAME_STATE} from '../constants/data_objects'
import {COLORS,SINGLETON} from '../constants/definitions'
import {MANA} from '../constants/greps'

// Functions
import {timestamp,sum} from '../functions/utility'
import {formatText} from '../functions/formattingLogic'
import * as g from '../functions/gameLogic'
import {Q, prepCardsForTest,normalizePos} from '../functions/cardFunctions'



export default class DeckTester extends React.Component {
  constructor(props) {
  	super(props)
    this.state = {
      game: {...INIT_GAME_STATE(this.props.deckInfo.format),deck:prepCardsForTest(this.props.deckInfo)},
      gameHistory: [],
      gameNumber: 0,
  	}

    this.startTest = this.startTest.bind(this)
    this.handleTurns = this.handleTurns.bind(this)
    this.gameState = this.gameState.bind(this)
    this.undoAction = this.undoAction.bind(this)

    this.cardClick = this.cardClick.bind(this)
    this.moveCard = this.moveCard.bind(this)
    this.cardState = this.cardState.bind(this)

    this.handleMana = this.handleMana.bind(this)
    this.spawnToken = this.spawnToken.bind(this)
    this.handleShuffle = this.handleShuffle.bind(this)
    this.gameFunction = this.gameFunction.bind(this)
  }

  componentDidMount() {this.startTest()}

  componentDidUpdate(prevProps,prevState) {
      if (prevState.gameNumber!==this.state.gameNumber) {
        this.handleTurns()
      }
  }
  
  render() {
    const zone = (name,settings) => {
      return <Zone zone={name} key={name}
        {...this.state.game}
        context={settings.context}
        header={settings.header}
        cardHeadOnly={settings.cardHeadOnly}
        moveCard={this.moveCard}
        handleMana={this.handleMana}
        cardState={this.cardState}
        gameState={this.gameState}
        cardClick={this.cardClick}
        openModal={this.props.openModal}
      />
    }

    if (!this.state.gameNumber)return <Loading message="Starting Playtest..."/>
    else return <div className="tester">
        <div className="side-col">                
          {!this.props.deckInfo.list.filter(c=>c.board==='Command').length?null:
          zone("Command",{context: 'single'})}
          {zone("Exile",{
              context: 'list',
              cardHeadOnly: true,
              header: true,
            })}
          {zone("Graveyard",{
              context: 'list',
              cardHeadOnly: true,
              header: true
            })}
          <BasicSelect 
          searchable
          placeholder='Create Token'
          options={this.props.tokens} 
          labelBy={'name'} valueBy={'id'} 
          callBack={this.spawnToken}
          />
          <div className="library-cont">
            {zone("Library",{
              context: 'single',
              header: true
            })}
            <div className="library-controls">
              <button className={'smaller-button'} onClick={_=>this.handleShuffle(false)}>Shuffle</button>
              <div className="lookBtn">
                <button className={'smaller-button warning-button'} onClick={_=>this.gameState('look',0)} style={{display:!this.state.game.look&&'none'}}>X</button>
                <button className={'smaller-button'} onClick={_=>this.gameState('look',1,true)}>Look Top {this.state.game.look}</button>
              </div>
            </div>
          </div>    
      </div>
        <TestControls {...this.state} {...this.props}
          cardData={this.props.cardData}
          newMsg={this.props.newMsg}
          gameState={this.gameState}
          undoAction={this.undoAction}
          moveCard={this.moveCard}
          startTest={this.startTest}
          cardState={this.cardState}
          handleTurns={this.handleTurns}
          handleMana={this.handleMana}
          gameFunction={this.gameFunction}
          handleShuffle={this.handleShuffle}
          spawnToken={this.spawnToken}
        />
        {zone("Battlefield",{context: 'grid'})}
        {zone("Hand",{
          context: 'list',
          faceDown:true,
        })}
    </div>   
  }
      // <div className="main-col">
      // </div>

  startTest() {
    this.setState({
      game: {...INIT_GAME_STATE(this.props.deckInfo.format),deck:prepCardsForTest(this.props.deckInfo,this.props.settings.sleeve)},
      gameNumber: this.state.gameNumber+1,
      gameHistory: []
    })
  }

  handleTurns() {
    if (!this.state.game.turn) {
      this.handleShuffle(true)
      setTimeout(()=>{
        let init = 7
        const drawTimer = setInterval(()=>{init--
          !init&&clearInterval(drawTimer)
          this.moveCard()
        },70)
      },150)     
      // KEEP OR MULL
      this.moveCard()
    }
    else {
      this.cardState(this.inZone('Battlefield'),'tapped',false)
      this.cardState(this.inZone('Battlefield'),'sickness',false)
      this.gameState('mana',COLORS().map(C=>0),false,'Go to main phase')   
      // UPKEEP EFFECTS
      this.moveCard()

    }
    this.gameState('turn',1,true,'Go to turn '+(this.state.game.turn+1))   
    // UPKEEP EFFECTS
  }



  gameState(prop,val,addTo,action) {
    val = addTo?this.state.game[prop]+val:val
    val = prop==='deck'?normalizePos(val):val
    const newState = {...this.state.game,[prop]:val}
    this.setState({
      game:newState,
      gameHistory: !action?this.state.gameHistory:
      [...this.state.gameHistory,{
        index:this.state.gameHistory.length,
        state:this.state.game,
        action:action,
        timestamp: timestamp()
      }]
    })
  }

  undoAction(ind) {
    const newState = this.state.gameHistory[ind]!==undefined
      ?this.state.gameHistory[ind]
      :(this.state.gameHistory.length-2)>=0
        ?this.state.gameHistory[this.state.gameHistory.length-2]
        :this.state.gameHistory[this.state.gameHistory.length-1]
    
    this.props.newMsg('Undid: "'+newState.action+'"','info')
    this.setState({
      game: newState.state,
      gameHistory: this.state.gameHistory.slice(0,ind)
    })
  }
  


  moveCard(card,dest,col,row,src) {
    let deck = [...this.state.game.deck]
    const toMove = card?card:card===null?null:this.inZone("Library")[0]
    const toDest = dest || "Hand"
    if(!toMove) {return console.error('cannot draw card')}
    const ind = deck.findIndex(c=>c.key===toMove.key)

    const movedMsg = toDest!==toMove.zone?g.cardMoveMsg(deck[ind],toDest,src):undefined
    if (this.state.game.look) this.gameState('look',-1,true)
    deck[ind] = {
      ...deck[ind],
      col: col>=0?col:this.inZone(dest,null,row).length,
      row: row>=0?row:0,
      stack: this.inZone(dest,col,row).length,
      order: src==='bottom'?0:this.inZone(dest).length,
      zone: toDest,
      faceDown: toDest=="Library"
    }

    console.log('MOVED',deck[ind],toDest)
    this.gameState('deck',deck,false,movedMsg)
  }

  cardClick(card,dblclick) {
    if ((card.zone==="Hand"||card.zone==="Command")&&!card.type_line.includes('Land')) 
      this.gameFunction('castSpell',card,this.props.settings.manaTolerance)

    else if (card.zone==="Battlefield"&&!dblclick) {
      this.cardState(card,'tapped',!card.tapped) 
      if (Q(card,...MANA.source)&&card.tapped) {
        const amt = Q(card,...MANA.twoC)?2:1
        const mana = COLORS('symbol').map(C=>card.oracle_text.includes("{"+C+"}")?amt:0)
        if (sum(mana)===amt) this.handleMana(mana)
      }
      return
    }
    return this.moveCard(...g.clickPlace(card,this.inZone('Battlefield'),null,dblclick))
  }


  spawnToken(token) {
    const deck = [...this.state.game.deck,...prepCardsForTest(token,this.props.settings.sleeve,true)]     
    this.gameState('deck',deck,false,'Created '+(token.power&&(token.power+'/'+token.toughness))+' '+token.name +' token')
  }


  cardState(cards,prop,val) {
    let deck = [...this.state.game.deck]
    cards = cards.constructor===Array?cards:[cards]
    let toHandle = deck.filter(c=>cards.map(id=>id.key).includes(c.key))||deck
    toHandle.map(h=>{h[prop] = val;return h})
    this.gameState('deck',deck)     
  }

  handleMana(mana,replace) {
    console.log('handleMana',mana)
    return mana?replace
    ?this.gameState('mana',mana)     
    :this.gameState('mana',this.state.game.mana.map((m,i)=>m+=mana[i]))     
    :this.gameState('mana',COLORS().map(_=>0))     
  }

  handleShuffle(first) {
    let shuffled = first ? this.state.game.deck.shuffle() : this.inZone('Library').shuffle()
    shuffled = shuffled.map((c,i)=>{c.order=i;return c}).concat(this.state.game.deck).unique('key')
    this.gameState('deck',shuffled,false,'Shuffled library')
  }


  inZone(zone,col,row) {
    let inZone = this.state.game.deck
    if(zone) {inZone=inZone.filter(c=>c.zone===zone)}
    if(col) {inZone=inZone.filter(c=>c.col===col)}
    if(row) {inZone=inZone.filter(c=>c.row===row)}
    return inZone
  }
  
  gameFunction(func,card,manaTolerance) {
    let result, msg
    if (func==='castSpell') {
      result = g.castSpell(card,this.state.game,manaTolerance)
      msg = formatText('Paid '+result.cost)
    }
    if (func==='attack') {
      result = g.attackAll(this.state)
      msg = "Swung out for "+result.total+" damage!"
    }
    if (func==='playLand') {
      result = g.playLand(this.state)
      if (result) {return this.cardClick(result)}
    }

    if (result) {
      this.cardState(result.tapped,'tapped',true)
      if (result.mana) this.handleMana(result.mana,true)
      if (result.total) {
        this.handleMana()
        this.gameState('eLife',-result.total,true,msg)
      }
      // this.props.newMsg(msg,'success')
    } 
  }
}


