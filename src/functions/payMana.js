import {Q} from './cardFunctions'
import {sum,match} from './utility'
import {CARD_TYPES,COLORS,ZONES,SINGLETON} from '../constants/definitions'
import {MANA,TUTOR,SAC_AS_COST} from '../constants/greps'



export default function payMana(cost,playtest,manaTolerance) {

  let floating = [...playtest.mana]
  const symbols = cost.split('{').map(m=>m.replace('}','').replace('/','')) 
  symbols.shift()
  let colored = COLORS('symbol').map(C=>symbols.filter(co=>co===C).length)
  let generic = isNaN(symbols[0])?0:parseInt(symbols[0])

  let manaSources = Q([...playtest.deck].filter(c=>c.zone==='Battlefield'),...MANA.source)
      .map(l=>{l.color_identity=Q(l,...MANA.any)?COLORS('symbol'):!l.color_identity.length?['C']:l.color_identity;return l})
      .map(l=>{l.amt=Q(l,...MANA.twoC)?2:1;return l})
      .filter(l=>!l.tapped)

  // console.log('casting Spell','floating',floating,'colored',colored,'manaSources',manaSources)

  if (manaTolerance>=3) {
    for (let i = 0; i < colored.length; i++) {
      for (let j = 0; j < manaSources.length; j++) {
        if(floating[i] < colored[i] && !manaSources[j].tapped&&manaSources[j].color_identity.includes(COLORS('symbol')[i])) {
          floating[i] = floating[i]+manaSources[j].amt
          manaSources[j] = {...manaSources[j],tapped:true}
        }
      }
    }
    floating = floating.map((fl,i)=>fl>=colored[i]?fl-colored[i]:fl)
    colored = colored.map((co,i)=>co>=floating[i]?0:co)

    if (generic>0) {
      for (let k = 0; k < manaSources.length; k++) {
        if(sum(floating) < generic && !manaSources[k].tapped) {
          floating[5] = floating[5]+manaSources[k].amt
          manaSources[k] = {...manaSources[k],tapped:true}
        }
      }        
    }
  }
  

  for (let i = 0; i < floating.length; i++) {
    if (generic>0) {
      const dif = generic - floating[5-i]
      generic = Math.max(dif,0)
      floating[5-i] = Math.abs(Math.min(dif,0))
    }
  }
  

  console.log('Pay Mana','remaining',sum([...colored,generic]),'floating',floating,'colored',colored,'generic',generic,'manaSources',manaSources,'tapped',manaSources.filter(a=>a.tapped).map(c=>c.name))
  if (sum([...colored,generic])<=0) return {
    tapped:manaSources.filter(a=>a.tapped),
    mana: floating,
    cost,
  } 
  return false
}
