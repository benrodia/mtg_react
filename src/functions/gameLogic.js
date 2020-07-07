import {qCard} from './cardFunctions'

export function cardMoveMsg(card,dest) {
    let msg = `Put ${card.name} into ${dest} from ${card.zone}`
    if (dest==="Exile") {msg = `Exiled ${card.name} from ${card.zone}`}
    else if (dest==="Hand"&&card.zone!=="Library") {msg = `Returned ${card.name} from ${card.zone} to hand`}
    else if (dest!=="Library"&&card.zone==="Hand"&&!card.type_line.includes('Land')) {msg = `Cast ${card.name}`}
    else if (dest==="Hand"&&card.zone==="Library") {msg = `Drew ${card.name}`}
    
    else if (dest==="Battlefield"&&(card.zone==="Graveyard"||card.zone==="Exile")) {msg = `Returned ${card.name} from ${card.zone} to Battlefield`}
    else if (dest==="Battlefield") {msg = `Played ${card.name}`}
    
    else if (dest==="Graveyard"&&card.zone==="Library") {msg = `Milled ${card.name}`}
    else if (dest==="Graveyard"&&card.zone==="Battlefield") {msg = `Sacrificed ${card.name}`}
    return msg
}


export function castSpell(card,deck) {    
  let available = qCard(deck.filter(c=>c.zone==='Battlefield'),'oracle_text',['{T}','add'],true).filter(c=>!c.tapped)

  if (available.length>=card.cmc) {
    available = available
      .map(l=>{
        if(qCard(l,'oracle_text',['{T}','add','any color'],true)){
          l.color_identity=['W','U','B','R','G']
        }
        return l
      })
      .sort((a,b)=>(a.color_identity.length<b.color_identity.length)?1:-1)

    const coloredText = card.mana_cost.split('{').map(m=>m.replace('}','').replace('/','')) 
    let colored = coloredText
    colored.shift()
    const generic = parseInt(colored[0])  
    if(!isNaN(generic)){colored.shift()}
    
    for (var i = 0; i < colored.length; i++) {
      for (var j = 0; j < available.length; j++) {
        if(available[j].color_identity.includes(colored[i])) {
          available[j].tapped = true
        }
      }
    }
    if (!isNaN(generic)) {
      for (var i = 0; i < generic; i++) {
        for (var j = 0; j < available.length; j++) {
          if(!available[j].tapped) {available[j].tapped=true;break}
        }
      }
    }
    console.log('available for tapping',available,colored,generic)

    deck = available.concat(deck).unique()
    return {deck:deck,spent:coloredText}
  } 
  return false
}


export function attackAll(state) {
  const available = state.game.deck.filter(c=>
    c.zone==="Battlefield"
    &&c.type_line.includes('Creature')
    &&!c.type_line.includes('Wall')
    &&!c.tapped
    )
  .filter(c=>(c.oracle_text.includes('Haste')
    ||state.lastTurn&&state.lastTurn.deck.filter(lt=>lt.id===c.id)[0].zone==="Battlefield"))

  const sum = items => items.reduce((a, b)=>parseInt(a) + parseInt(b.power) + parseInt(b.counters), 0)
  const total = sum(available)
  console.log('attacking with',available.map(c=>c.name),'for',total)
  
  const attacked = available.map(c=>{
    if(c.oracle_text.includes("Vigilance")){c.tapped=true}
    return c
  })
  const deck = attacked.concat(state.deck).unique()
  
  if(available.length) {return {deck:deck,total:total}}
  return false
}

export function playLand(state) {
  console.log('playLand')
    return state.game.deck.filter(c=>
      c.zone==="Hand"
      &&c.type_line.includes('Land')
    )[0]
}