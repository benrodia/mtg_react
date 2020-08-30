import {COLORS} from "../constants/definitions"
import {MANA, NUM_FROM_WORD} from "../constants/greps"

export default function receiveCards(deck, sleeve, isToken) {
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
