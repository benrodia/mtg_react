import axios from "axios"
import stringSimilarity from "string-similarity"
import {CARD_TYPES, MAIN_BOARD, ZONES, COLORS} from "../constants/definitions"
import {advancedFields, illegalLayouts} from "../constants/data"
import {
  SINGLETON,
  NO_QUANT_LIMIT,
  MANA,
  NUM_FROM_WORD,
  ADVANCED_GREPS,
} from "../constants/greps"
import {matchStr, sum} from "../functions/utility"
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

export const getCardFace = card => {
  const {card_faces, flipped} = card
  const {mana_cost, name, type_line, oracle_text, power, toughness} = card_faces
    ? card_faces[flipped ? 1 : 0]
    : card
  const image_uris =
    card.image_uris ||
    (card_faces && card_faces[flipped ? 1 : 0].image_uris) ||
    {}
  return {
    ...card,
    mana_cost,
    name,
    type_line,
    oracle_text,
    power,
    toughness,
    image_uris,
  }
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

export const validCardObjects = cards =>
  cards.filter(
    card =>
      !(
        Q(card, "layout", illegalLayouts)
        // ||
        // Q(card, "border_color", ["Silver", "Gold"])
        // ||
        // !Object.values(card.legalities).filter(
        //   le => le === "legal" || le === "restricted"
        // ).length
        // card.set_type === "funny" ||
      )
  )

export function isLegal(card = {legalities: {}}, format = "", deckIdentity) {
  let allowed =
    card.legalities[format] === "legal" ||
    !card.legalities[format] ||
    format === "casual"
      ? 4
      : card.legalities[format] === "restricted" || SINGLETON(format)
      ? 1
      : 0

  if (NO_QUANT_LIMIT(card)) allowed = 1000
  else if (card.name === "Seven Dwarves") allowed = 7
  return allowed
}

export const convertTag = ({grep}) => {
  let newTerms = []
  const gs = Object.entries(grep).map(g => {
    const [name, ops] = g
    return Object.entries(ops).map(o => {
      const [op, vs] = o
      return vs.map(val => {
        const {trait, subTrait} =
          advancedFields.filter(a => a.name === name)[0] || {}
        const id = name + op + val
        newTerms.push({name, trait, subTrait, op, val, id})
        return
      })
    })
  })
  return newTerms
}

export const mapColors = list =>
  COLORS("symbol").map(s =>
    sum(
      list.map(
        c =>
          audit(c)
            .mana_cost.split("")
            .filter(i => i === s).length
      )
    )
  )

export const filterColors = (c, terms) => {
  let ors = 0
  const andNots = terms.every(({trait, op, val}) => {
    const test = _ =>
      c[trait] && (c[trait].length ? c[trait].includes(val) : val === "C")

    if (op === "AND") return test()
    else if (op === "NOT") return !test()
    else if (op === "OR") {
      if (test()) ors++
      return true
    }
  })
  return (!terms.find(t => t.op === "OR") || ors) && andNots
}

export const filterNumeric = (c, terms) =>
  terms.every(({trait, subTrait, op, val}) => {
    val =
      val === "POWER"
        ? c.power
        : val === "TOUGHNESS"
        ? c.toughness
        : val === "CMC"
        ? c.cmc
        : !isNaN(Number(val))
        ? Number(val)
        : parseInt(val)
    const tr = c[trait] && subTrait ? c[trait][subTrait] : c[trait]
    const cur = Array.isArray(tr) ? tr.length : Number(tr)
    if (cur)
      return op === ">"
        ? cur > val
        : op === "<"
        ? cur < val
        : op === "="
        ? cur === val
        : op === ">="
        ? cur >= val
        : op === "<="
        ? cur <= val
        : op === "!="
        ? cur !== val
        : true
    else return false
  })

export const filterAdvanced = (cards, termSets, some, none) => {
  return cards.filter(c => {
    const filt = terms =>
      advancedFields
        .map(n => terms.data.filter(t => t.trait === n.trait))
        .every((termsByField, i) => {
          const termsByOP = op =>
            termsByField
              .filter(f => f.op === op)
              .map(f => f.val.replace("~", c.name))
          const {numeric, colored, legality, trait, options} = advancedFields[i]

          return numeric
            ? filterNumeric(c, termsByField)
            : colored
            ? filterColors(c, termsByField)
            : legality
            ? termsByField.every(
                t =>
                  c.legalities[t.val] === t.op.toLowerCase().replace(" ", "_")
              )
            : (!termsByOP("AND").length ||
                Q(c, trait, termsByOP("AND"), true)) &&
              (!termsByOP("OR").length || Q(c, trait, termsByOP("OR"))) &&
              (!termsByOP("NOT").length || !Q(c, trait, termsByOP("NOT")))
        })
    return some
      ? termSets.some(terms => filt(terms))
      : none
      ? !termSets.every(terms => filt(terms))
      : termSets.every(terms => filt(terms))
  })
}

export const convertedSymbols = cost => {
  const symbols = cost.split("{").map(m => m.replace("}", "").replace("/", ""))
  symbols.shift()
  return [
    COLORS("symbol").map(C => symbols.filter(co => co === C).length),
    isNaN(symbols[0]) ? 0 : parseInt(symbols[0]),
  ]
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

export const listDiffs = (pre = [], post = [], filter) => {
  const allNames = pre
    .concat(post)
    .unique("name")
    .map(c => {
      const tot = o => o.filter(({name}) => name === c.name).length
      return {
        quantity: tot(post) - tot(pre),
        card: c,
      }
    })
    .filter(c => c.quantity !== 0)
  const flatten = arr =>
    arr.map(c => [...Array(Math.abs(c.quantity))].map(_ => c.card)).flat()

  let added = flatten(allNames.filter(a => a.quantity > 0))
  let removed = flatten(allNames.filter(a => a.quantity < 0))
  let changed = []
  for (var i = 0; i < added.length; i++) {
    const ch =
      removed.filter(
        r => r.name === added[i].name && added[i].set !== r.set
      )[0] || null
    if (ch) {
      changed.push({oldVer: ch, newVer: added[i]})
      added[i] = null
      removed = removed.filter(
        (_, i) => i !== removed.findIndex(r => r.id === ch.id)
      )
    }
  }

  return {
    added: added.filter(a => !!a),
    removed,
    changed,
  }
}

export async function getArt(terms = {}) {
  const art = await axios
    .get(`https://api.scryfall.com/cards/random?q=is:highres+t:land`)
    .then(({data}) => {
      const {image_uris} = data.card_faces ? data.card_faces[0] : data
      return image_uris.art_crop
    })
  return art
}

export const getTags = card =>
  ADVANCED_GREPS.filter(
    tag =>
      !!filterAdvanced([card], [{name: tag.name, data: convertTag(tag)}]).length
  )

export const getSimilarCards = (pool, model, returnNum = 3) => {
  const ranked = pool
    .map(card => {
      const c = getCardFace(card)
      const m = getCardFace(model)
      const strip = t =>
        (t.indexOf("(") < 0
          ? t
          : t.slice(0, t.indexOf("(")) + t.slice(t.indexOf(")") + 1)
        ).replace(c.name, m.name)

      const score =
        (c.color_identity &&
        ((!c.color_identity.length && !m.color_identity.length) ||
          c.color_identity.filter(co => m.color_identity.includes(co)).length)
          ? 2.5
          : 0) +
        (c.cmc === m.cmc ? 2.5 : 0) +
        (c.mana_cost === m.mana_cost ? 5 : 0) +
        (c.power && `${c.power}/${c.toughness}` === `${m.power}/${m.toughness}`
          ? 5
          : 0) +
        stringSimilarity.compareTwoStrings(c.type_line, m.type_line) * 5 +
        stringSimilarity.compareTwoStrings(c.name, m.name) * 15 +
        stringSimilarity.compareTwoStrings(
          strip(c.oracle_text),
          strip(m.oracle_text)
        ) *
          35
      return {card, weight: score / 70}
    })
    .filter(c => c.weight > 0.3 && c.card.name !== model.name)
    .orderBy("weight")
    .reverse()
  return ranked.slice(0, returnNum)
}
