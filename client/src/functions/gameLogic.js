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
  EFFECTS,
  NUM_FROM_WORD,
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
import {legendName} from "../functions/text"
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

export const chooseCommander = (card, list = []) => {
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
  let col,
    row = 0

  // const slot = r => {

  // }

  if (card.zone === "Library") dest = "Hand"
  else if (dblclick && card.zone === "Battlefield") dest = "Graveyard"
  else if (dblclick && card.zone === "Graveyard") dest = "Exile"
  else if (dblclick && card.zone === "Exile") dest = "Battlefield"
  else if (card.zone === "Hand" || card.zone === "Command") dest = "Battlefield"

  dest = toDest || dest
  if (dest == card.zone) return {card: null}
  else {
    col = col || inZone.filter(c => c.row === row).length % 8 // REPLACE 8 with dynamic cols
    if (Q(card, "type_line", "Creature")) row = 1
    else if (MANA.source(card)) row = 0
    else if (
      Q(card, "type_line", ["Artifact", "Enchantment", "Planeswalker"])
    ) {
      row = 1
      col = 8 - (inZone.filter(c => c.row === row).length % 8)
    }

    return {card, dest, col, row}
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
  seedCommanders,
  seedTags,
}) {
  const commanders =
    seedCommanders ||
    rnd(legalCommanders("commander", cardData, colors), 2, true)
  const colorI = seedCommanders.length
    ? seedCommanders
        .map(c => c.color_identity)
        .flat()
        .unique()
    : colors
  const cards = cardData.filter(
    c =>
      c.legalities[format || "commander"] === "legal" &&
      (c.color_identity.every(co => colorI.includes(co)) ||
        !c.color_identity.length)
  )
  let deck = []

  const filt = (type, quant, copies, tags = []) => {
    const tagged = filterAdvanced(cards, tags, true)
    const r = (l, q) =>
      rnd(
        Q(l, "type_line", ...type)
          .orderBy("edhrec_rank")
          .slice(0, Math.max(150, q)),
        q,
        true,
        deck
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
  deck = deck.concat(ramp)
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
  deck = deck.concat(removal)
  const value = filt(
    [["land"], false],
    11,
    Q(ADVANCED_GREPS, "name", ["tutor", "recursion", "draw"])
  )
  deck = deck.concat(value)
  const meat = filt([["land"], false], 30)
  deck = deck.concat(meat)

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

  deck = [
    ...commanders.map(com => {
      return {...com, commander: true}
    }),
    ...deck,
    ...filt([["land"]], 99 - deck.length - basics.length),
    ...basics,
  ]
    .filter(c => !!c)
    .slice(0, 100)

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
  const lines = c.oracle_text ? c.oracle_text.split("\n") : []
  const costs = csts =>
    csts.split(",").map(cost => {
      cost = cost.toLowerCase()

      let cst = {text: cost}

      if (cost.includes("{t}")) cst.tap = true
      else if (cost.includes("{")) cst.mana = cost
      else if (cost.includes("tap "))
        cst.select = {
          ...nums(cost),
          controller: "you",
          of:
            CARD_TYPES.find(CT => cost.includes(CT.toLowerCase())) ||
            "permanent",
          and: "tap",
        }
      else if (cost.includes(`sacrifice ${legendName(c.name)}`)) cst.sac = true
      else if (cost.includes("sacrifice")) {
        cst.select = {
          ...nums(cost),
          controller: "you",
          of:
            CARD_TYPES.find(CT => cost.includes(CT.toLowerCase())) ||
            "permanent",
          and: "sacrifice",
        }
      }

      return cst
    })
  const nums = ph => {
    ph = ph.toLowerCase()
    const amt = Math.max(
      NUM_FROM_WORD(ph, " a "),
      ph.includes(" x ") || ph.includes(" any number of ") ? 999 : 0,
      1
    )

    const min =
      ph.includes("up to") ||
      ph.includes(" x ") ||
      ph.includes(" any number of ")
        ? 0
        : amt
    return {amt, min}
  }

  const phrases = lines.map(l => {
    let phrase = {type: "state", cost: [], text: l, controller: c.controller}
    if (
      Q(c, "type_line", ["instant", "sorcery"]) ||
      l.includes(`when you cast ${legendName(c.name)}`)
    )
      phrase.type = "cast"
    phrase.cost = costs(c.mana_cost)

    if (l.includes("as an additional cost"))
      phrase.cost = [...phrase.cost, ...costs(l.slice(l.indexOf(", ")))]
    if (l.includes("you may") && l.includes("if you do,"))
      phrase.cost = costs(
        l.slice(l.indexOf("you may"), l.indexOf("if you do,"))
      )
    else if (l.indexOf("When") + 1 || l.indexOf("At the ") + 1) {
      phrase.type = "trigger"
      l = l.slice(0, l.indexOf(","))
      const who = SUBJECTS.filter(s => l.includes(s === "~" ? c.name : s))
      const when = TRIGGERS.filter(s => l.includes(s))

      phrase = {...phrase, who, when}
    } else if (l.indexOf(":") + 1) {
      phrase.type = "activate"
      const ct = l.slice(0, l.indexOf(":"))
      phrase.cost = costs(ct)
    }
    const sents = (phrase.type === "activate"
      ? l.slice(l.indexOf(":") + 1)
      : phrase.type === "trigger"
      ? l.slice(l.indexOf(",") + 1)
      : l
    )
      .toLowerCase()
      .split(".")
      .map(s =>
        s.split("then ").map(_ => _.split(" and ").map(_ => _.split(", ")))
      )
      .flat(3)
      .filter(r => r.trim().length)
      .unique()

    phrase.effects = sents.map(sent => {
      let eff = {text: sent}
      if (sent.includes("target") || sent.includes("choose")) {
        eff.select = {
          ...nums(sent),
          who: SUBJECTS.find(S => sent.includes(S)) || "you",
          and: EFFECTS.find(E => sent.includes(E)),
        }
      } else {
        eff = {
          ...eff,
          ...nums(sent),
          who: SUBJECTS.find(S => sent.includes(S)) || "you",
          and: EFFECTS.find(E => sent.includes(E)),
        }
      }

      return eff
    })
    return phrase
  })
  if (!phrases.find(ph => ph.type === "cast") && !c.type_line.includes("Land"))
    phrases.push({
      type: "cast",
      cost: costs(c.mana_cost),
    })
  return phrases
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
