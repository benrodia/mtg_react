import {v4 as uuidv4} from "uuid"

import {CARD_TYPES, ZONES, COLORS} from "../constants/definitions"
import {SINGLETON, NO_QUANT_LIMIT, MANA, NUM_FROM_WORD} from "../constants/greps"
import {matchStr} from "../functions/utility"
import {CONTROL_CARD} from "../constants/controlCard.js"

export function Q(scope = [{}], keys = [""], vals = [], every) {
  let query = [],
    falsey = []
  if (!scope) return console.error("Q has no valid target")
  if (scope.constructor !== Array) {
    scope = [scope]
    falsey = false
  }
  if (keys.constructor !== Array) keys = [keys]
  if (vals) {
    if (vals.constructor !== Array) {
      vals = [vals]
    }
    for (var i = 0; i < scope.length; i++) {
      let included = false
      for (var j = 0; j < keys.length; j++) {
        vals = vals.map(val => (val.constructor == Array ? val.join("") : val))
        included = matchStr(scope[i][keys[j]], vals, every) ? true : included
      }
      query = included ? query.concat(scope[i]) : query
    }
  } else query = scope.map(s => s[keys[0]])

  return query.length ? query : falsey
}

export function itemizeDeckList(list, filters, headers) {
  let itemized = []
  let remaining = list
  const filterFor = filters || ["name"]
  while (remaining.length) {
    const matches = remaining.filter(card => filterFor.every(f => card[f] === remaining[0][f]))
    remaining = remaining.filter(r => !matches.filter(c => c.key === r.key).length)
    itemized.push(matches)
  }
  return itemized
}

export function normalizePos(deck) {
  let zoneCards = ZONES.map(z => deck.filter(c => c.zone === z))
  for (var i = 0; i < zoneCards.length; i++) {
    zoneCards[i] = zoneCards[i].orderBy("order").map((c, i) => {
      c.order = i
      return c
    })
  }
  let slots = deck.filter(c => c.zone === "Battlefield")
  for (var i = 0; i < slots.length; i++) {
    let stacks = slots
      .filter(c => c.col === slots[i].col && c.row === slots[i].row)
      .sort((a, b) => (a.stack > b.stack ? 1 : -1))
    stacks = stacks.map((s, ind) => {
      s.stack = ind
      return s
    })
  }
  let notBF = deck
    .filter(c => c.zone !== "Battlefield")
    .map(c => {
      c.tapped = false
      c.counters = {}
      return c
    })
  return deck.filter(c => !(c.isToken && c.zone !== "Battlefield"))
}

export function isLegal(card = {legalities: {}}, format = "", deckIdentity) {
  let allowed = card.legalities[format] === "legal" ? 4 : card.legalities[format] === "restricted" ? 1 : 0

  if (format === "casual") {
    allowed = 4
  }
  if (Q(card, "type_line", ["Token", "Scheme", "Plane"])) allowed = 0
  if (SINGLETON(format)) {
    allowed = 1
  }
  if (NO_QUANT_LIMIT(card)) allowed = 1000000
  if (card.name === "Seven Dwarves") allowed = 7

  if (
    card.color_identity &&
    deckIdentity &&
    deckIdentity.length &&
    !card.color_identity.every(ci => deckIdentity.includes(ci))
  ) {
    allowed = 0
  }
  return allowed
}

export const audit = card => Object.assign(CONTROL_CARD, card)

export function filterColors(options, colorFilter, all, only) {
  const colorsF = COLORS("symbol").filter((co, i) => colorFilter[i])
  const filtered = options.filter(c => {
    const colorsC = (c.colors || []).length ? c.colors : ["C"]
    return (
      (all ? colorsF.every(co => colorsC.includes(co)) : colorsF.some(co => colorsC.includes(co))) &&
      (!only ||
        !colorsC.some(C =>
          COLORS("symbol")
            .filter(co => !colorsF.includes(co))
            .includes(C)
        ))
    )
  })

  console.log("filterSearch", options, filtered, "\ncolorFilter", colorFilter, "all", all, "only", only)
  return filtered
}

export const convertedSymbols = cost => {
  const symbols = cost.split("{").map(m => m.replace("}", "").replace("/", ""))
  symbols.shift()
  return [
    COLORS("symbol").map(C => symbols.filter(co => co === C).length),
    isNaN(symbols[0]) ? 0 : parseInt(symbols[0]),
  ]
}

export const optimizePrices = _ => {
  return null
}

export const filterCardType = (list, category, val) =>
  list.filter(c => {
    const cVal = category.subKey ? c[category.key][category.subKey] : c[category.key]
    return cVal === undefined
      ? false
      : !isNaN(parseFloat(cVal))
      ? parseFloat(cVal) <= val
      : Array.isArray(cVal)
      ? cVal.length
        ? cVal.join("") === val
        : "C" === val
      : Q(c, category.key, val)
  })

export const collapseDeckData = (list = []) => list.map((c = {}) => `${c.board}__ID__${c.id}`)

export const expandDeckData = (list = [], cardData = [{}]) =>
  list.map(l => {
    const id = l.slice(l.indexOf("ID__") + 4)
    const card = cardData.filter(d => d.id === id)[0] || {}
    const board = l.slice(0, l.indexOf("__ID"))
    return {...card, board}
  })

export const TCGplayerMassEntryURL = list => {
  const urlBase = `https://store.tcgplayer.com/massentry?productline=Magic&c=`
  const listUrl = itemizeDeckList(list)
    .map(l => `${l.length} ${l[0].name}`.replaceAll("/ /gi", "%20"))
    .join("||")
  return urlBase + listUrl
}
