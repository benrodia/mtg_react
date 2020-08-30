import {v4 as uuidv4} from "uuid"
import axios from "axios"
import store from "../store"
import * as A from "./types"
import {getDecks} from "./authActions"
import utilities from "../utilities"

const {Q, isLegal} = utilities

export const setPage = page => dispatch => {
  dispatch({type: A.MAIN, key: "page", val: page})
  dispatch({type: A.MAIN, key: "modal", val: null})
}

export const loadAppData = _ => dispatch => {
  dispatch(getCardData())
  dispatch(getSetData())
  dispatch(getDecks())
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
  dispatch(newMsg(`${legal.length} cards legal in ${format}.`, "success"))
  dispatch({type: A.MAIN, key: "legalCards", val: legal})
}

export const getTokens = cards => dispatch =>
  dispatch({
    type: A.MAIN,
    key: "tokens",
    val: cards.filter(c => Q(c, "type_line", "Token")),
  })
export const openModal = modal => dispatch => dispatch({type: A.MAIN, key: "modal", val: modal})
export const newMsg = (message, type) => dispatch => dispatch({type: A.NEW_MSG, val: {key: uuidv4(), message, type}})

export const viewUser = user => (dispatch, getState) => {
  console.log("openUser", user)
  dispatch({type: A.MAIN, key: "viewUser", val: user})
}
