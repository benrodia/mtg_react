import {v4 as uuidv4} from  'uuid'

// Constants
import store from './store'
import * as A from './constants/actionNames'

import {HOME_DIR,PHASES,COLORS,MAIN_BOARD} from './constants/definitions'
import {
  SINGLETON,
  TOKEN_NAME,
  MANA,
  WHEN,
  ENTERS_TAPPED,
  ENTERS_COUNTERS,
  IS_SPELL,
  IS_PERMANENT,
  HAS_FLASH,
  LAND_DROPS,
  CAN_TAP,
  FOR_EACH,
} from './constants/greps'
import {CARD_SLEEVES,PLAYMATS,NUMBER_WORDS} from './constants/data'

import {
  INIT_DECK_STATE,
  INIT_FILTERS_STATE,
  INIT_SETTINGS_STATE,
  INIT_PLAYTEST_STATE,
} from './constants/initialState'

//Functions
import {
  titleCaps,
  pluralize,
  formatText,
  formatManaSymbols,
  effectText,
  cardMoveMsg,
  paidCostMsg,
} from './functions/text'
import {Q,isLegal,audit,normalizePos} from './functions/cardFunctions'
import {
  playLand,
  clickPlace,
  getColorIdentity,
  chooseCommander,
  legalCommanders,
} from './functions/gameLogic'
import attack from './functions/attack'
import payMana from './functions/payMana'


import {cache,session,sum} from './functions/utility'

export const setPage = page => dispatch => {
  dispatch({type: A.MAIN,key:'page',val:page})
  dispatch({type: A.MAIN,key:'modal',val:null})
}

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


export const changeDeck = (key,val) => dispatch => {
  if (key==='clear' && window.confirm('Clear Deck?')) {
    dispatch(newMsg('CLEARED DECK'))
    cache(A.DECK,'all',INIT_DECK_STATE)
    dispatch({type: A.DECK,val: INIT_DECK_STATE})
  }
  else {
    let update = {...store.getState().deck}
    if (key==='format' && val!== update.format)
      dispatch(getLegalCards(store.getState().main.cardData,val)) 
    
    update[key] = val
    cache(A.DECK,'all',update)
    dispatch({type: A.DECK,val: update})
  }
}
export const changeCard = (card={},assign={}) => dispatch => dispatch(changeDeck('list',store.getState().deck.list.map(c=>c.key===card.key?{...Object.assign(card,assign)}:c)))


export const changeSettings = (key,val) => dispatch => {
  if (key==='clear' && window.confirm('Revert to Default Settings?')) {
    cache(A.SETTINGS,'all',INIT_SETTINGS_STATE)
    dispatch({type: A.RESET_SETTINGS})
  }
  else {
    cache(A.SETTINGS,key,val)
    dispatch({type: A.SETTINGS,key,val})

  } 
}

export const changeFilters = (key,val) => dispatch => {

    session(A.FILTERS,key,val)
    dispatch({type: A.FILTERS,key,val})
}
export const changeAdvanced = assign => dispatch => dispatch(changeFilters('advanced',{...Object.assign(store.getState().filters.advanced,assign)}))


export const addCard = (cards,board,remove) => dispatch => {
  const state = {...store.getState()}
  if (cards.constructor !== Array) cards = [cards]
  const newCard = card => {return {
      ...audit(card),
      customField: card.customField || null,
      board: board||card.board||MAIN_BOARD,
      commander: card.commander||false,
      key: "CardID__"+uuidv4()
    }
  }
  const list = remove
    ? state.deck.list.filter(l=>cards.filter(card=>l.key!==card.key).length) 
    : [
      ...state.deck.list,
      ...cards.map(card=>newCard(card)).filter(c=>!!c)
    ] 
  console.log('addCard',list)
  dispatch(changeDeck('list',list))
}

// PLAYTESTER

export const gameState = (key,val,addTo) => dispatch => dispatch({type:A.PLAYTEST,key,val,bool:addTo}) 
export const addHistory = msg => dispatch => dispatch({type:A.HISTORY,val:msg})
export const timeTravel = index => dispatch => dispatch({type:A.TIME_TRAVEL,val:index}) 


export const cardState = (card,key,val) => dispatch => dispatch({type:A.CARD,cards:Array.isArray(card)?card:[card],key,val})  

export const untap = _ => dispatch => dispatch({type:A.CARD,key:'tapped',val:false})  
export const handleMana = (mana,replace) => dispatch => dispatch({type:A.MANA,val:mana,bool:replace})
export const handleShuffle = bool => dispatch =>{
  dispatch({type:A.SHUFFLE})
  dispatch(addHistory('Shuffle Library'))
}
export const goToPhase = name => dispatch => {
  dispatch(handleMana())
  dispatch({type:A.PLAYTEST,key:'phase',val:name})
  dispatch(handleAbilities(name))
  dispatch(addHistory(`Go to ${name}`))
  if (name==='Draw') dispatch(moveCard())
}

