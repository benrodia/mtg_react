//Dependencies
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

//Components
import Loading from './Loading'
import Zone from './Zone'
import TestControls from './TestControls'
import CustomSelect from './CustomSelect'

// Functions
import '../functions/math'
import * as g from '../functions/gameLogic'
import {shuffle,qCard, prepCardsForTest,normalizePos} from '../functions/cardFunctions'



export default class DeckTester extends React.Component {
  constructor(props) {
  	super(props)
    this.state = {
      game: null,
      gameStarted: 0,
      look: 0,
  	}

    this.startTest = this.startTest.bind(this)
    this.handleTurns = this.handleTurns.bind(this)
    this.gameState = this.gameState.bind(this)

    this.cardClick = this.cardClick.bind(this)
    this.moveCard = this.moveCard.bind(this)
    this.cardState = this.cardState.bind(this)

    this.spawnToken = this.spawnToken.bind(this)
    this.handleShuffle = this.handleShuffle.bind(this)
    this.gameFunction = this.gameFunction.bind(this)
    this.lookX = this.lookX.bind(this)
    this.tutor = this.tutor.bind(this)
  }

  componentDidMount() {this.startTest()}

  componentDidUpdate(prevProps,prevState) {
      if (prevState.gameStarted!==this.state.gameStarted) {
        this.handleTurns()
      }
  }
  
  render() {
    if (!this.state.gameStarted){return <Loading message="Loading Playtest..."/>}
      return (
        <div className="tester">
        <TestControls
          {...this.state.game}
          newMsg={this.props.newMsg}
          gameState={this.gameState}
          moveCard={this.moveCard}
          startTest={this.startTest}
          cardState={this.cardState}
          handleTurns={this.handleTurns}
          gameFunction={this.gameFunction}
          handleShuffle={this.handleShuffle}
        />

          <div className="mainArea">
            <div className="sideRow">                
                <div className="libraryCont">
                  {this.zone("Library",{
                    context: 'single',
                    facedown:this.props.look===0,
                    header: true
                  })}
                  <div className="libraryControls">
                    <button onClick={this.handleShuffle}>Shuffle</button>
                    <div className="lookBtn">
                      <button onClick={()=>this.lookX(false)} style={{display:!this.state.look&&'none'}}>X</button>
                      <button onClick={()=>this.lookX(1)}>Look Top {this.state.look}</button>
                    </div>
                    <CustomSelect 
                    options={this.inZone("Library")} 
                    callBack={this.tutor}
                    />
                  </div>
                </div>
                {this.zone("Graveyard",{
                    context: 'list',
                    cardHeadOnly: true,
                    header: true
                  })}
                {this.zone("Exile",{
                    context: 'list',
                    cardHeadOnly: true,
                    header: true,
                  })}
                <CustomSelect 
                options={qCard(this.props.cardData,'type_line','Token')} 
                dest="Battlefield" 
                callBack={this.spawnToken}
                />

            </div>

            {this.zone("Battlefield",{
              context: 'grid' 
            })}
          </div>

          {this.zone("Hand",{
            context: 'list',
          })}

        </div>   
      )
  }



  zone(name,settings) {
    return <Zone zone={name} key={name}
      {...this.state.game}
      context={settings.context}
      header={settings.header}
      cardHeadOnly={settings.cardHeadOnly}
      moveCard={this.moveCard}
      cardState={this.cardState}
      cardClick={this.cardClick}
      openModal={this.props.openModal}
    />
  }

  gameState(prop,val,addTo) {
    val = addTo?this.state.game[prop]+val:val
    val = prop==='deck'?normalizePos(val):val
    this.setState({game:{
      ...this.state.game,
      [prop]:val
    }})
  }
  
  startTest() {
    console.log('startTest',this.props.deckInfo.list)
    this.setState({
      game:{
        deck: prepCardsForTest(this.props.deckInfo.list.filter(c=>c.board==='Main')) ||[],
        life: this.props.deckInfo.format=='commander'?40:20,
        eLife: this.props.deckInfo.format=='commander'?40:20,
        poison: 0,
        turn: 0,
        lastTurn: null,
      },
      gameStarted: this.state.gameStarted+1
    })
  }

  handleTurns(revert) {
    if (!revert) {
      this.gameState('lastTurn',this.state.game)
      if (!this.state.game.turn) {
        this.handleShuffle(true)
        setTimeout(()=>{
          let init = 7
          const drawTimer = setInterval(()=>{init--
            !init&&clearInterval(drawTimer)
            this.moveCard()
          },70)
        },150)      
      }
      else {
        this.moveCard()
        this.cardState(this.state.game.deck,'tapped',false)
      }
      this.gameState('turn',1,true)
    } 
    else if (this.state.game.lastTurn) {
      this.setState({game:this.state.game.lastTurn})
    }
  }



