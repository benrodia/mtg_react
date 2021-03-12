// Constants
import * as A from "./types"

//Functions
import attack from "../functions/attack"
import payMana from "../functions/payMana"

import {newMsg} from "./mainActions"

import utilities from "../utilities"

const {
  Q,
  q,
  normalizePos,
  playLand,
  clickPlace,
  pluralize,
  formatText,
  effectText,
  cardMoveMsg,
  paidCostMsg,
  TOKEN_NAME,
  PHASES,
  MANA,
  // WHEN,
  ENTERS_TAPPED,
  ENTERS_COUNTERS,
  IS_SPELL,
  IS_PERMANENT,
  HAS_FLASH,
  CAN_TAP,
  FOR_EACH,
  NUMBER_WORDS,
  wrapNum,
  rnd,
  prepForPlaytest,
} = utilities

// PLAYTESTER

export const gameState = (key, val, addTo, player) => dispatch =>
  dispatch({type: A.PLAYTEST, key, val, bool: addTo, player})
export const addHistory = msg => dispatch =>
  dispatch({type: A.HISTORY, val: msg})
export const timeTravel = index => dispatch =>
  dispatch({type: A.TIME_TRAVEL, val: index})

export const cardState = (card, key, val) => dispatch =>
  dispatch({
    type: A.CARD,
    cards: Array.isArray(card) ? card : [card],
    val: {[key]: val},
  })

export const untap = _ => dispatch =>
  dispatch({type: A.CARD, val: {tapped: false}})
export const handleMana = (mana, replace, player) => dispatch =>
  dispatch({type: A.HANDLE_MANA, val: mana, bool: replace, player})
export const handleShuffle = (player, init) => dispatch => {
  dispatch({type: A.SHUFFLE, player, init})
  dispatch(addHistory(`P${(player || 0) + 1} Shuffle Library`))
}
export const goToPhase = (name, noDraw) => dispatch => {
  const next = PHASES.includes(name)
    ? name
    : PHASES[wrapNum(PHASES.indexOf(name) + 1, PHASES.length)]
  dispatch(handleMana())
  dispatch({type: A.PLAYTEST, key: "phase", val: next})
  dispatch(checkTriggers(next))
  dispatch(addHistory(`Go to ${next}`))
  if (next === "Draw" && !noDraw) dispatch(moveCard())
}

export const spawnToken = token => dispatch =>
  dispatch({type: A.TOKEN, val: token})

export const switchSeats = (first, second) => (dispatch, getState) => {
  const {first_seat, second_seat} = getState().playtest
  const f = first || second_seat
  const s = second || first_seat === f ? wrapNum(f + 1) : first_seat
  dispatch({
    type: A.PLAYTEST,
    apply: {
      first_seat: f,
      second_seat: s,
    },
  })
}

let canRestart = true

const drawHands = player => (dispatch, getState) => {
  const players = getState().settings.players.filter(p => p.type !== "---")
  canRestart = true

  let kept = 0
  const deal = (num = 7, to = player) => {
    const {deck} = getState().playtest.players[to]
    const rand = [...deck]
      .filter(c => !c.commander)
      .shuffle()
      .slice(-num)

    const seed = (players[to].hand || [])
      .map(h => deck.find(s => s.key === h.key))
      .filter(c => !!c)

    const hand = num < 7 ? rand : [...seed, ...rand.slice(0, num - seed.length)]

    console.log("deal", seed, hand)

    const keep = _ => {
      for (var i = 0; i < hand.length; i++)
        dispatch(moveCard({card: hand[i], player: to}, true))

      dispatch(addHistory(`P${to + 1} Draw Opening Hand (${num})`))

      if (++kept < players.length) deal(7, wrapNum(to + 1, players.length))
      else {
        dispatch(switchSeats(player))
        dispatch(handleTurns(player, players.length === 2))
      }
    }

    dispatch(
      addStack({
        text: `P${to + 1} Opening Hand (${num})`,
        cards: hand,
        options: [
          {
            effect: `Keep Hand`,
            res: _ => {
              if (num < 7) {
                const top = [...deck].shuffle()[0]
                dispatch(
                  addStack({
                    text: "Resolve Scry",
                    options: [
                      {
                        effect: "Top",
                        res: _ => {
                          dispatch(moveCard({card: top, dest: "Library"}))
                          keep()
                        },
                      },
                      {
                        effect: "Bottom",
                        res: _ => {
                          dispatch(
                            moveCard({card: top, bottom: true, dest: "Library"})
                          )
                          keep()
                        },
                      },
                    ],
                    cards: [top],
                  })
                )
              } else keep()
            },
          },
          {
            res: _ => deal(num - 1 || 1, to),
            effect: `Mulligan to ${num - 1 || 1}`,
          },
        ],
      })
    )
  }
  deal()
}

