import {v4 as uuidv4} from "uuid"
import {COLORS} from "../constants/definitions"
import {MANA, NUM_FROM_WORD} from "../constants/greps"
import {CONTROL_CARD} from "../constants/data"

export const audit = card => Object.assign(CONTROL_CARD, card)

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

export function receiveCards(deck, sleeve, isToken) {
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
        ? COLORS("symbol").map(co => (co === 5 ? 0 : NUM_FROM_WORD(c.oracle_text)))
        : COLORS("symbol").map(co => MANA.amt(c, co)),
      isToken,
    })
  )
}

export const collapseDeckData = (list = []) => list.map((c = {}) => `${c.board}__ID__${c.id}`)

export const expandDeckData = (list = [], cardData = [{}]) =>
  list.map(l => {
    const id = l.slice(l.indexOf("ID__") + 4)
    const card = cardData.filter(d => d.id === id)[0] || {}
    const board = l.slice(0, l.indexOf("__ID"))
    return {...audit(card), board, key: uuidv4()}
  })

export const TCGplayerMassEntryURL = list => {
  const urlBase = `https://store.tcgplayer.com/massentry?productline=Magic&c=`
  const listUrl = itemizeDeckList(list)
    .map(l => `${l.length} ${l[0].name}`.replaceAll("/ /gi", "%20"))
    .join("||")
  return urlBase + listUrl
}
