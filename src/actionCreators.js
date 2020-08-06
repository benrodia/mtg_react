import {v4 as uuidv4} from  'uuid'

// Constants
import store from './store'
import * as A from './constants/actionNames'

import {HOME_DIR,COLORS,SINGLETON,TOKEN_NAME} from './constants/definitions'
import {MANA,ETB,IS_SPELL} from './constants/greps'
import {CARD_SLEEVES,PLAYMATS} from './constants/data_objects'

import {
  INIT_PLAYTEST_STATE,
} from './constants/initialState'

//Functions
import {formatText} from './functions/formattingLogic'
import {Q,isLegal,audit} from './functions/cardFunctions'
import {
  attackAll,
  playLand,
  castSpell,
  clickPlace,
  getColorIdentity,
  chooseCommander,
  legalCommanders,
} from './functions/gameLogic'

import {cache,sum} from './functions/utility'

export const loadAppData = _ => dispatch => {
  dispatch(getCardData("https://api.scryfall.com/bulk-data/unique_artwork"))
  dispatch(getSetData("https://api.scryfall.com/sets"))
}

export const getCardData = uri => dispatch => {
  fetch(uri)
  .then(res=>res.json()).then(latest=>
    fetch(latest.download_uri)
    .then(data=>data.json()).then(data=>dispatch({type: A.MAIN,key:'cardData',val: data})))
    .catch(err=>console.log(err))
}
export const getSetData = uri => dispatch => {
  fetch(uri)
  .then(res=>res.json())
  .then(latest=>dispatch({type: A.MAIN,key:'sets',val: latest.data}))
  .catch(err=>console.log(err))
}

export const getLegalCards = (cards,format) => dispatch => {
  const legal = cards.filter(c=>isLegal(c,format,null)>0)
  dispatch(newMsg(`${legal.length } cards legal in ${format}.`,'success'))
  dispatch({type:A.MAIN,key:'legalCards', val:legal})
}

export const getTokens = cards => dispatch => dispatch({type: A.MAIN,key:'tokens',val:cards.filter(c=>Q(c,'type_line','Token'))})

export const openModal = modal => dispatch => dispatch({type: A.MAIN,key:'modal',val: modal})

export const newMsg = (message,type) => dispatch => dispatch({type: A.NEW_MSG,val:{key: uuidv4(),message,type}})


export const cacheState = (obj,key,val) => dispatch => {
  let update = {...store.getState()[obj]}
  if (key==='format' && val!== update.format) {
    dispatch(getLegalCards(store.getState().main.cardData,val)) 
    if (!SINGLETON(val)) update.list = update.list.filter(c=>c.board!=='Command')
  }
  else if (key==='list') {
    update.colors = getColorIdentity(Q(val,'board','Main'),'colors')
    update.color_identity = getColorIdentity(Q(val,'board','Command'),'color_identity')     
    val = val.orderBy('name')
  }
  update[key] = val
  cache(obj,update)
  const actionName = 
  obj==='deck'?A.DECK:
  obj==='filters'?A.FILTERS:
  obj==='settings'?A.SETTINGS:null

  dispatch({type: actionName,val: update})
}


export const addCard = (cards,board,remove) => dispatch => {
  const state = {...store.getState()}
  if (cards.constructor !== Array) cards = [cards]
  const newCard = card => {
    if(audit(card)) return {
      ...card,
      customField: card.customField || null,
      board: board||'Main',
      key: legalCommanders(state.deck.format,state.main.legalCards).filter(com=>com.name===card.name)[0]
        ? "CommanderID__"+uuidv4()
        : "CardID__"+uuidv4()
    }
    else return null
  }
  const list = remove
    ? state.deck.list.filter(l=>cards.filter(card=>l.key!==card.key).length) 
    : [
      ...state.deck.list,
      ...cards.map(card=>newCard(card)).filter(c=>!!c)
    ] 
  dispatch(cacheState('deck','list',list))
}

// PLAYTESTER

export const gameState = (key,val,bool) => dispatch => dispatch({type:A.PLAYTEST,key,val,bool})  
export const cardState = (card,key,val) => dispatch => dispatch({type:A.CARD,cards:card.contructor===Array?card:[card],key,val})  
export const untap = _ => dispatch => dispatch({type:A.UNTAP})  
export const handleShuffle = bool => dispatch => dispatch({type:A.SHUFFLE,bool})
export const spawnToken = token => dispatch => dispatch({type:A.TOKEN,token})
export const handleMana = (mana,bool) => dispatch => dispatch({type:A.MANA,key:mana,val:mana,bool})


