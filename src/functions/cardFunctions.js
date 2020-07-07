import React from 'react'
import {CARD_TYPES,BASIC_LANDS} from '../Constants'


export function qCard(scope,prop,val,every) {
	let query=[], falsey=[]
	if (scope.constructor !== Array) {scope=[scope]; falsey = false}
  if (prop.constructor !== Array) {prop=[prop]}
	if (val.constructor !== Array) {val=[val]}

  for (var i = 0; i < scope.length; i++) {
    let included=false
    for (var j = 0; j < prop.length; j++) {
      included = match(scope[i][prop[j]],val,every)?true:included 
    }
    query = included?query.concat(scope[i]):query
  }
  // console.log('qCard',scope.map(s=>s.name),prop,val,'Returned: ',query)
	return query.length?query:falsey
}


export function itemizeDeckList(list,filters,headers) {
  let itemized = []
	let remaining = list
  const filterFor = filters||['name','set_name']
	while(remaining.length){
		const matches = remaining.filter(card=>filterFor.every(f=>card[f]===remaining[0][f]))
    
    remaining = remaining.filter(r=>!matches.filter(c=>c.key===r.key).length)
    if (headers) {
      // const terms = filterFor.map(f=>{f:matches[0][f]})
      itemized.push({
        name: matches[0]['name'],
        set_name: matches[0]['set_name'],
        matches: matches.length
      })
    } 
    else itemized.push(matches)
  }
  // itemized.map(sort((a,b)=>a.name))
	return itemized
}

export function prepCardsForTest(list,isToken) {
  return list.map((c,i)=>{
    return {
      key: !isToken?"card_"+i+"_of_"+list.length:"token_"+Math.random(),
      name: c.name,
      type_line:c.type_line,
      oracle_text:c.oracle_text,
      rulings_uri:c.rulings_uri,
      mana_cost: c.mana_cost,
      cmc: c.cmc,
      color_identity: c.color_identity,
      image_uris: c.image_uris,
      power:c.power,
      toughness:c.toughness,

      zone: !isToken?'Library':'Battlefield',
      col: 0,
      row: 0,
      tapped: false,
      counters: 0,
      faceDown: true,
      isToken: isToken,
    }
  })
}

export function normalizePos(deck) {
  // const zonesToFill = ["Hand","Graveyard","Exile"]
  // for (var i = 0; i < zonesToFill.length; i++) {
  //   let arranged = deck.filter(c=>c.zone===zonesToFill[i]).sort((a,b)=>(a.col>b.col)?1:-1)
  //   arranged = arranged.map((a,ind)=>{a.col=ind;a.stack=0;return a})
  // }

  let slots = deck.filter(c=>c.zone=="Battlefield")
  for (var i = 0; i < slots.length; i++) {
    let stacks = slots.filter(c=>c.col===slots[i].col&&c.row===slots[i].row).sort((a,b)=>(a.stack > b.stack)?1:-1)      
    stacks = stacks.map((s,ind)=>{s.stack=ind;return s})
  }  
  let notBF = deck.filter(c=>c.zone!=="Battlefield").map(c=>{c.tapped=false;c.counters=0;return c})
  return deck.filter(c=>!(c.isToken&&c.zone!=="Battlefield"))  
}


export function shuffle(list) {
    let cards = list
    let counter = list.length
    let t,i

    while (counter) {
      i = Math.floor(Math.random() * counter-- )
      t = cards[counter]
      cards[counter] = cards[i]
      cards[i] = t
    }
    return cards
}


function match(text, searchWords, every) {
  return every?
  searchWords.every(el=>text.match(new RegExp(el,"i")))
  :searchWords.some(el=>text.match(new RegExp(el,"i")))
}


export function isLegal(card,format) {
  const noQuantLimit = ['Plains','Island','Swamp','Mountain','Forest','Wastes']
  let allowed = (card.legalities[format] === 'legal')?4
    :card.legalities[format] === 'restricted'?1
    :0

  if (format === 'casual') {allowed = 4}
  if (card.type_line.includes('Token')) {allowed = 0}

  if (format === 'commander' || format === 'brawl') {allowed = 1}
  if (noQuantLimit.includes(card.name)) {allowed = 1000000}
  return allowed
}

export function tutorableCards(props) {
  let tutorable = []
  if(qCard(props.card,'oracle_text','search your library')) {

    const cardTypes = [
      ...BASIC_LANDS,
      ...CARD_TYPES
    ]

    for (var i = 0; i < cardTypes.length; i++) {
      if(qCard(props.card,'oracle_text',cardTypes[i])) {
        tutorable = tutorable.concat(qCard(props.deck,'type_line',cardTypes[i]))
      }
    }
  }
  return tutorable
}

 
