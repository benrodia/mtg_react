import {v4 as uuidv4} from  'uuid'

// Constants
import store from './store'
import * as A from './constants/actionNames'

import {HOME_DIR,COLORS,SINGLETON,TOKEN_NAME} from './constants/definitions'
import {MANA,ETB,IS_SPELL} from './constants/greps'
import {CARD_SLEEVES,PLAYMATS,NUMBER_WORDS} from './constants/data_objects'

import {
  INIT_PLAYTEST_STATE,
} from './constants/initialState'

//Functions
import {formatText,formatManaSymbols,effectText} from './functions/text'
import {Q,isLegal,audit} from './functions/cardFunctions'
import {
  playLand,
  clickPlace,
  getColorIdentity,
  chooseCommander,
  legalCommanders,
} from './functions/gameLogic'
import attack from './functions/attack'
import payMana from './functions/payMana'


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

export const gameState = (key,val,addTo,desc) => dispatch => dispatch({type:A.PLAYTEST,key,val,bool:addTo}) 
export const addHistory = item => dispatch => dispatch({type:A.HISTORY,item})
export const undoAction = _ => dispatch => dispatch({type:A.UNDO}) 

export const cardState = (card,key,val) => dispatch => dispatch({type:A.CARD,cards:Array.isArray(card)?card:[card],key,val})  

export const untap = _ => dispatch => dispatch({type:A.CARD,key:'tapped',val:false})  
export const handleShuffle = bool => dispatch => dispatch({type:A.SHUFFLE})
export const spawnToken = token => dispatch => dispatch({type:A.TOKEN,token})
export const handleMana = (mana,replace) => dispatch => {
  console.log('handleMana',mana,replace)
  dispatch({type:A.MANA,val:mana,bool:replace})
}

let canRestart = true
export const startTest = _ => dispatch => {
  if (canRestart) {canRestart=false
    const {list,format} = store.getState().deck
    dispatch({type:A.INIT_GAME,list,format})
    dispatch(handleTurns(true))
  }
}

export const moveCard = payload => dispatch => {
  let move = payload || {}
  const moving = move.card&&move.card.zone!==move.dest
  if (IS_SPELL(move.card)&&moving) dispatch(addStack({
    res:_=> {
      dispatch(gameFunction('payMana',move.card))
      dispatch({type:A.BOARD,val:{...move,card: dispatch(handleAbility("ETB",move.card))}})
    },
    src: move.card.name,
    effect: `Resolve`,
    effectType: 'Spell'
  }))

  else if (move.dest==='Battlefield'&&moving) 
    dispatch({type:A.BOARD,val:{...move,card: dispatch(handleAbility("ETB",move.card))}})
  
  else dispatch({type:A.BOARD,val:move})
}

export const cardClick = (card,dblclick,toDest) => dispatch => {
  if (card.zone==="Battlefield"&&!dblclick) {
    if (Q(card,...MANA.source)&&!card.tapped) {
      const amt = Q(card,...MANA.twoC)?2:1
      const mana = COLORS('symbol').map(C=>card.oracle_text.includes("{"+C+"}")?amt:0)
      if (sum(mana)===amt) dispatch(handleMana(mana))
    }
    return dispatch(cardState(card,'tapped',!card.tapped))
  }
  const inPlay = store.getState().playtest.deck.filter(c=>c.zone==='Battlefield')
  dispatch(moveCard(clickPlace(card,inPlay,toDest,dblclick)))
}


export const handleTurns = first => dispatch => {
  dispatch({type:A.NEW_TURN})
  if (first) {
    const drawHand = init => setTimeout(_=>{
      const drawTimer = setInterval(_=>{init--
        if(!init){clearInterval(drawTimer);canRestart=true}
        dispatch(moveCard())
      },70)
    },150)
    dispatch(handleShuffle())

    drawHand(7)     
  }
  else dispatch(moveCard())
}


export const gameFunction = (func,card) => dispatch => {
  const {playtest,settings} = store.getState()
  let result, msg

  if (func==='playLand'&& !!playLand(playtest.deck)) return dispatch(cardClick(playLand(playtest.deck)))
  if (func==='payMana') {
    result = payMana(card.mana_cost,playtest,settings.manaTolerance)
    const usedMana = sum(result.mana)!==sum(playtest.mana)?'Used floating mana':null
    const usedLands = result.tapped?`${NUMBER_WORDS[result.tapped.length]} land${result.tapped.length!==1?'s':''}`:null
    msg = formatText(`${usedMana||''} ${usedMana?' and tapped ':usedLands?'Tapped ':''} ${usedLands||''} to pay ${result.cost}`)
  }
  if (func==='attack') {
    result = attack(playtest.deck)
    msg = `Attacked with ${NUMBER_WORDS[result.tapped.length]} creature${result.tapped.length!==1?'s':''} for ${result.total} damage!`
  }
  if (result) {
    dispatch(newMsg(msg,'success'))
    dispatch(cardState(result.tapped,'tapped',true))
    if (result.mana) dispatch(handleMana(result.mana,true))
    if (result.total) {
      dispatch(handleMana())
      dispatch(gameState('eLife',-result.total,true,`Swung out for ${result.total} damage`))
    }
  } 
}

export const addStack = ({res,effect,effectType,src,text}) => dispatch => {
    
   // if (!!store.getState().settings.useStack) {
    dispatch({type:A.ADD_STACK,
      res: res || null,
      effect: effect || 'Mark Resolved',
      effectType: effectType || 'Action',
      text: text || '',
      src: src || 'Game',
    })
  // } 
  // else if(typeof res==='function') res()
}

export const resStack = res => dispatch => dispatch({type:A.RES_STACK})



export const handleAbility = (type,card) => dispatch => {
    const {playtest,main} = store.getState()
    const inPlay = playtest.deck.filter(c=>c.zone==='Battlefield')

    const executeAbilities = obj => {
      const effects = Object.entries(obj.effect).filter(c=>c[1]!==null)
      const text = obj.text
      const token = main.tokens.filter(t=>obj.text.includes(TOKEN_NAME(t)))[0]
      const res = _ => {
        for (var i = 0; i < effects.length; i++) {
          let [key,val] = effects[i]
          if (val>0) {
            if (Object.keys(playtest).includes(key)) dispatch(gameState(key,val,true))
            if (key==='draw') {while(val-->0) dispatch(moveCard())}
            if (key==='mill') {while(val-->0) dispatch(moveCard({dest:'Graveyard'}))}
            if (key==='token'&&token) {while (val-->0) dispatch(spawnToken(token))}     
          }
        }
      }
      dispatch(addStack({
        text: obj.text,
        effectType: 'Triggered Ability',
        effect: effectText(effects,token),
        res,
        src: obj.src
      })) 
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

