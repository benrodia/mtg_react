import {v4 as uuidv4} from "uuid"
import {useHistory} from "react-router-dom"
import axios from "axios"

// Constants
import * as A from "./types"

import {updateDeck} from "./authActions"
import {getLegalCards} from "./mainActions"
import utilities from "../utilities"
const {HOME_DIR, MAIN_BOARD, audit, cache, expandDeckData} = utilities

export const openDeck = slug => (dispatch, getState) => {
  const deck = getState().main.decks.filter(d => d.slug === slug)[0]
  if (deck) {
    console.log("OPEN DECK", deck)
    cache(A.DECK, "all", deck)
    dispatch({type: A.DECK, val: deck})
  }
}

export const changeDeck = (key, val) => (dispatch, getState) => {
  let update = {...getState().deck}
  if (key === "format" && val !== update.format) dispatch(getLegalCards(getState().main.cardData, val))

  update[key] = val

  cache(A.DECK, "all", update)
  dispatch({type: A.DECK, val: update})
}

export const changeCard = (card = {}, assign = {}) => (dispatch, getState) =>
  dispatch(
    changeDeck(
      "list",
      getState().deck.list.map(c => (c.key === card.key ? {...card, ...assign} : c))
    )
  )

export const addCard = (cards, board, remove, replace) => (dispatch, getState) => {
  const state = {...getState()}
  if (cards.constructor !== Array) cards = [cards]
  const newCard = card => {
    return {
      ...audit(card),
      customField: card.customField || null,
      board: board || card.board || MAIN_BOARD,
      commander: card.commander || false,
      key: "CardID__" + uuidv4(),
    }
  }
  const list = remove
    ? state.deck.list.filter(l => cards.filter(card => l.key !== card.key).length)
    : replace
    ? cards.map(card => newCard(card)).filter(c => !!c)
    : [...state.deck.list, ...cards.map(card => newCard(card)).filter(c => !!c)]
  dispatch(changeDeck("list", list))
}
