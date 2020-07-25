import {Q} from './cardFunctions'
import titleCaps from './titleCaps'
import {sum,match} from './utility'
import {CARD_TYPES,COLORS,ZONES,SINGLETON} from '../constants/definitions'
import {MANA,TUTOR,SAC_AS_COST} from '../constants/greps'
import {v4 as uuidv4} from  'uuid'


export function cardMoveMsg(card,dest) {
    let msg = `Put "${card.name}" into ${dest} from ${card.zone}`
    if (dest==="Exile") {msg = `Exiled "${card.name}" from ${card.zone}`}
    else if (dest==="Hand"&&card.zone!=="Library") {msg = `Returned "${card.name}" from ${card.zone} to hand`}
    else if (dest!=="Library"&&(card.zone==="Hand"||card.zone==="Command")&&!card.type_line.includes('Land')) {msg = `Cast "${card.name}"`}
    else if (dest==="Hand"&&card.zone==="Library") {msg = `Drew "${card.name}"`}
    
    else if (dest==="Battlefield"&&(card.zone==="Graveyard"||card.zone==="Exile")) {msg = `Returned "${card.name}" from ${card.zone} to Battlefield`}
    else if (dest==="Battlefield") {msg = `Played "${card.name}"`}
    
    else if (dest==="Graveyard"&&card.zone==="Library") {msg = `Milled "${card.name}"`}
    else if (dest==="Graveyard"&&card.zone==="Battlefield") {msg = `Sacrificed "${card.name}"`}
    return msg
}


export function castSpell(card,game,manaTolerance) {
  let floating = [...game.mana]
  const colored = card.mana_cost.split('{').map(m=>m.replace('}','').replace('/','')) 
  colored.shift()
  let toPay = [...COLORS('symbol').map(C=>colored.filter(co=>co===C).length),parseInt(colored[0])]
  let manaSources = Q([...game.deck].filter(c=>c.zone==='Battlefield'),...MANA.source)
      .map(l=>{l.color_identity=Q(l,...MANA.any)?COLORS('symbol'):!l.color_identity.length?['C']:l.color_identity;return l})
      .map(l=>{l.amt=Q(l,...MANA.twoC)?2:1;return l})

  // console.log('casting Spell','floating',floating,'toPay',toPay,'manaSources',manaSources)

  if (manaTolerance>=3) {
    for (var i = 0; i < toPay.length; i++) {
      for (var j = 0; j < manaSources.length; j++) {
        if(floating[i] < toPay[i] &&!manaSources[j].tapped&&manaSources[j].color_identity.includes(COLORS('symbol')[i])) {
          floating[i]+=manaSources[j].amt
          manaSources[j].tapped = true
        }
      }
      if (i===6&&toPay[6]) {
        for (var j = 0; j < manaSources.length; j++) {
          if(sum(floating)< toPay[6] &&!manaSources[j].tapped) {
            floating[5]+=manaSources[j].amt
            manaSources[j].tapped = true
          }
        }        
      }
    }
  }
  
  floating = floating.map((f,i)=>f-Math.min(f,toPay[i]))
  toPay = toPay.map((p,i)=>p-Math.min(p,(floating[i]||0)))

  for (var i = 0; i < floating.length; i++) {
    if (toPay[6]>0) {
      floating[5-i] -= Math.min(floating[5-i],toPay[6])
      toPay[6] -= Math.min(floating[5-i],toPay[6])
    }
  }
  

  // console.log('cast Spell','floating',floating,'toPay',toPay,'manaSources',manaSources)
  if (sum(toPay)>0) return false //fuckeverything
  else return {
    tapped:manaSources.filter(a=>a.tapped),
    mana: floating,
    cost: card.mana_cost,
  } 
  return false
}


export function attackAll(state) {
  const available = state.game.deck.filter(c=>
    c.zone==="Battlefield"
    &&c.type_line.includes('Creature')
    &&!c.type_line.includes('Wall')
    &&!c.tapped
    ).filter(c=>Q(c,'oracle_text','haste')||!c.sickness)
  

  const total = sum(available.map(c=>{
    return (parseInt(c.power) + (c.counters.PlusOne||0))
    *((Q(c,'oracle_text','double strike')||c.counters['Double strike'])?2:1)
  }))
  console.log('attacking with',available,'for',total)
  
  const tapped = available.filter(c=>!Q(c,'oracle_text','vigilance'))
  
  if(available.length) {return {tapped:tapped,total:!isNaN(total)?total:0}}
  return false
}

export function playLand(state) {
    return state.game.deck.filter(c=>
      c.zone==="Hand"
      &&c.type_line.includes('Land')
    )[0]
}



