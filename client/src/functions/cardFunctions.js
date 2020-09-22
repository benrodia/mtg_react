import axios from "axios"
import {CARD_TYPES, MAIN_BOARD, ZONES, COLORS} from "../constants/definitions"
import {advancedFields, illegalLayouts} from "../constants/data"
import {
  SINGLETON,
  NO_QUANT_LIMIT,
  MANA,
  NUM_FROM_WORD,
} from "../constants/greps"
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
  let allowed =
    card.legalities[format] === "legal" ||
    !card.legalities[format] ||
    format === "casual"
      ? 4
      : card.legalities[format] === "restricted" || SINGLETON(format)
      ? 1
      : 0

  if (
    Q(card, "layout", illegalLayouts) ||
    Q(card, "border_color", ["Silver", "Gold"]) ||
    card.set_type === "funny"
  )
    allowed = 0
  else if (NO_QUANT_LIMIT(card)) allowed = 1000
  else if (card.name === "Seven Dwarves") allowed = 7
  return allowed
}

export function filterColors(options, {terms}) {
  const clr = o =>
    terms.filter(f => f.trait === "color" && f.op === o).map(cl => cl.val)
  const filtered = options.filter(c => {
    const test = (c, clr) =>
      c.colors.includes(clr) || (clr === "C" && !c.colors.length)

    return (
      !clr("AND").length ||
      (clr("AND").every(cl => test(cl)) &&
        (!clr("OR").length || clr("OR").some(cl => test(cl))) &&
        (!clr("NOT").length || !clr("NOT").every(cl => test(cl))))
    )
  })
  return filtered
}

export const filterNumeric = (card, key, op, val) => {
  const cur = parseInt(card[key])
  return op === ">"
    ? cur > val
    : op === "<"
    ? cur < val
    : op === "="
    ? cur == val
    : op === ">="
    ? cur >= val
    : op === "<="
    ? cur <= val
    : true
}

export const filterAdvanced = (cards, advanced) => {
  if (!advanced) return cards
  const {terms} = advanced
  const fields = advancedFields.map(n => terms.filter(t => t.name === n.name))
  const filtered = filterColors(cards, advanced).filter((c, ci) => {
    const fmt = o => terms.filter(f => f.trait === "format" && f.op === o)

    return (
      isLegal(c) &&
      (!fmt("AND").length || fmt("AND").every(f => isLegal(c, f.val))) &&
      (!fmt("OR").length || fmt("OR").some(f => isLegal(c, f.val))) &&
      (!fmt("NOT").length || !fmt("NOT").every(f => isLegal(c, f.val))) &&
      fields.every((inField, i) => {
        const ofOP = op => inField.filter(f => f.op === op).map(f => f.val)
        const cur = advancedFields[i]
        return cur.numeric
          ? inField.every(({trait, op, val}) =>
              filterNumeric(c, trait, op, val)
            )
          : (!ofOP("AND").length || Q(c, cur.trait, ofOP("AND"), true)) &&
              (!ofOP("OR").length || Q(c, cur.trait, ofOP("OR"))) &&
              (!ofOP("NOT").length || Q(c, cur.trait, ofOP("NOT"), false))
      })
    )
  })
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
    const cVal = category.subKey
      ? c[category.key][category.subKey]
      : c[category.key]
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
  const allLegal = !itemizeDeckList(main).filter(
    cards => cards.length > isLegal(cards[0], format)
  ).length
  return atLimit && allLegal
}

export const listDiffs = (pre, post) => {
  const diffs = (a, b) => {
    const interp = itemizeDeckList(a, ["id"]).map(acs => {
      const card = acs[0]
      const quantity = Math.abs(
        acs.length - b.filter(({id}) => id === card.id).length
      )
      return {card, quantity}
    })
    let returned = []
    for (var i = 0; i < interp.length; i++)
      returned = [
        ...returned,
        ...[...Array(interp[i].quantity)].map(_ => interp[i].card),
      ]
    return returned
  }
  const added = diffs(post, pre)
  const removed = diffs(pre, post)
  return {added, removed, changed: !!added.length || !!removed.length}
}

export async function getArt(terms = {}) {
  const art = await axios
    .get(`https://api.scryfall.com/cards/random?q=is:highres+t:land`)
    .then(res => res.data.image_uris.art_crop)
  return art
}
