import {v4 as uuidv4} from "uuid"
import {COLORS, CARD_TYPES, ZONES, MAIN_BOARD} from "../constants/definitions"
import {
  TUTOR,
  MANA,
  SAC_AS_COST,
  ADVANCED_GREPS,
  IS_SPELL,
  TRIGGERS,
  SUBJECTS,
} from "../constants/greps"
import {
  Q,
  filterAdvanced,
  convertTag,
  getSimilarCards,
  getTags,
  mapColors,
} from "../functions/cardFunctions"
import {audit} from "../functions/receiveCards"
import {sum, rnd, average} from "../functions/utility"

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
  if (legalCommanders("commander", [card]).length) {
    const commanders = list.filter(c => c.commander)

    const partners =
      commanders.length &&
      Q([commanders[0], card], "oracle_text", "partner").length === 2 &&
      !Q([commanders[0], card], "oracle_text", "partner with").length &&
      commanders[0].name !== card.name

    if (!partners)
      list = list.map(c => {
        return {...c, commander: false}
      })
    list = !!list.find(c => c.key === card.key)
      ? list.map(c => (c.key === card.key ? {...c, commander: true} : c))
      : [
          ...list,
          {
            ...card,
            commander: true,
            board: MAIN_BOARD,
            key: "CardID__" + uuidv4(),
          },
        ]
  }

  return list
}

export function legalCommanders(format, legalCards, colors) {
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
  if (colors)
    legalCommanders = legalCommanders.filter(
      c =>
        c.color_identity.length === colors.length &&
        c.color_identity.every(ci => colors.includes(ci))
    )
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

export async function generateRandomDeck({
  format,
  colors,
  cardData,
  termSets,
  seedCommander,
  seedTags,
}) {
  const commander =
    seedCommander || rnd(legalCommanders("commander", cardData, colors))
  const colorI = seedCommander ? seedCommander.color_identity : colors
  const cards = cardData.filter(
    c =>
      c.legalities[format || "commander"] === "legal" &&
      (c.color_identity.every(co => colorI.includes(co)) ||
        !c.color_identity.length)
  )

  const filt = (type, quant, copies, tags = []) => {
    const tagged = filterAdvanced(cards, tags, true)
    const r = (l, q) =>
      rnd(
        Q(l, "type_line", ...type)
          .orderBy("edhrec_rank")
          .slice(0, Math.max(150, q)),
        q,
        true
      )
    return tagged.length < quant
      ? [...tagged, ...r(cards, quant - tagged.length)]
      : r(tagged, quant)
  }
  const ramp = filt(
    [["land"], false],
    11,
    Q(ADVANCED_GREPS, "name", ["mana fixing", "land ramp", "mana rock"])
  )
  const removal = filt(
    [["land"], false],
    11,
    Q(ADVANCED_GREPS, "name", [
      "counter",
      "destroy",
      "board wipe",
      "grave hate",
      "discard",
      "land hate",
    ])
  )
  const value = filt(
    [["land"], false],
    11,
    Q(ADVANCED_GREPS, "name", ["tutor", "recursion", "draw"])
  )
  const meat = filt([["land"], false], 30)
  const basics = COLORS()
    .filter(CO => colorI.includes(CO.symbol))
    .map(CO =>
      [
        ...Array(
          Math.floor(Math.floor(35 - colorI.length * 5) / colorI.length || 1)
        ),
      ].map(_ => cards.find(c => c.name === CO.basic))
    )
    .flat()

  const spells = [commander, ...meat, ...removal, ...ramp, ...value].filter(
    c => !!c
  )
  const lands = [
    ...filt([["land"]], 99 - spells.length - basics.length),
    ...basics,
  ]
  const deck = [...spells, ...lands]
  console.log("deck", deck)
  return deck
}

export const evalSymbols = list => {
  const symbols = COLORS("symbol").map(
    s =>
      sum(
        list.map(c => {
          const tot = audit(c)
            .mana_cost.split("")
            .filter(i => i === s).length
          return !tot
            ? 0
            : sum([...Array(tot)].map((_, i) => 1 / (i + 1))) + 1 / c.cmc
        })
      ) / list.length
  )
  return symbols
}

export const evalSources = list => {
  const sources = COLORS().map(CO => {
    const output = o =>
      o.filter(
        l =>
          (l.produced_mana && l.produced_mana.includes(CO.symbol)) ||
          Q(l, "oracle_text", ["search", CO.basic])
      ).length
    const land = output(Q(list, "type_line", "land"))
    const ramp = output(
      list.filter(
        c =>
          c.cmc < 4 &&
          getTags(c).find(t =>
            ["Mana Dork", "Mana Rock", "Land Ramp"].includes(t.name)
          )
      )
    )
    const dig =
      list.filter(
        c =>
          c.cmc < 4 &&
          getTags(c).find(t => ["Dig", "Cantrip", "Tutor"].includes(t.name))
      ).length *
      (2 / list.length)
    return ((land + ramp + dig) * 4) / list.length
  })
  return sources
}

export const getDeckDynamics = list => {
  const scoreL = ["S", "A", "B", "C", "D", "E", "F"]
  const land = Q(list, "type_line", ["land"])
  const nonland = Q(list, "type_line", ["land"], false)
  const src = evalSources(list)
  const sym = evalSymbols(list)

  const score = (base, ideal, scale = 1) => {
    const val = Math.round(Math.abs(base - ideal) * scale)
    return {
      num: base.toFixed(2),
      ideal,
      letter: scoreL[Math.min(val, scoreL.length - 1)],
    }
  }

  const result = {
    curve: score(average(nonland.map(nl => nl.cmc)), 2.5),
    landRatio: score(
      land.length / list.length,
      average(nonland.map(nl => nl.cmc / 10)) + 0.1,
      10
    ),
    tapLands: score(
      land.filter(l => getTags(l).find(t => t.name === "Enter Tapped")).length,
      0,
      0.3
    ),
    colorFix: COLORS("name").reduce(
      (acc, curr, i) => ((acc[curr] = score(src[i] * sym[i] * 10, 10)), acc),
      {}
    ),
  }
  console.log("getDeckDynamics", result)
  return result
}

export const parsePhrases = c => {
  const lines = c.oracle_text.split("\n")
  const phrases = lines.map(l => {
    let phrase = {}

    if (Q(c, "type_line", ["instant", "sorcery"])) phrase.trigger = "cast"
    else if (l.indexOf("When") + 1) {
      phrase.trigger = "trigger"
      l = l.slice(l.indexOf("When"), l.indexOf(","))
      const subjects = SUBJECTS.filter(s => l.includes(s === "~" ? c.name : s))
      const predicates = TRIGGERS.filter(s => l.includes(s))

      phrase = {...phrase, subjects, predicates}
    }
    phrase.effects = ""

    return phrase
  })
  return phrases.filter(p => p.trigger)
}

// export const castability = (card, list) => {}

// const seedTags = rnd(
//   ADVANCED_GREPS.filter(G => G.type !== "faction"),
//   3
// ).map(G => {
//   return {name: G.name, data: convertTag(G)}
// })

// .map(c => [...Array(Math.floor(copies))].map(_ => c))
// .flat()

// const lands = colors
//   .map(co =>
//     filt(
//       [["basic", COLORS("basic")[COLORS("symbol").indexOf(co)]], true],
//       1,
//       20 / (colors.length || 1)
//     )
//   )
//   .flat()

// const creatures = filt([["creature"]], 10, 2)
// const spells = filt([["creature", "land"], false], 10, 2)
