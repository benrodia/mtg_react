import {Q} from './cardFunctions'
import {titleCaps} from './text'
import {sum,match} from './utility'
import {CARD_TYPES,COLORS,ZONES,SINGLETON} from '../constants/definitions'
import {MANA,TUTOR,SAC_AS_COST} from '../constants/greps'
import {v4 as uuidv4} from  'uuid'

export default function attackAll(deck) {
  const available = deck.filter(c=>
    c.zone==="Battlefield"
    &&c.type_line.includes('Creature')
    &&!c.type_line.includes('Wall')
    &&!c.tapped
    ).filter(c=>Q(c,'oracle_text','haste')||!c.sickness)
  

  const total = sum(available.map(c=>{
    return (!isNaN(c.power)?parseInt(c.power):0 + (c.counters.PlusOne||0))
    *((Q(c,'oracle_text','double strike')||c.counters['Double strike'])?2:1)
  }))  
  const tapped = available.filter(c=>!Q(c,'oracle_text','vigilance'))
  
  return available.length ? {tapped, total} : false
}