  moveCard(card,dest,col,row,src) {
    let deck = [...this.state.game.deck]
    const toMove = card?card.name?card:qCard(deck,'key',card.key)[0]:this.inZone("Library")[0]
    const toDest = dest || "Hand"
    if(!toMove) {return console.error('cannot draw card')}
    const ind = deck.findIndex(c=>c.key===toMove.key)

    if(toDest!==toMove.zone){
      this.props.newMsg(g.cardMoveMsg(deck[ind],toDest,src),'info')
    }

    deck[ind] = {
      ...deck[ind],
      col: col>=0?col:this.inZone(dest,null,row).length,
      row: row>=0?row:0,
      stack: this.inZone(dest,col,row).length,
      zone: toDest,
      faceDown: toDest=="Library"
    }

    console.log('MOVED',deck[ind],toDest,'col',col,'row',row,'stack',this.inZone(dest,col,row).length)
    return this.gameState('deck',deck)
  }


  cardClick(card) {
    let dest,col,row
    if (card.zone==="Battlefield") {return this.cardState(card,'tapped',!card.tapped)} // Tap if in play
    else if (card.zone==="Library") {dest = "Hand"}
    else if (card.zone==="Hand") {
      dest = "Battlefield" 
      if (card.type_line!=="Land"&&card.cmc) {this.gameFunction('castSpell',card)}
      if (qCard(card,'type_line',['Instant','Sorcery'])) {dest="Graveyard"}
      else if (qCard(card,'type_line','Creature')) {row = 1} 
      else if (qCard(card,'type_line','Land')) {
        row = 2
        let colors = card.color_identity.length
        if (qCard(card,'oracle_text',['add','mana','any color'],true)) {colors=4}
        col = 4-colors
      } 
      col = !col?this.inZone(dest).filter(c=>c.row===row).length % 8:col
    }

    if(dest){this.moveCard(card,dest,col,row,null,'click')}
  }

  spawnToken(token) {
    const deck = [
        ...this.state.game.deck,
        ...prepCardsForTest([token],true)
      ]     
    this.gameState('deck',deck)
  }




  cardState(cards,prop,val) {
    let deck = [...this.state.game.deck]
    cards = cards.constructor===Array?cards:[cards]
    let toHandle = deck.filter(c=>cards.map(id=>id.key).includes(c.key))||deck
    toHandle.map(h=>{h[prop] = val;return h})
    this.gameState('deck',deck)     
  }

  handleShuffle(first) {
    let shuffled = []
    console.log('handleShuffle',this.state.game.deck)
    if (first) shuffled = shuffle(this.state.game.deck)
      .map((c,i)=>{c.stack=i;return c})
    else shuffled = shuffle(this.inZone('Library'))
      // .map((c,i)=>{c.stack=i;return c})
      .concat(this.state.game.deck)
      .unique('key')

    console.log('handled Shuffle',shuffled)

    this.gameState('deck',shuffled)
    this.props.newMsg('Shuffled Library','info')
  }
  //   handleShuffle(first) {
  //   let shuffled = []
  //   if (first) shuffled = shuffle(this.props.game.deck).map((c,i)=>{c.stack=i;return c})
  //   else shuffled = shuffle(this.inZone('Library'))
  //     .map((c,i)=>{c.stack=i;return c})
  //     .concat(this.props.game.deck)
  //     .unique('key')

  //   this.gameState('deck',shuffled)
  //   this.props.newMsg('Shuffled Library','info')
  // }


  lookX(incr) {
    const amt = incr?(this.state.look+incr):0
    this.setState({look:amt})
  }
  inZone(zone,col,row) {
    let inZone = this.state.game.deck
    if(zone) {inZone=inZone.filter(c=>c.zone===zone)}
    if(col) {inZone=inZone.filter(c=>c.col===col)}
    if(row) {inZone=inZone.filter(c=>c.row===row)}
    return inZone
  }
  
  tutor(card,dest) {
    this.moveCard(card,dest)
    this.props.newMsg('Tutored '+card.name,'info')
    this.handleShuffle()
  }

  gameFunction(func,card) {
    let result, msg
    if (func==='castSpell') {
      result = g.castSpell(card,this.state.game.deck)
      msg = 'Paid '+result.spent
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
      this.gameState('deck',result.deck)
      if (result.total) {this.gameState('eLife',-result.total)}
      this.props.newMsg(msg.success,'success')
    } 
  }
}