export const startTest = _ => dispatch => {
  const {list,format} = store.getState().deck
  dispatch({type:A.INIT_GAME,list,format})
  setTimeout(_=>dispatch(handleTurns(true)),100)
}

export const moveCard = payload => dispatch => {
  let move = payload || {}
  if (IS_SPELL(move.card)) dispatch(gameFunction('castSpell',move.card))
  if (move.dest==='Battlefield'&&move.card&&move.dest!==move.card.zone) 
    move = {...move,card: dispatch(handleAbility("ETB",move.card))}

  dispatch({type:A.BOARD,val:move})
}

export const cardClick = (card,dblclick,toDest) => dispatch => {
  if (card.zone==="Battlefield"&&!dblclick) {
    dispatch(cardState(card,'tapped',!card.tapped))
    if (Q(card,...MANA.source)&&card.tapped) {
      const amt = Q(card,...MANA.twoC)?2:1
      const mana = COLORS('symbol').map(C=>card.oracle_text.includes("{"+C+"}")?amt:0)
      if (sum(mana)===amt) dispatch(handleMana(mana))
    }
    return
  }
  const inPlay = store.getState().playtest.deck.filter(c=>c.zone==='Battlefield')
  dispatch(moveCard(clickPlace(card,inPlay,toDest,dblclick)))
}

export const handleTurns = first => dispatch => {
  dispatch({type:A.NEW_TURN})

  if (first) {
    dispatch(handleShuffle(true))
    setTimeout(_=>{
      let init = 7
      const drawTimer = setInterval(()=>{init--
        !init&&clearInterval(drawTimer)
        dispatch(moveCard())
      },70)
    },150)     
  }
  else dispatch(moveCard()) 
}


export const gameFunction = (func,card) => dispatch => {
  const {playtest,settings} = store.getState()
  let result, msg

  if (func==='playLand'&& !!playLand(playtest.deck)) return dispatch(cardClick(playLand(playtest.deck)))
  if (func==='castSpell') {
    result = castSpell(card,playtest,settings.manaTolerance)
    msg = formatText('Paid '+result.cost)
  }
  if (func==='attack') {
    result = attackAll(playtest.deck)
    msg = "Swung out for "+result.total+" damage!"
  }
  if (result) {
    dispatch(cardState(result.tapped,'tapped',true))
    if (result.mana) dispatch(handleMana(result.mana,true))
    if (result.total) {
      dispatch(handleMana())
      dispatch(gameState('eLife',-result.total,true))
    }
  } 
}

export const handleAbility = (type,card) => dispatch => {
    const {playtest,main} = store.getState()
    const inPlay = playtest.deck.filter(c=>c.zone==='Battlefield')

    const executeAbilities = (obj,text) => {
      const effects = Object.entries(obj.effect).filter(c=>c[1]!==null)
      for (var i = 0; i < effects.length; i++) {
        let [key,val] = effects[i]
        setTimeout(_=>{
          if (Object.keys(playtest).includes(key)) dispatch(gameState(key,val,true))
          if (key==='draw') while (val-->0) dispatch(moveCard())   
          if (key==='mill') while (val-->0) dispatch(moveCard({dest:'Graveyard'}))   
          if (key==='token') {
            const token = main.tokens.filter(t=>obj.text.includes(TOKEN_NAME(t)))[0]
            if(token) while (val-->0) dispatch(spawnToken(token)) 
          }     
        },100)
      }
    }

    if (type==='ETB') {
      for (var i = 0; i < (1+inPlay.filter(c=>ETB(c).copier).length); i++) {
        if(ETB(card).self) executeAbilities(ETB(card))
        setTimeout(_=>{
        for(var i = 0; i< inPlay.length;i++) {
          if (Q(card,'type_line',ETB(inPlay[i]).types)) executeAbilities(ETB(inPlay[i]))
        }
      },100)
      }
    }
    
  return {...card,
    tapped: ETB(card).tapped,
    counters: ETB(card).counters
  }
}