export const startTest = _ => (dispatch, getState) => {
  if (canRestart) {
    canRestart = false
    const {
      settings: {players},
      deck: {format},
    } = getState()
    const pl = players.filter(p => p.type === "HMN" && p.deck._id)
    if (pl.length) {
      dispatch({type: A.INIT_GAME, players: pl, format})
      if (pl.length === 1) dispatch(drawHands(0))
      else {
        dispatch(
          addStack({
            text: `Choose who plays first. ${
              players.length === 2
                ? "(That player won't draw during their first turn.)"
                : ""
            }`,
            options: [
              ...pl.map((p, i) => {
                return {
                  res: _ => {
                    dispatch(drawHands(i))
                  },
                  effect: `P${i + 1}`,
                }
              }),
              {
                effect: "High Roll",
                res: _ => {
                  const pl = rnd(players.length)
                  dispatch(
                    newMsg(`P${pl + 1} got the high roll. They go first.`)
                  )
                  dispatch(drawHands(pl))
                },
              },
            ],
          })
        )
      }
    }
  }
}

export const moveCard = (payload, bypass) => (dispatch, getState) => {
  const {players, active} = getState().playtest
  const {player, card, dest, col, row, bottom} = payload || {}
  const pl = player || (card && card.owner) || active
  const inLibrary = players[pl].deck.filter(c => c.zone === "Library")
  const toMove = card !== undefined ? card : inLibrary[inLibrary.length - 1]
  const toDest = dest || "Hand"
  if (!toMove) return console.error("no card to move")
  const interZone = toMove.zone !== toDest

  const resolveMove = _ => {
    const {deck, look} = players[pl]
    if (toMove.zone !== "Library")
      dispatch({type: A.PLAYTEST, key: "look", val: 0})
    if (look && (toDest !== toMove.zone || bottom))
      dispatch({type: A.PLAYTEST, key: "look", val: look - 1})

    dispatch({
      type: A.CARD,
      player: pl,
      cards: [toMove],
      val: {
        col:
          col >= 0
            ? col
            : deck.filter(c => c.zone === toDest && c.row === row).length,
        row: row || 0,
        stack: deck.filter(
          c => c.zone === toDest && c.row === row && c.col === col
        ).length,
        order: bottom ? 0 : deck.filter(c => c.zone === "Library").length - 1,
        zone:
          toDest === "Battlefield" && !IS_PERMANENT(toMove)
            ? "Graveyard"
            : toDest,
        face_down: toDest === "Library",
        tapped: ENTERS_TAPPED(toMove),
        counters: ENTERS_COUNTERS(toMove),
      },
    })
    if (interZone) {
      dispatch(checkTriggers("enter", toDest, toMove))
      dispatch(checkTriggers("leave", toMove.zone, toMove))
      if (!bypass) dispatch(addHistory(cardMoveMsg(toMove, toDest)))
    }
  }

  if (
    !bypass &&
    interZone &&
    toDest === "Battlefield" &&
    getState().playtest.stack.length &&
    !HAS_FLASH(toMove)
  )
    dispatch(
      newMsg(
        "Can't use sorcery-speed actions when there are items on the stack.",
        "error"
      )
    )
  else if (IS_SPELL(toMove) && toDest === "Battlefield") {
    dispatch(
      addStack({
        cards: [toMove],
        script: toMove.scripts.find(scr => scr.type === "cast"),
        cancelable: true,
        src: toMove.name,
        effectType: "Spell",
        options: [
          {
            effect: "Cast Spell",
            confirm: true,
            res: _ => {
              dispatch(checkTriggers("cast"))
              resolveMove()
            },
          },
        ],
      })
    )
  } else resolveMove()
}

