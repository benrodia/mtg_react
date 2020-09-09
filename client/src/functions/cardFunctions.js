import {CARD_TYPES, MAIN_BOARD, ZONES, COLORS} from "../constants/definitions"
import {SINGLETON, NO_QUANT_LIMIT, MANA, NUM_FROM_WORD} from "../constants/greps"
import {matchStr} from "../functions/utility"
import {audit, itemizeDeckList} from "../functions/receiveCards"

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

  if (SINGLETON(format)) allowed = 1
  if (format === "casual") allowed = 4
  if (Q(card, "type_line", ["Token", "Scheme", "Plane "])) allowed = 0
  if (NO_QUANT_LIMIT(card)) allowed = 1000000
  if (card.name === "Seven Dwarves") allowed = 7

  // if (
  //   card.color_identity &&
  //   deckIdentity &&
  //   deckIdentity.length &&
  //   !card.color_identity.every(ci => deckIdentity.includes(ci))
  // ) allowed = 0

  return allowed
}

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

export const canPublish = (list, format) => {
  const main = list.filter(c => c.board === MAIN_BOARD)
  const atLimit = !SINGLETON(format) ? main.length >= 60 : main.length === 100
  const allLegal = !itemizeDeckList(main).filter(cards => cards.length > isLegal(cards[0], format)).length
  return atLimit && allLegal
}

export const listDiffs = (pre, post) => {
  const diffs = (a, b) => {
    const interp = itemizeDeckList(a, ["id"]).map(acs => {
      const card = acs[0]
      const quantity = Math.abs(acs.length - b.filter(({id}) => id === card.id).length)
      return {card, quantity}
    })
    let returned = []
    for (var i = 0; i < interp.length; i++)
      returned = [...returned, ...[...Array(interp[i].quantity)].map(_ => interp[i].card)]
    return returned
  }
  const added = diffs(post, pre)
  const removed = diffs(pre, post)
  return {added, removed, changed: !!added.length || !!removed.length}
}

export const getArt = (cards, terms = {}) => {
  const filters = Object.entries(terms)
  let selection = cards
  for (var i = 0; i < filters.length; i++) selection = Q(selection, ...filters[i])

  return selection
    .filter(s => !!s.highres_image && !!s.image_uris)
    .map(c => {
      return {artist: c.artist, image: c.image_uris.art_crop}
    })
}
