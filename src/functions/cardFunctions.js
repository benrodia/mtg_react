import {v4 as uuidv4} from  'uuid'

import {CARD_TYPES,ZONES} from '../constants/definitions'
import {SINGLETON,NO_QUANT_LIMIT,MANA,NUM_FROM_WORD} from '../constants/greps'
import {matchStr} from '../functions/utility'
import {CONTROL_CARD} from '../constants/controlCard.js'


export function Q(scope,keys,vals,every) {
	let query=[], falsey=[]
  if (!scope) {return console.error('Q has no valid target')}
	if (scope.constructor !== Array) {scope=[scope]; falsey = false}
  if (keys.constructor !== Array) {keys=[keys]}
  if (vals) {
	  if (vals.constructor !== Array) {vals=[vals]}
    for (var i = 0; i < scope.length; i++) {
      let included=false
      for (var j = 0; j < keys.length; j++) {
        vals = vals.map(val=>val.constructor==Array?val.join(''):val)
        included = matchStr(scope[i][keys[j]],vals,every)?true:included 
      }
      query = included?query.concat(scope[i]):query
    }
  } else query = scope.map(s=>s[keys[0]])
	
  return query.length?query:falsey
}


export function itemizeDeckList(list,filters,headers) {
  let itemized = []
	let remaining = list
  const filterFor = filters||['name']//,'set_name'
	while(remaining.length){
		const matches = remaining.filter(card=>filterFor.every(f=>card[f]===remaining[0][f]))
    
    remaining = remaining.filter(r=>!matches.filter(c=>c.key===r.key).length)
    if (headers) {
      itemized.push({
        name: matches[0]['name'],
        set_name: matches[0]['set_name'],
        matches: matches.length
      })
    } 
    else itemized.push(matches)
  }
	return itemized
}


export function normalizePos(deck) {
  let zoneCards = ZONES.map(z=>deck.filter(c=>c.zone===z))
  for (var i = 0; i < zoneCards.length; i++) {
    zoneCards[i] = zoneCards[i].orderBy('order').map((c,i)=>{c.order=i;return c})
  }
  let slots = deck.filter(c=>c.zone==="Battlefield")
  for (var i = 0; i < slots.length; i++) {
    let stacks = slots.filter(c=>c.col===slots[i].col&&c.row===slots[i].row).sort((a,b)=>(a.stack > b.stack)?1:-1)      
    stacks = stacks.map((s,ind)=>{s.stack=ind;return s})
  }  
  let notBF = deck.filter(c=>c.zone!=="Battlefield").map(c=>{c.tapped=false;c.counters={};return c})
  return deck.filter(c=>!(c.isToken&&c.zone!=="Battlefield"))  
}



export function isLegal(card,format,deckIdentity) {
  let allowed = (card.legalities[format] === 'legal')?4
    :card.legalities[format] === 'restricted'?1
    :0

  if (format === 'casual') {allowed = 4}
  if (Q(card,'type_line','Token')) {allowed = 0}
  if (SINGLETON(format)) {allowed = 1}
  if (NO_QUANT_LIMIT(card)) allowed = 1000000
  if (card.name==='Seven Dwarves') allowed = 7

  if (card.color_identity&&deckIdentity&&deckIdentity.length&&
    !card.color_identity.every(ci=> deckIdentity.includes(ci))) {
    allowed = 0
  }
  return allowed
}


export function filterSearch(options,filters,limit) {
    let sorted = options
    if (!filters||!filters.colors) return sorted
    const colorF = filters.colors
    

    sorted = sorted.orderBy('name').filter((c,i)=>{
      let included = true
      if (c.colors) {
        included = (colorF.vals['C']&&!c.colors.length)||c.colors.some(co=>colorF.vals[co])
        if(colorF.op['all']) included = Object.entries(colorF).every(co=>!co[1]||co[0]==='C'||c.colors.includes(co[0]))
        if(colorF.op['only']) included = c.colors.every(co=> colorF.vals[co])
          // if (i<10) {console.log(c.name,
          //   '\nfilter all',Object.entries(colorF).every(co=>!co[1]||c.colors.includes(co[0])),
          //   '\nfilter only',c.colors.every(co=> colorF.vals[co]),
          //   )}
      }
      return included
    })


    // sorted.length = Math.min(sorted.length,(limit||20))
    // sorted = sorted.unique('name')

    console.log('filterSearch',sorted)

    return sorted
}


export const audit = card => Object.assign(CONTROL_CARD(),card)