export const cardClick = (card, dblclick, toDest) => (dispatch, getState) => {
  const {players, active, first_seat, second_seat} = getState().playtest
  const deck = players[first_seat].deck

  if (card.owner === first_seat) {
    if (card.zone === "Battlefield" && !dblclick) {
      if (MANA.source(card) && CAN_TAP(card))
        for (let i = 0; i < card.mana_source.length; i++)
          if (card.mana_source[i]) {
            dispatch(
              handleMana(
                card.mana_source.map((co, ind) => (ind === i ? co : 0))
              )
            )
            break
          }
      return dispatch(cardState(card, "tapped", !card.tapped))
    }
    dispatch(
      moveCard(
        clickPlace(
          card,
          deck.filter(c => c.zone === "Battlefield"),
          toDest,
          dblclick
        )
      )
    )
  }
}

export const handleTurns = (player, first) => (dispatch, getState) => {
  const {turn, stack, players, active} = getState().playtest
  if (!stack.length && !!turn) dispatch(goToPhase("End"))
  dispatch({type: A.NEW_TURN, player})
  dispatch(
    addHistory(
      `P${wrapNum(active + 1, players.length) + 1} Untap Turn ${turn + 1}`
    )
  )
  dispatch(goToPhase("Upkeep"))
  dispatch(goToPhase("Draw", first))
  dispatch(goToPhase("Main One"))
}

export const landDrop = _ => (dispatch, getState) => {
  const {players, first_seat} = getState().playtest
  dispatch(cardClick(playLand(players[first_seat].deck)))
}

export const payCost = ({mana, life, player, sac}, test) => (
  dispatch,
  getState
) => {
  const {players, first_seat} = getState().playtest
  const paidMana = payMana(mana, player)
  const paidLife = (life || 0) >= players[player || first_seat].life
  if (paidMana && !test) {
    dispatch(newMsg(paidCostMsg(paidMana), "success"))
    dispatch(cardState(paidMana.tapped, "tapped", true))
    dispatch(handleMana(paidMana.mana, true))
  }
}

export const handleCombat = creatures => (dispatch, getState) => {
  const {deck, phase, second_seat} = getState().playtest
  if (phase === "Main One") {
    dispatch(goToPhase("Combat"))
    dispatch(
      addStack({
        options: [
          {
            effect: "Attack All",
            res: _ => {
              const attackers =
                creatures ||
                deck.filter(
                  c =>
                    c.type_line.includes("Creature") &&
                    !c.type_line.includes("Wall") &&
                    CAN_TAP(c)
                )
              const result = attack(attackers)
              if (result) {
                dispatch(
                  newMsg(
                    `Attacked with ${
                      NUMBER_WORDS[result.tapped.length]
                    } ${pluralize("creature", result.tapped.length)} for ${
                      result.total
                    } damage!`,
                    "success"
                  )
                )
                dispatch(cardState(result.tapped, "tapped", true))
                dispatch(gameState("life", -result.total, true, second_seat))
                dispatch(goToPhase("Main Two"))
              }
            },
          },
          {effect: "No Attacks", res: _ => dispatch(goToPhase("Main Two"))},
        ],
      })
    )
  }
}

