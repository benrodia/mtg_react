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

export function itemizeDeckList(list, filters, headers) {
  let itemized = []
  let remaining = list
  const filterFor = filters || ["name"]
  while (remaining.length) {
    const matches = remaining.filter(card =>
      filterFor.every(f => card[f] === remaining[0][f])
    )
    remaining = remaining.filter(
      r => !matches.filter(c => c.key === r.key).length
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

export async function interpretForm(text = "") {
  const items = text.split("\n")
  const cardNames = await axios
    .get(`https://api.scryfall.com/catalog/card-names`)
    .then(res => {
      const names = res.data.data
      return items
        .map((item, ind) => {
          let [quantity, spaces] = [1, item.split(" ")]
          for (var i = 0; i < spaces.length; i++)
            if (parseInt(spaces[i]) > 1) {
              quantity = parseInt(spaces[i])
              break
            }
          const setText = item.indexOf("[")
            ? item.slice(item.indexOf("[") + 1, item.indexOf("]")).toLowerCase()
            : " "
          let name = names
            .filter(n => item.includes(n))
            .sort((a, b) => (a.length > b.length ? 1 : -1))[0]

          return (
            !!name && {
              quantity,
              card: {
                name,
                commander: item.includes("CMDR: "),
                board: items.slice(0, ind).filter(it => it.includes("SB:"))
                  .length
                  ? SIDE_BOARD
                  : MAIN_BOARD,
              },
            }
          )
        })
        .filter(c => !!c)
    })
  let returned = []
  for (var i = 0; i < cardNames.length; i++)
    returned = returned.concat(
      [...Array(cardNames[i].quantity)].map(_ => cardNames[i].card)
    )
  return returned
}

export const collapseDeckData = (list = []) =>
  list.map(({id, set, name, board, commander}) => {
    let c = {id, set, name}
    if (board !== MAIN_BOARD) c.board = board
    if (commander) c.commander = true
    return c
  })

export async function fetchCollection(list) {
  if (!list.length) return []
  const segments = paginate(list.unique("id"), 75)
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
      let m = gotten.filter(g => g.id === id)[0]
      if (!!m) m = {...m, board: board || MAIN_BOARD, commander, key: uuidv4()}
      return m
    })
    .filter(c => !!c)
  return fetched
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
