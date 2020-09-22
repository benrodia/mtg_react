import {v4 as uuidv4} from "uuid"
import {Q} from "./cardFunctions"
import {COLORS, CARD_TYPES, ZONES, MAIN_BOARD} from "../constants/definitions"
import {TUTOR, MANA, SAC_AS_COST} from "../constants/greps"
import {audit} from "../functions/receiveCards"

export function playLand(deck) {
  return (
    deck.filter(c => c.zone === "Hand" && c.type_line.includes("Land"))[0] ||
    false
  )
}

export function getColorIdentity(list, key) {
  let colors = []
  for (var i = 0; i < list.length; i++) {
    if (list[i][key]) {
      for (var j = 0; j < list[i][key].length; j++) {
        if (!colors.includes(list[i][key][j])) colors.push(list[i][key][j])
      }
    }
  }
  return colors
}

export const chooseCommander = (card, list) => {
  const commanders = list.filter(c => c.commander)
  const partners =
    commanders.length &&
    Q([commanders[0], card], "oracle_text", "partner").length === 2 &&
    !Q([commanders[0], card], "oracle_text", "partner with").length &&
    commanders[0].name !== card.name

  const add = card => {
    list = [
      ...list,
      {
        ...audit(card),
        commander: true,
        board: MAIN_BOARD,
        key: "CardID__" + uuidv4(),
        customField: "unsorted",
      },
    ]
  }

  // if (Q(card, "oracle_text", "Partner with")) {
  //   const partnerName = card.oracle_text.substr(12, card.oracle_text.indexOf("(") - 12).trim()
  //   if (list.filter(c => c.name === partnerName).length)
  //     list = list.map(c => (c.name === partnerName ? {...c, commander: true} : c))
  //   else {
  //     list = list.filter(c => !c.commander)
  //     add(legalCards.filter(c => c.name === partnerName)[0])
  //   }
  // }
  if (!partners) list = list.filter(c => !c.commander)
  else if (commanders.length > 1)
    list = list.filter(c => c.key !== commanders[0].key)
  add(card)
  return list
}

export function legalCommanders(format, legalCards) {
  let legalCommanders = []
  if (format === "commander" && legalCards.length) {
    legalCommanders = Q(
      legalCards,
      "type_line",
      ["Legendary", "Creature"],
      true
    ).concat(Q(legalCards, "oracle_text", "can be your commander"))
  } else if (format === "brawl" && legalCards.length) {
    legalCommanders = Q(
      legalCards,
      "type_line",
      ["Legendary", "Creature"],
      true
    ).concat(Q(legalCards, "type_line", "Planeswalker"))
  }
  return legalCommanders
}

export function tutorableCards(card, deck) {
  let tutorable = []
  let dest = "Hand"
  let from = "Battlefield"
  let sac = false

  if (Q(card, ...TUTOR(""))) {
    const searchText = card.oracle_text
      .toLowerCase()
      .slice(
        card.oracle_text.toLowerCase().indexOf("search your library") + 19,
        card.oracle_text.toLowerCase().indexOf("shuffle")
      )
    dest = ZONES.filter(z => searchText.includes(z.toLowerCase()))[0]

    const searchForType = [
      ...COLORS("basic"),
      ...CARD_TYPES.map(C => (C === "Land" ? "Basic" : C)),
    ]

    if (Q(card, ...SAC_AS_COST(card.name))) sac = true

    for (var i = 0; i < searchForType.length; i++) {
      if (searchText.includes(searchForType[i].toLowerCase())) {
        tutorable = tutorable.concat(
          Q(
            deck.filter(c => c.zone === "Library"),
            "type_line",
            searchForType[i]
          )
        )
      }
    }
    tutorable = tutorable.unique("name")
  }
  return {cards: tutorable, dest: dest, from: from, sac: sac}
}

export function clickPlace(card, inZone, toDest, dblclick) {
  let dest = card.zone
  let col, row

  if (card.zone === "Library") dest = "Hand"
  else if (dblclick && card.zone === "Battlefield") dest = "Graveyard"
  else if (dblclick && card.zone === "Graveyard") dest = "Exile"
  else if (dblclick && card.zone === "Exile") dest = "Battlefield"
  else if (card.zone === "Hand" || card.zone === "Command") dest = "Battlefield"

  dest = toDest || dest
  if (dest == card.zone) return {card: null}
  else {
    if (Q(card, "type_line", "Creature")) row = 1
    else if (MANA.source(card)) row = 0
    else if (Q(card, "type_line", "Artifact")) row = 2
    else if (Q(card, "type_line", ["Enchantment", "Planeswalker"])) row = 2
    else if (Q(card, "type_line", "Land")) row = 0

    col = col || inZone.filter(c => c.row === row).length % 8 // REPLACE 8 with dynamic cols

    return {card: card, dest: dest, col: col, row: row}
  }
}

export function guessCustomField(card) {
  const fields = ""
}