export const addStack = ({
  options,
  effectType,
  src,
  text,
  cancelable,
  cards,
  script,
}) => (dispatch, getState) => {
  const stacktion = {
    options: [
      ...(options || []).map(op => {
        return {
          res: op.res,
          color: op.color || "success",
          effect: op.effect || "Mark Resolved",
        }
      }),
      cancelable
        ? {
            color: "error",
            effect: "Cancel",
          }
        : null,
    ].filter(op => !!op),
    effectType: effectType || "Action",
    text: text || "",
    src: src || "Game",
    cards,
    script,
  }
  if (getState().settings.use_stack.includes(stacktion.effectType))
    dispatch({type: A.ADD_STACK, val: stacktion})
  else if (typeof stacktion.options[0].res === "function")
    stacktion.options[0].res()
}

export const resStack = res => dispatch => dispatch({type: A.RES_STACK})

export const checkTriggers = (type, zone, card = {}) => (
  dispatch,
  getState
) => {
  const {players, active} = getState().playtest
  const deck = players[card.owner || 0].deck
  const triggerers = players
    .map(pl => pl.deck)
    .flat()
    .filter(c =>
      c.scripts.some(
        scr =>
          scr.type === "trigger" &&
          (scr.effectiveIn === c.zone || c.zone === "Battlefield")
      )
    )
  for (var i = 0; i < triggerers.length; i++) {
    const scripts = triggerers[i].scripts.filter(
      scr =>
        scr.when &&
        scr.when.includes(type) &&
        scr.who &&
        Q(
          card,
          ["type_line", "name"],
          scr.who.map(w => (w === `~` ? card.name : w))
        )
    )
    console.log("script", scripts)

    for (var j = 0; j < scripts.length; j++)
      dispatch(
        addStack({
          src: triggerers[i].name,
          text: scripts[j].text,
          effectType: "Triggered Ability",
          script: scripts[i],
          cancelable: true,
        })
      )
  }
}

export const toggleHand = current => dispatch =>
  dispatch({type: A.PLAYTEST, key: "hideHand", val: !current})

export const execEffect = script => (dispatch, getState) => {}

// options: [
//   {
//     res: _ => {
//       // dispatch(handleCost({mana: c.mana_cost}))
//       resolveMove()
//       dispatch(checkTriggers("Cast", c))
//     },
//     cost: c.mana_cost,
//     effect: payMana(c.mana_cost)
//       ? formatText(`Cast for ${c.mana_cost}`)
//       : "Cast Without Paying",
//   },
// ],

// const inPlay = deck.filter(c => c.zone === "Battlefield")

// const executeAbilities = obj => {
//   const effects = Object.entries(obj.effect).map(ef => {
//     return [ef[0], (ef[1] && FOR_EACH(obj.text, deck)) || ef[1]]
//   })
//   const text = obj.text
//   const res = _ => {
//     for (let i = 0; i < effects.length; i++) {
//       let [key, val] = effects[i]
//       if (val !== 0) {
//         const takeEffect = setInterval(_ => {
//           if (!--val) clearInterval(takeEffect)
//           if (Object.keys(players[active]).includes(key))
//             dispatch(gameState(key, 1, true))
//           if (key === "draw") dispatch(moveCard(null, true))
//           if (key === "mill") dispatch(moveCard({dest: "Graveyard"}, true))
//           if (key === "exile") dispatch(moveCard({dest: "Exile"}, true))
//         }, 100)
//       }
//     }
//   }
//   dispatch(
//     addStack({
//       text: obj.text,
//       effectType: "Triggered Ability",
//       options: [{res, effect: effectText(effects, "token")}],
//       src: obj.src,
//       cancelable: true,
//     })
//   )
// }

// const phrase =
//   type === "Battlefield"
//     ? "enters the battlefield"
//     : type === "Graveyard" && card.zone === "Battlefield"
//     ? "dies"
//     : type === "Graveyard" && card.zone === "Hand"
//     ? "discard"
//     : undefined

// if (phrase) {
//   if (WHEN(card, phrase).self) executeAbilities(WHEN(card, phrase))
//   for (let j = 0; j < inPlay.length; j++)
//     if (Q(card, "type_line", WHEN(inPlay[j], phrase).types))
//       executeAbilities(WHEN(inPlay[j], phrase))
// }
