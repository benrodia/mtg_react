import {v4 as uuidv4} from "uuid"
import {useHistory} from "react-router-dom"
import axios from "axios"
import * as A from "./types"

import {getLegalCards, newMsg, loadDecks} from "./mainActions"
import utilities from "../utilities"
const {
  INIT_DECK_STATE,
  HOME_DIR,
  MAIN_BOARD,
  MAYBE_BOARD,
  COLORS,
  sum,
  audit,
  cache,
  expandDeckData,
  collapseDeckData,
  createSlug,
  config,
  canPublish,
  titleCaps,
  canEdit,
  areFriends,
  canSuggest,
  creator,
} = utilities

export const openDeck = slug => (dispatch, getState) => {
  const {decks, cardData} = getState().main
  const deck = decks.filter(d => d.slug === slug)[0]
  if (deck) {
    deck.list = !deck.list[0] ? [] : deck.list[0].name ? deck.list : expandDeckData(deck.list, cardData)
    deck.preChanges = deck.list
    deck.clone = null
    dispatch({type: A.DECK, val: deck})
    cache(A.DECK, "all", deck)
    axios.patch(`/api/decks/${deck._id}`, {views: deck.views + 1})
  }
}

export const changeDeck = (key, val) => (dispatch, getState) => {
  let {
    deck,
    main: {cardData},
  } = getState()

  if (key === "format" && val !== deck.format) {
    if (deck.published && !canPublish(deck.list, key)) {
      if (
        !window.confirm(
          `Heads up! Your deck has cards/quantities not legal in "${titleCaps(
            val
          )}". It will be un-published if you change formats.`
        )
      )
        return
      axios.patch(`/api/decks/${deck._id}`, {format: val, published: false})
      dispatch(getLegalCards(cardData, val))
      deck.published = false
    } else {
      axios.patch(`/api/decks/${deck._id}`, {[key]: val})
      dispatch(getLegalCards(cardData, val))
    }
  } else if (["name", "desc", "published", "privacy", "helpWanted", "feature"].includes(key))
    axios.patch(`/api/decks/${deck._id}`, {[key]: val})

  deck[key] = val

  cache(A.DECK, "all", deck)
  dispatch({type: A.DECK, val: deck})
}

export const changeCard = (card = {}, assign = {}) => (dispatch, getState) =>
  dispatch(
    changeDeck(
      "list",
      getState().deck.list.map(c => (c.key === card.key ? {...card, ...assign} : c))
    )
  )

export const addCard = (cards, board, remove, replace) => (dispatch, getState) => {
  const {list} = getState().deck
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
  dispatch(
    changeDeck(
      "list",
      remove
        ? list.filter(l => cards.filter(card => l.key !== card.key).length)
        : replace
        ? cards.map(card => newCard(card))
        : [...list, ...cards.map(card => newCard(card))]
    )
  )
}

export const giveLike = _ => (dispatch, getState) => {
  const {
    deck,
    auth: {
      user: {_id, liked, isAuthenticated},
    },
  } = getState()

  if (isAuthenticated && deck.author !== _id) {
    if (!liked.includes(deck._id))
      axios
        .patch(`/api/decks/${deck._id}`, {likes: deck.likes + 1})
        .then(_ => axios.patch(`/api/users/${_id}`, {liked: [...liked, deck._id]}))
    else
      axios
        .patch(`/api/decks/${deck._id}`, {likes: deck.likes - 1})
        .then(_ => axios.patch(`/api/users/${_id}`, {liked: liked.filter(l => l !== deck._id)}))
  }
}

export const updateDeckList = confirmed => (dispatch, getState) => {
  let {
    deck: {_id, format, list, preChanges, published, suggestions, feature},
  } = getState()

  const colors = COLORS("symbol").map(s => sum(list.map(c => c.mana_cost.split("").filter(i => i === s).length)))

  if (!canPublish(list, format)) published = false
  if (canEdit() && confirmed)
    axios
      .patch(`/api/decks/${_id}`, {
        published,
        suggestions,
        feature:
          feature && feature.length ? feature : (list[0] && list[0].image_uris && list[0].image_uris.art_crop) || "",
        colors,
        list: collapseDeckData(list),
        updated: new Date(),
      })
      .then(res => dispatch(newMsg("UPDATED DECKLIST", "success")))
      .catch(err => console.error(err))
  dispatch(changeDeck("preChanges", list))
}

export const newDeck = (author, {name, format, list, desc}) => (dispatch, getState) => {
  if (author) {
    const slug = createSlug(name, getState().main.decks)
    axios
      .post(`/api/decks`, {author, name, format, list, slug})
      .then(res => {
        dispatch(newMsg("CREATED DECK", "success"))
        dispatch(loadDecks())
        dispatch(openDeck(res.data))
      })
      .catch(err => console.error("COULD NOT CREATE DECK", err))
  }
}

export const cloneDeck = _ => (dispatch, getState) => {
  const {
    auth: {
      user: {_id},
    },
    main: {decks},
    deck: {name, format, list, slug, author},
  } = getState()
  const oc = creator(author)
  axios
    .post(`/api/decks`, {
      name: name + " Copy",
      slug: createSlug(name + " Copy", decks),
      author: _id,
      format,
      list: collapseDeckData(list),
      desc:
        oc._id === _id
          ? "Cloned my own deck"
          : `Cloned from [${name}](${HOME_DIR}/deck/${slug}) by [${oc.name}](${HOME_DIR}/user/${oc.slug}).`,
    })
    .then(res => {
      dispatch(newMsg("CLONED DECK", "success"))
      dispatch(changeDeck("clone", res.data.slug))
    })
    .catch(err => console.error("COULD NOT CLONE DECK", err))
}

export const deleteDeck = _id => (dispatch, getState) => {
  if (window.confirm("Delete Deck?")) {
    axios
      .delete(`/api/decks/${_id}`, config(getState))
      .then(res => {
        dispatch(loadDecks())
        cache(A.DECK, "all", INIT_DECK_STATE)
        dispatch({type: A.DECK, val: INIT_DECK_STATE})
        dispatch(newMsg("DELETED DECK"))
      })
      .catch(err => dispatch(newMsg("Problem deleting deck.", "error")))
  }
}

export const submitSuggestion = changes => (dispatch, getState) => {
  const {
    deck: {_id, suggestions, author},
    auth: {user},
  } = getState()

  console.log("SUBMITTING", changes, canSuggest())
  if (canSuggest())
    axios
      .patch(`/api/decks/${_id}`, {
        suggestions: [
          ...suggestions,
          {
            author: user._id,
            date: new Date(),
            changes,
          },
        ],
      })
      .then(res => dispatch(newMsg("SUBMITTED SUGGESTION", "success")))
      .catch(err => dispatch(newMsg("PROBLEM SUBMITTING SUGGESTION", "error")))
}

export const resolveSuggestion = (id, as) => (dispatch, getState) => {
  const {
    deck: {suggestions, list},
  } = getState()
  const {added, removed} = suggestions.map(({changes}) => changes.filter(c => c.id === id)[0]).filter(s => !!s)[0]

  if (as === "keep") {
    dispatch(addCard(removed, null, true))
    dispatch(addCard(added))
  }
  if (as === "maybe") dispatch(addCard(added, MAYBE_BOARD))

  dispatch(
    changeDeck(
      "suggestions",
      suggestions
        .map(s => {
          return {...s, changes: s.changes.filter(c => c.id !== id)}
        })
        .filter(s => s.changes.length)
    )
  )
}
