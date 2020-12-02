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
  loadCache,
  fetchCollection,
} = utilities

export const newDeck = (author, {name, format, list, desc}) => (
  dispatch,
  getState
) => {
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

export const openDeck = slug => (dispatch, getState) => {
  const {decks} = getState().main
  const deck = decks.filter(d => d.slug === slug)[0]
  if (deck) {
    const recent = sessionStorage.getItem("viewed-recently") || ""
    if (!recent.includes(deck._id)) {
      axios.patch(`/api/decks/${deck._id}`, {views: deck.views + 1})
      sessionStorage.setItem("viewed-recently", recent + "_" + deck._id)
      deck.views += 1
    }

    fetchCollection(deck.list).then(list => {
      const val = {
        ...deck,
        list,
        preChanges: list,
        clone: null,
      }
      cache(A.DECK, "all", val)
      dispatch({type: A.DECK, val})
    })
  } else {
    cache(A.DECK, "all", INIT_DECK_STATE, false)
    dispatch({type: A.DECK, clear: true})
  }
}

export const changeDeck = (key, val) => (dispatch, getState) => {
  const deck = {...getState().deck}
  deck[key] = val
  cache(A.DECK, "all", deck)
  if (
    [
      "name",
      "format",
      "desc",
      "list",
      "privacy",
      "allow_suggestions",
      "published",
    ].includes(key)
  )
    deck.unsaved = true
  dispatch({type: A.DECK, val: deck})
}

// if (
//   key === "format" &&
//   val !== deck.format &&
//   deck.published &&
//   !canPublish(deck.list, key)
// ) {
//   if (
//     !window.confirm(
//       `Heads up! Your deck has cards/quantities not legal in "${titleCaps(
//         val
//       )}". It will be un-published if you change formats.`
//     )
//   )
//     return
//   deck.published = false
// }

export const saveDeck = _ => (dispatch, getState) => {
  let {
    _id,
    format,
    list,
    published,
    suggestions,
    feature,
    desc,
    allow_suggestions,
    privacy,
  } = getState().deck

  const colors = COLORS("symbol").map(s =>
    sum(list.map(c => c.mana_cost.split("").filter(i => i === s).length))
  )

  if (!canPublish(list, format)) published = false
  if (canEdit()) {
    const updated = new Date()
    axios
      .patch(`/api/decks/${_id}`, {
        published,
        suggestions,
        feature: feature.length
          ? feature
          : (list[0] && list[0].image_uris && list[0].image_uris.art_crop) ||
            "",
        colors,
        list: collapseDeckData(list),
        updated,
        format,
        desc,
        allow_suggestions,
        privacy,
      })
      .then(res => {
        dispatch(newMsg("SAVED DECK", "success"))
        dispatch({type: A.SAVE_DECK, val: updated})
        dispatch(loadDecks())
      })
      .catch(err => console.error(err))
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

export const changeCard = (card = {}, assign = {}) => (dispatch, getState) =>
  dispatch(
    changeDeck(
      "list",
      getState().deck.list.map(c =>
        c.key === card.key ? {...card, ...assign} : c
      )
    )
  )

export const addCard = (cards, board, remove, replace) => (
  dispatch,
  getState
) => {
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

export const submitSuggestion = changes => (dispatch, getState) => {
  const {
    deck: {_id, suggestions, author},
    auth: {user},
  } = getState()

  if (canSuggest())
    axios
      .patch(`/api/decks/${_id}`, {
        suggestions: [
          ...suggestions,
          {
            author: user._id,
            date: new Date(),
            changes: changes.map(c => {
              return {
                ...c,
                added: collapseDeckData([c.added])[0],
                removed: collapseDeckData([c.removed])[0],
              }
            }),
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
  const {added, removed} = suggestions
    .map(({changes}) => changes.filter(c => c.id === id)[0])
    .filter(s => !!s)[0]

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

export const giveLike = _ => (dispatch, getState) => {
  const {
    deck,
    auth: {isAuthenticated, user},
  } = getState()

  if (isAuthenticated && deck.author !== user._id) {
    let likes, liked
    if (!user.liked.includes(deck._id)) {
      likes = deck.likes + 1
      liked = [...user.liked, deck._id]
      dispatch(newMsg(`Liked ${deck.name}`, "success"))
    } else {
      likes = deck.likes - 1
      liked = user.liked.filter(l => l !== deck._id)
    }
    axios
      .patch(`/api/decks/${deck._id}`, {likes})
      .then(_ => axios.patch(`/api/users/${user._id}`, {liked}))
      .then(_ => {
        dispatch(changeDeck("likes", likes))
        dispatch({type: A.USER, key: "liked", val: liked})
      })
  }
}
