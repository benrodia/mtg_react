import {v4 as uuidv4} from "uuid"
import {COLORS, MAIN_BOARD, SIDE_BOARD} from "../constants/definitions"
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
        ? COLORS("symbol").map(co => (co === 5 ? 0 : NUM_FROM_WORD(c.oracle_text)))
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
          return {[l.toLowerCase()]: prop && prop.slice(prop.indexOf(":") + 1).trim()}
        })
      )
}

export const interpretForm = (text = "", cardData = [{}]) => {
  console.log(cardData)
  const items = text.split("\n")
  const interp = items
    .map((item, ind) => {
      let [quantity, spaces] = [1, item.split(" ")]
      for (var i = 0; i < spaces.length; i++)
        if (parseInt(spaces[i]) > 1) {
          quantity = parseInt(spaces[i])
          break
        }
      const setText = item.indexOf("[") ? item.slice(item.indexOf("[") + 1, item.indexOf("]")).toLowerCase() : " "

      const cards = cardData
        .filter(c => item.toLowerCase().includes(c.name.toLowerCase()))
        .sort((a, b) => (a.name.length < b.name.length ? 1 : -1))
      const card = cards.filter(c => c.set === setText)[0] || cards[0] || null

      return (
        card && {
          quantity,
          card: {
            ...card,
            commander: item.includes("CMDR: "),
            board: items.slice(0, ind).filter(it => it.includes("SB:")).length ? SIDE_BOARD : MAIN_BOARD,
          },
        }
      )
    })
    .filter(c => !!c)
  let returned = []
  for (var i = 0; i < interp.length; i++)
    returned = returned.concat([...Array(interp[i].quantity)].map(_ => interp[i].card))
  return returned
}

export const collapseDeckData = list => list.map(c => `${c.commander ? "Commander" : c.board}__ID__${c.id}`)

export const expandDeckData = (list = [], cardData = [{}]) =>
  list.map(l => {
    const card = cardData.filter(d => d.id === l.slice(l.indexOf("ID__") + 4))[0]
    const board = l.slice(0, l.indexOf("__ID"))
    const commander = l.includes("Commander")
    return {...audit(card), board: commander ? "Main" : board, commander, key: uuidv4()}
  })

export const TCGplayerMassEntryURL = list => {
  const urlBase = `https://store.tcgplayer.com/massentry?productline=Magic&c=`
  const listUrl = itemizeDeckList(list)
    .map(l => `${l.length} ${l[0].name}`.replaceAll("/ /gi", "%20"))
    .join("||")
  return urlBase + listUrl
}
