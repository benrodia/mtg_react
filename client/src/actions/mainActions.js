import {v4 as uuidv4} from "uuid"
import axios from "axios"
import * as A from "./types"
import utilities from "../utilities"

const {
  Q,
  isLegal,
  expandDeckData,
  getDecks,
  validCardObjects,
  BREAKPOINTS,
  getAllCardTypes,
} = utilities

export const screenSize = width => (dispatch, getState) => {
  const bp = BREAKPOINTS.filter(bp => bp <= width).length
  const cur = getState().main.breakPoint
  if (cur !== bp) dispatch({type: A.MAIN, key: "breakPoint", val: bp})
}

export const getMousePos = pos => dispatch =>
  dispatch({type: A.MAIN, key: "pos", val: pos})

export const setCombos = combos => dispatch =>
  dispatch({type: A.MAIN, key: "cardCombos", val: combos})

export const getCardData = _ => (dispatch, getState) => {
  const {cardData, fetching} = getState().main
  if (!cardData.length && !fetching) {
    dispatch({type: A.MAIN, key: "fetching", val: true})
    axios
      .get(`https://api.scryfall.com/bulk-data/oracle_cards`)
      .then(res =>
        axios.get(res.data.download_uri).then(res =>
          dispatch({
            type: A.MAIN,
            key: "cardData",
            val: validCardObjects(res.data),
          })
        )
      )
      .catch(err => {
        dispatch({type: A.MAIN, key: "fetching", val: false})
        console.log(err)
      })
  }
}

export const getSetData = _ => dispatch => {
  axios
    .get(`https://api.scryfall.com/sets`)
    .then(res => dispatch({type: A.MAIN, key: "sets", val: res.data.data}))
    .catch(err => console.log(err))
}

export const getNameData = _ => dispatch => {
  axios
    .get(`https://api.scryfall.com/catalog/card-names`)
    .then(res => dispatch({type: A.MAIN, key: "cardNames", val: res.data.data}))
    .catch(err => console.log(err))
}

export const getLegalCards = (cards, format) => dispatch => {
  // const legal = cards.filter(c => isLegal(c, format, null) > 0)
  // dispatch({type: A.MAIN, key: "legalCards", val: legal})
}

// export const getTokens = cards => dispatch =>
//   dispatch({
//     type: A.MAIN,
//     key: "tokens",
//     val: cards.filter(c => Q(c, "type_line", "Token")),
//   })

export const getUsers = _ => dispatch => {
  axios
    .get("/api/users")
    .then(res => dispatch({type: A.MAIN, key: "users", val: res.data}))
    .catch(err => console.error(err))
}

export const loadDecks = val => (dispatch, getState) => {
  axios
    .get("/api/decks")
    .then(res => dispatch({type: A.MAIN, key: "decks", val: res.data}))
    .catch(err => console.error(err))
}

export const openModal = modal => dispatch =>
  dispatch({type: A.MAIN, key: "modal", val: modal})
export const newMsg = (message, type) => dispatch =>
  dispatch({type: A.NEW_MSG, val: {key: uuidv4(), message, type}})
export const refreshData = _ => dispatch => {
  getDecks().then(res => dispatch(loadDecks(res)))
}

export const setKeyThroughCardStack = stacks => dispatch =>
  dispatch({type: A.MAIN, key: "cardStack", val: stacks.flat().map(c => c.id)})

export const setCardPage = val => dispatch =>
  dispatch({type: A.MAIN, key: "cardPage", val})

export const setKeyThroughPointer = input => (dispatch, getState) => {
  const {cardStack, cardPointer} = getState().main
  const val =
    input === "ArrowDown"
      ? cardPointer + 1 > cardStack.length
        ? 0
        : cardPointer + 1
      : input === "ArrowUp"
      ? cardPointer + 1 > cardStack.length
        ? 0
        : cardPointer + 1
      : cardStack.indexOf(input)
  dispatch({type: A.MAIN, key: "cardPointer", val: input})
}

export const getFieldData = _ => dispatch => {
  getAllCardTypes().then(type_line =>
    axios
      .get(`https://api.scryfall.com/catalog/keyword-abilities`)
      .then(k =>
        axios.get(`https://api.scryfall.com/sets`).then(s =>
          dispatch({
            type: A.MAIN,
            key: "fieldData",
            val: {
              gotten: true,
              type_line,
              keywords: k.data.data,
              set_name: s.data.data.map(set => set.name),
            },
          })
        )
      )
      .catch(err => console.error(err))
  )
}
