import store from "../store"

import {convertedSymbols} from "./cardFunctions"
import {sum} from "./utility"
import {MANA, CAN_TAP} from "../constants/greps"

export default function payMana(cost) {
  const {mana, deck} = store.getState().playtest

  let floating = [...mana]
  let [colored, generic] = convertedSymbols(cost)

  let manaCards = deck.filter(c => MANA.source(c) && CAN_TAP(c)) || []

  for (let i = 0; i < colored.length; i++) {
    for (let j = 0; j < manaCards.length; j++) {
      if (floating[i] < colored[i] && !manaCards[j].tapped && manaCards[j].mana_source[i]) {
        floating[i] = floating[i] + manaCards[j].mana_source[i]
        manaCards[j] = {...manaCards[j], tapped: true}
      }
    }
  }
  const paidColored = colored.map((co, i) => (floating[i] >= co ? 0 : co))
  floating = floating.map((fl, i) => (fl >= colored[i] ? 0 : fl))

  if (generic > 0) {
    for (let k = 0; k < manaCards.length; k++) {
      if (sum(floating) < generic && !manaCards[k].tapped) {
        floating[5] = floating[5] + Math.max(...manaCards[k].mana_source)
        manaCards[k] = {...manaCards[k], tapped: true}
      }
    }
  }

  for (let i = 0; i < floating.length; i++) {
    if (generic > 0) {
      const dif = generic - floating[5 - i]
      generic = Math.max(dif, 0)
      floating[5 - i] = Math.abs(Math.min(dif, 0))
    }
  }

  if (sum([...paidColored, generic]) > 0) return false
  else
    return {
      tapped: manaCards.filter(a => a.tapped),
      mana: floating,
      usedMana: floating < mana,
      cost,
    }
}