export const spawnToken = token => dispatch => dispatch({type:A.TOKEN,val:token})

let canRestart = true

const drawHand = init => dispatch => setTimeout(_=>{
  let toDraw = init
  const keep = _=> {
    dispatch(addHistory(`Draw Opening Hand (${init||7})`))
    dispatch(handleTurns())
  }
  
  const drawTimer = setInterval(_=>{
    if(!--toDraw){
      clearInterval(drawTimer)
      canRestart=true
      dispatch(addStack({
        options: [
        {
          effect: `Keep Hand`,
          res: _=> {
            if (init<7) {
              dispatch({type: A.PLAYTEST,key:'look',val:1})
              dispatch(addStack({
                options:[{
                  effect: 'Resolve Scry',
                  res:_=> keep() 

                  
                }]
              }))
            } else keep()
          }
        },
        {
          res: _=>dispatch(startTest(init-1||1)),
          effect: `Mulligan to ${init-1||1}`,
        },
        ]
    }))}
    dispatch(moveCard(null,true))
  },100)
},150)

export const startTest = init => dispatch => {
  if (canRestart) {canRestart=false
    const {list,format} = store.getState().deck
    dispatch({type:A.INIT_GAME,list,format})

    dispatch(handleShuffle())
    dispatch(drawHand(init||7))   
  }
}


export const moveCard = (payload,bypass) => dispatch => {
  const {card,dest,col,row,bottom} = payload||{}
  const inLibrary = store.getState().playtest.deck.filter(c=>c.zone==="Library")
  const toMove = card!==undefined?card:inLibrary[inLibrary.length-1]
  const toDest = dest || "Hand" 
  const interZone = toMove.zone!==toDest

  const resolveMove = willCast => {
    const {deck,look} = store.getState().playtest
    if (interZone) dispatch(handleAbilities(toDest,toMove))
    if (toMove.zone!=='Library') dispatch({type:A.PLAYTEST,key:'look',val:0}) 
    if (look&&(toDest!==toMove.zone||bottom)) dispatch({type:A.PLAYTEST,key:'look',val:look-1})
    
    dispatch({type:A.PLAYTEST,key:'deck',val:normalizePos(deck.map(c=>c.key!==toMove.key?c:{...toMove,
      col: col>=0?col:deck.filter(c=>c.zone===toDest&&c.row===row).length,
      row: row||0,
      stack: deck.filter(c=>c.zone===toDest&&c.row===row&&c.col===col).length,
      order: bottom?0:deck.filter(c=>c.zone==="Library").length,
      zone: toDest==='Battlefield'&&!IS_PERMANENT(toMove)?'Graveyard':toDest,
      face_down: toDest==='Library',
      tapped: ENTERS_TAPPED(toMove),
      counters: ENTERS_COUNTERS(toMove),
    }))})
    if (interZone&&!bypass) dispatch(addHistory(cardMoveMsg(toMove,toDest)))    
  }

  if(!toMove) return console.error('no card to move')
  else if (!bypass && interZone && toDest==='Battlefield' && store.getState().playtest.stack.length && !HAS_FLASH(toMove)) 
    dispatch(newMsg("Can't use sorcery-speed actions if the stack isn't empty. (Change game settings on User page)",'error')) 
  else if (IS_SPELL(toMove) && toDest==='Battlefield') {
    dispatch(addStack({
      options:[{    
        res: _=>{
          dispatch(handleCost({mana:toMove.mana_cost}))
          resolveMove()
          dispatch(handleAbilities('Cast',toMove))
        },
        effect: payMana(toMove.mana_cost)
          ?formatText(`Cast for ${toMove.mana_cost}`)
          :'Cast Without Paying'
      }],
      cancelable:true,
      src: toMove.name,
      effectType: 'Spell',
    }))
  }
  else resolveMove()
}



export const cardClick = (card,dblclick,toDest) => dispatch => {
  if (card.zone==="Battlefield"&&!dblclick) {
    if (MANA.source(card)&&CAN_TAP(card)) 
      for (let i = 0; i < card.mana_source.length; i++) 
        if(card.mana_source[i]){dispatch(handleMana(card.mana_source.map((co,ind)=>ind===i?co:0)));break}
    return dispatch(cardState(card,'tapped',!card.tapped))
  }
  const inPlay = store.getState().playtest.deck.filter(c=>c.zone==='Battlefield')
  dispatch(moveCard(clickPlace(card,inPlay,toDest,dblclick)))
}

// const cycleTo = phase => dispatch => {

// }

export const handleTurns = _ => dispatch => {
  const {turn,phase,stack} = store.getState().playtest
  if (!stack.length&&!!turn) {
      dispatch(goToPhase('End'))
  }


      dispatch({type:A.NEW_TURN})
      dispatch(addHistory(`Untap Turn ${turn+1}`))
      dispatch(goToPhase('Upkeep'))
      dispatch(goToPhase('Draw'))
      dispatch(goToPhase('Main One'))
}


