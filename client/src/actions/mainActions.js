import {v4 as uuidv4} from "uuid"
import axios from "axios"
import * as A from "./types"
import utilities from "../utilities"

const {Q, isLegal, expandDeckData, getDecks} = utilities

export const setPage = page => dispatch => {
  dispatch({type: A.MAIN, key: "page", val: page})
  dispatch({type: A.MAIN, key: "modal", val: null})
}

export const loadAppData = _ => dispatch => {
  dispatch(getCardData())
  dispatch(getSetData())
  dispatch(getUsers())
}

export const getCardData = _ => dispatch => {
  axios
    .get(`https://api.scryfall.com/bulk-data/oracle_cards`)
    .then(res => axios.get(res.data.download_uri).then(res => dispatch({type: A.MAIN, key: "cardData", val: res.data})))
    .catch(err => console.log(err))
}

export const getSetData = _ => dispatch => {
  axios
    .get(`https://api.scryfall.com/sets`)
    .then(res => dispatch({type: A.MAIN, key: "sets", val: res.data}))
    .catch(err => console.log(err))
}

export const getLegalCards = (cards, format) => dispatch => {
  const legal = cards.filter(c => isLegal(c, format, null) > 0)
  dispatch({type: A.MAIN, key: "legalCards", val: legal})
}

export const getTokens = cards => dispatch =>
  dispatch({
    type: A.MAIN,
    key: "tokens",
    val: cards.filter(c => Q(c, "type_line", "Token")),
  })

export const getUsers = _ => dispatch => {
  axios
    .get("/api/users")
    .then(res => dispatch({type: A.MAIN, key: "users", val: res.data}))
    .catch(err => console.error(err))
}

export const loadDecks = val => (dispatch, getState) => {
  axios.get("/api/decks").then(res => dispatch({type: A.MAIN, key: "decks", val: res.data}))
}

export const openModal = modal => dispatch => dispatch({type: A.MAIN, key: "modal", val: modal})
export const newMsg = (message, type) => dispatch => dispatch({type: A.NEW_MSG, val: {key: uuidv4(), message, type}})
export const refreshData = _ => dispatch => {
  getDecks().then(res => dispatch(loadDecks(res)))
}