export function chooseCommander(card,list,legalCards,addCard) {
  const commanders = list.filter(c=>c.board==='Command')
  const partners = commanders.length&&Q([commanders[0],card],'oracle_text','partner').length===2 
      && !Q([commanders[0],card],'oracle_text','partner with').length 
      && commanders[0].name!==card.name
  if (Q([card],'oracle_text','Partner with').length) {  
    const partnerName = card.oracle_text.substr(12,card.oracle_text.indexOf('(')-12).trim()
    const partner = list.filter(c=>c.name===partnerName)[0]
    if (partner) list = addCard
      ?list.filter(c=>!commanders.map(a=>a.key).includes(c.key))   
      :list.map(c=>{if(c.key===partner.key) c.board='Command';return c})   
    else list = [
      ...list.map(c=>{if(c.board==='Command') c.board='Maybe';return c}),
      {...Q(legalCards,'name',partnerName)[0],
      key: "CommanderID__"+uuidv4(),
      board: 'Command',
      customField: 'unsorted'
    }]
  }
  else if(!partners) {list = addCard
    ?list = list.filter(c=>!commanders.map(a=>a.key).includes(c.key))   
    :list.map(c=>{if(c.board==='Command') c.board='Maybe';return c})
  }
  else if(commanders.length>1) {
    list = list.map(c=>{if(c.key===commanders[0].key) c.board='Maybe';return c})
  } 
  if (addCard && !list.filter(c=>c.name===card.name).length) {
    list = [...list,
      {...card,
      key: "CommanderID__"+uuidv4(),
      board: 'Command',
      customField: 'unsorted'
    }]
  }
  else list = list.map(c=>{if(c.key===card.key) c.board='Command';return c})
  return list
}

export function legalCommanders(format,legalCards) {
  let legalCommanders = []
  if (format==='commander'&&legalCards.length) {
    legalCommanders = Q(legalCards,'type_line',['Legendary','Creature'],true)
      .concat(Q(legalCards,'oracle_text','can be your commander'))
  }
   else if (format==='brawl'&&legalCards.length) {    
    legalCommanders = Q(legalCards,'type_line',['Legendary','Creature'],true)
      .concat(Q(legalCards,'type_line','Planeswalker'))
   }
  return legalCommanders
}

export function tutorableCards(card,deck) {
  let tutorable = []
  let dest = 'Hand'
  let from = 'Battlefield'
  let sac = false

  if(Q(card,...TUTOR(''))) {
    const searchText = card.oracle_text.toLowerCase().slice(
      card.oracle_text.toLowerCase().indexOf('search your library')+19,
      card.oracle_text.toLowerCase().indexOf('shuffle')
    )
    dest = ZONES.filter(z=>searchText.includes(z.toLowerCase()))[0]

    const searchForType = [
      ...COLORS('basic'),
      ...CARD_TYPES.map(C=>C==='Land'?'Basic':C)
    ]

    if (Q(card,...SAC_AS_COST(card.name))) sac=true



    for (var i = 0; i < searchForType.length; i++) {
      if(searchText.includes(searchForType[i].toLowerCase())) {
        tutorable = tutorable.concat(Q(deck.filter(c=>c.zone==='Library'),'type_line',searchForType[i]))
      }
    }
    tutorable = tutorable.unique('name')
  }
  return {cards:tutorable,dest:dest,from:from,sac:sac}
}

export function clickPlace(card,inZone,toDest,dblclick) {
  let dest = card.zone
  let col,row 

  if (card.zone==="Library") dest = "Hand"
  else if (dblclick&&card.zone==="Battlefield") dest = "Graveyard"
  else if (dblclick&&card.zone==="Graveyard") dest = "Exile"
  else if (dblclick&&card.zone==="Exile") dest = "Battlefield"
  else if (card.zone==="Hand"||card.zone==="Command") 
  dest = Q(card,'type_line',['Instant','Sorcery'])? "Graveyard":"Battlefield" 
  
  dest = toDest||dest

  if (dest==card.zone) return {card:null} 
  else {
    if (Q(card,'type_line','Creature')) row = 1
    else if (Q(card,'type_line','Artifact')&&Q(card,...MANA.source))row = 0 
    else if (Q(card,'type_line','Artifact')) row = 2
    else if (Q(card,'type_line',['Enchantment','Planeswalker'])) row = 2
    else if (Q(card,'type_line','Land')) row = 0
    
    col = col||inZone.filter(c=>c.row===row).length % 8 // REPLACE 8 with dynamic cols

    // console.log('clickPlace',card.name,col,row,dest)
    return {card:card,dest:dest,col:col,row:row}
  }
}


export function guessCustomField(card) {
  const fields = ''
}