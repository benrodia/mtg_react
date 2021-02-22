import axios from "axios"
import {v4 as uuidv4} from "uuid"
import {paginate} from "./utility"
import {
  CARD_TYPES,
  COLORS,
  MAIN_BOARD,
  SIDE_BOARD,
} from "../constants/definitions"
import {MANA, NUM_FROM_WORD} from "../constants/greps"
import {CONTROL_CARD} from "../constants/data"

export const audit = card => Object.assign(CONTROL_CARD, card)

export const itemizeDeckList = (list = [], filters, headers) => {
  let itemized = []
  let remaining = [...list]
  const filterFor = filters || ["name"]
  while (remaining.length) {
    const matches = remaining.filter(card =>
      filterFor.every(f => card[f] === remaining[0][f])
    )
    remaining = remaining.filter(
      r => !matches.filter(c => c.id === r.id).length
    )
    itemized.push(matches)
  }
  return itemized
}

export function prepForPlaytest(deck, sleeve, isToken) {
  const list = isToken ? [deck] : [...deck.filter(c => c.board === "Main")]

  return list.map((c, i) =>
    Object.assign(c, {
      key: isToken ? "token_" + Math.random() : "card_" + i,
      zone: isToken ? "Battlefield" : c.commander ? "Command" : "Library",
      order: i,
      row: 1,
      col: 0,
      counters: {},
      tapped: false,
      face_down: false,
      flipped: false,
      sickness: true,
      mana_source: !MANA.source(c)
        ? false
        : MANA.any(c)
        ? COLORS("symbol").map(co =>
            co === 5 ? 0 : NUM_FROM_WORD(c.oracle_text)
          )
        : COLORS("symbol").map(co => MANA.amt(c, co)),
      isToken,
    })
  )
}

export const fileMeta = text => {
  const metaLines = text.split("\n").filter(r => r.slice(0, 2).includes("//"))
  return !metaLines.length
    ? {}
    : Object.assign(
        ...["NAME", "CREATOR", "FORMAT"].map(l => {
          const prop = metaLines.filter(m => m.includes(l))[0]
          return {
            [l.toLowerCase()]: prop && prop.slice(prop.indexOf(":") + 1).trim(),
          }
        })
      )
}

// const cardNames = await axios
//   .get(`https://api.scryfall.com/catalog/card-names`)
//   .then(res => {
//     return items
export const interpretForm = (text = "", cardData, list, sets) => {
  let normal = []
  let toFetch = []

  const expand = its => {
    let returned = []
    for (var i = 0; i < its.length; i++)
      returned = returned.concat(
        [...Array(its[i].quantity)].map(_ => its[i].card)
      )
    return returned
  }

  const items = text.split("\n")
  for (var i = 0; i < items.length; i++) {
    const item = items[i]
    let quantity = parseInt(item, 10) || 1
    const setText =
      item.indexOf("[") < 0
        ? null
        : item.slice(item.indexOf("[") + 1, item.indexOf("]")).toLowerCase()

    let card =
      cardData
        .filter(({name}) => item.toLowerCase().includes(name.toLowerCase()))
        .sort((a, b) => (a.name.length > b.name.length ? -1 : 1))[0] || null

    if (card) {
      card = {
        ...card,
        commander: item.includes("CMDR: "),
        board: item.includes("SB:") ? SIDE_BOARD : MAIN_BOARD,
      }

      if (
        setText &&
        sets &&
        sets.filter(s => s.code === setText).length &&
        setText !== card.set
      ) {
        const inList = list.find(c => c.name === card.name && c.set === setText)
        if (inList) normal.push({quantity, card: inList})
        else toFetch.push({quantity, card})
      } else normal.push({quantity, card})
    }
  }

  let final = expand(normal)
  if (toFetch.length)
    fetchCollection(expand(toFetch)).then(
      fetched => (final = [...final, ...fetched])
    )

  console.log("INTERP", normal, toFetch, final)
  return final
}

// {
//       ...card,
//       commander: item.includes("CMDR: "),
//       board: items.slice(0, ind).filter(it => it.includes("SB:")).length
//         ? SIDE_BOARD
//         : MAIN_BOARD,
//     }

export const collapseDeckData = (list = []) =>
  list.map(({id, set, name, board, commander}) => {
    let c = {id, set, name}
    if (board !== MAIN_BOARD) c.board = board
    if (commander) c.commander = true
    return c
  })

export async function fetchCollection(list) {
  if (!list.length) return []
  const segments = paginate(
    list
      .flat()
      .filter(_ => _.id !== "UNKNOWN_ID")
      .map(c => {
        return {id: c.id}
      }),
    75
  )
  console.log("fetchCollection", segments)
  let gotten = []
  for (var i = 0; i < segments.length; i++) {
    const get = await axios.post(
      `https://api.scryfall.com/cards/collection`,
      {identifiers: segments[i]},
      {headers: {"Content-Type": "application/json"}}
    )
    gotten = [...gotten, ...get.data.data]
  }
  const fetched = list
    .map(({id, board, commander}) => {
      let m = gotten.find(g => g.id === id)
      if (!!m) m = {...m, board: board || MAIN_BOARD, commander, key: uuidv4()}
      return m
    })
    .filter(c => !!c)
  return fetched
}

export const keyInCards = (cards, board, remove, replace, list) => {
  if (!Array.isArray(cards)) cards = [cards]
  const newCard = card => {
    const c = audit(card)
    return {
      ...c,
      customField: c.customField || null,
      board: board || c.board || MAIN_BOARD,
      commander: false,
      key: "CardID__" + uuidv4(),
    }
  }
  const newList = remove
    ? list.filter(l => cards.filter(card => l.key !== card.key).length)
    : replace
    ? cards.map(card => newCard(card))
    : [...list, ...cards.map(card => newCard(card))]
  return newList
}

export const TCGplayerMassEntryURL = list => {
  const urlBase = `https://store.tcgplayer.com/massentry?productline=Magic&c=`
  const listUrl = itemizeDeckList(list)
    .map(l => `${l.length} ${l[0].name}`.replaceAll("/ /gi", "%20"))
    .join("||")
  return urlBase + listUrl
}

export async function getAllCardTypes() {
  const supertypes = ["Basic", "Legendary", "Snow"]
  const types = [
    "creature",
    "land",
    "planeswalker",
    "artifact",
    "enchantment",
    "spell",
  ]
  const all = Promise.all(
    types.map(type =>
      axios
        .get(`https://api.scryfall.com/catalog/${type}-types`)
        .then(res => res.data.data)
    )
  ).then(res => CARD_TYPES.concat(supertypes, ...res))

  return all
}