export const landDrop = _ => dispatch => dispatch(cardClick(playLand(store.getState().playtest.deck))) 

export const handleCost = ({mana,life}) => dispatch => {
  const paidMana = payMana(mana||'') 
  const paidLife = (life||0)>=store.getState().playtest.life
  if(paidMana) {
    dispatch(newMsg(paidCostMsg(paidMana),'success'))
    dispatch(cardState(paidMana.tapped,'tapped',true))
    dispatch(handleMana(paidMana.mana,true))
  } 
}

export const handleCombat = creatures => dispatch => {
  const {deck,phase} = store.getState().playtest
  if (phase==='Main One') {
    dispatch(goToPhase('Combat'))
    dispatch(addStack({
      options:[{
        effect: 'Attack All',
        res: _=> {
          const attackers = creatures || deck.filter(c=>c.type_line.includes('Creature')&&!c.type_line.includes('Wall')&&CAN_TAP(c))
          const result = attack(attackers)
          if (result) {
            dispatch(newMsg(`Attacked with ${NUMBER_WORDS[result.tapped.length]} ${pluralize('creature',result.tapped.length)} for ${result.total} damage!`,'success'))
            dispatch(cardState(result.tapped,'tapped',true))
            dispatch(gameState('eLife',-result.total,true))
            dispatch(goToPhase('Main Two'))
          }     
        },
      },
      {effect: 'No Attacks',res:_=>dispatch(goToPhase('Main Two'))}
      ],
    }))

  }
}


export const addStack = ({options,effectType,src,text,cancelable}) => dispatch => {
  const stacktion = {
    options: [...(options||[{}]).map(op=>{return{
      res: op.res,
      color: op.color||'success',
      effect: op.effect||'Mark Resolved',
    }}),
    {
      hide: !cancelable,
      color: 'error',
      effect: 'Cancel',      
    }
    ],
    effectType: effectType || 'Action',
    text: text || '',
    src: src || 'Game',
  }
  if (store.getState().settings.useStack.includes(stacktion.effectType))
    dispatch({type:A.ADD_STACK,val:stacktion})
  else if(typeof stacktion.options[0].res==='function') 
    stacktion.options[0].res()
}

export const resStack = res => dispatch => dispatch({type:A.RES_STACK})

export const handleAbilities = (type,card={}) => dispatch => {
    const {playtest,main} = store.getState()
    const inPlay = playtest.deck.filter(c=>c.zone==='Battlefield')

    const executeAbilities = obj => {
      const effects = Object.entries(obj.effect).map(ef=>{return [ef[0],ef[1]&&FOR_EACH(obj.text,playtest.deck)||ef[1]]})
      const text = obj.text
      const token = main.tokens.filter(t=>obj.text.includes(TOKEN_NAME(t)))[0]
      const res = _ => {
        for (let i = 0; i < effects.length; i++) {
          let [key,val] = effects[i]
          if (val!==0) {const takeEffect = setInterval(_=>{if (!--val) clearInterval(takeEffect)
            if (Object.keys(playtest).includes(key)) dispatch(gameState(key,1,true))
            if (key==='draw') dispatch(moveCard(null,true))
            if (key==='mill') dispatch(moveCard({dest:'Graveyard'},true))
            if (key==='exile') dispatch(moveCard({dest:'Exile'},true))
            if (key==='token'&&token) dispatch(spawnToken(token))     
          },100) 
        }}
      }
      dispatch(addStack({
        text: obj.text,
        effectType: 'Triggered Ability',
        options:[{res,effect: effectText(effects,token)}],
        src: obj.src,
        cancelable: true
      })) 
    }

    const phrase = 
       // type==='Hand'? 'whenever you draw a car']
      type==='Battlefield'? 'enters the battlefield':
      type==='Graveyard'&&card.zone==='Battlefield'? 'dies':
      type==='Graveyard'&&card.zone==='Hand'? 'discard':
      // type==='Draw'? 'your Draw step':
      // type==='Main One'? 'your precombat main phase':
      // type==='Upkeep'? 'At the beginning of your upkeep':
      // type==='Combat'? 'attacks':
      // type==='Main Two'? 'your postcombat main phase':
      // type==='End'? 'your end step':
      // [type]:
      undefined

    // console.log('phrase',phrase)
// for(let i=0;i<(1+inPlay.filter(c=>WHEN(c,phrase).copier).length);i++)
    if (phrase) {
      if(WHEN(card,phrase).self) executeAbilities(WHEN(card,phrase))
      for(let j = 0; j< inPlay.length;j++) 
        if (Q(card,'type_line',WHEN(inPlay[j],phrase).types)) 
          executeAbilities(WHEN(inPlay[j],phrase))
    }
}

