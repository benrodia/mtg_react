import {v4 as uuidv4} from "uuid"
import axios from "axios"
import * as A from "./types"

import {getLegalCards, newMsg, loadDecks} from "./mainActions"
import {updateUser} from "./authActions"
import {changeFilters} from "./filtersActions"
import {changeSettings} from "./settingsActions"
import utilities from "../utilities"
const {
  INIT_DECK_STATE,
  HOME_DIR,
  MAIN_BOARD,
  MAYBE_BOARD,
  SINGLETON,
  COLORS,
  isLegal,
  itemizeDeckList,
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
  keyInCards,
  mapColors,
  completeness,
} = utilities

export const newDeck = (
  author,
  {name, format, list, desc, feature, colors}
) => (dispatch, getState) => {
  if (author) {
    const slug = createSlug(name, getState().main.decks)
    if (getState().auth.isAuthenticated)
      axios
        .post(`/api/decks`, {
          author,
          name,
          format,
          list,
          slug,
          colors,
          feature,
        })
        .then(res => {
          dispatch(newMsg("CREATED DECK", "success"))
          dispatch(loadDecks())
          dispatch(openDeck(res.data))
        })
        .catch(err => console.error("COULD NOT CREATE DECK", err))
  }
}

export const openDeck = (slug, noView, player = 0, hand = []) => (
  dispatch,
  getState
) => {
  const {
    main: {decks},
    settings: {players},
    auth: {
      user: {_id},
    },
  } = getState()
  const deck = decks.find(d => d.slug === slug)
  if (deck && (canEdit(deck.author) || deck.privacy !== "Private")) {
    const recent = sessionStorage.getItem("viewed-recently") || ""
    if (!recent.includes(deck._id) && !noView && deck.author !== _id) {
      axios.patch(`/api/decks/${deck._id}`, {views: deck.views + 1})
      sessionStorage.setItem("viewed-recently", recent + "_" + deck._id)
      deck.views += 1
    }

    dispatch({
      type: A.DECK,
      val: {...deck, unsaved: {}, loading: true, list: []},
    })
    dispatch({type: A.SETTINGS, key: "editing", val: false})
    fetchCollection(deck.list).then(list => {
      const val = {...deck, list, loading: false}
      cache(A.DECK, "all", val)
      dispatch({
        type: A.DECK,
        val,
      })
      dispatch(changeFilters("tune", list.find(c => c.commander) || list[0]))
      console.log("OPEN", players, player)
      dispatch(
        changeSettings(
          "players",
          players.map((pl, i) => (i === player ? {...pl, deck: val, hand} : pl))
        )
      )
    })
  } else {
    cache(A.DECK, "all", INIT_DECK_STATE, false)
    dispatch({type: A.DECK, clear: true})
  }
}

export const changeDeck = (key, val) => (dispatch, getState) => {
  let deck = {...getState().deck}
  if (
    [
      "name",
      "feature",
      "format",
      "desc",
      "list",
      "privacy",
      "allow_suggestions",
      "custom",
      "suggestions",
    ].includes(key) &&
    deck[key] !== val
  )
    deck.unsaved[key] = deck[key]

  deck[key] = val
  cache(A.DECK, "all", deck)
  dispatch({type: A.DECK, val: deck})
}

export const saveDeck = revert => (dispatch, getState) => {
  let {
    _id,
    name,
    format,
    list,
    suggestions,
    feature,
    desc,
    allow_suggestions,
    privacy,
    custom,
    colors,
    unsaved,
    preferences,
  } = getState().deck

  const complete = completeness({name, list, desc, format}).every(
    ({v, s}) => v || s
  )

  if (canEdit()) {
    if (revert === true) dispatch({type: A.SAVE_DECK, val: unsaved})
    else {
      const updated = new Date()
      axios
        .patch(`/api/decks/${_id}`, {
          name,
          complete,
          suggestions,
          colors,
          list: collapseDeckData(list),
          updated,
          format,
          desc,
          allow_suggestions,
          privacy,
          custom,
          feature,
          preferences,
        })
        .then(res => {
          dispatch(newMsg("SAVED DECK", "success"))
          dispatch({type: A.SAVE_DECK, val: {updated, complete}})
          dispatch(loadDecks())
        })
        .catch(err => console.error(err))
    }
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
  if (canEdit(_id))
    axios
      .delete(`/api/decks/${_id}`, config(getState))
      .then(res => {
        dispatch(loadDecks())
        cache(A.DECK, "all", INIT_DECK_STATE)
        dispatch(openDeck(null))
        dispatch(newMsg("DELETED DECK"))
      })
      .catch(err => dispatch(newMsg("Problem deleting deck.", "error")))
}

export const changeCard = (card = {}, assign = {}) => (dispatch, getState) =>
  canEdit() &&
  dispatch(
    changeDeck(
      "list",
      getState().deck.list.map(c =>
        c.key === card.key ? {...card, ...assign} : c
      )
    )
  )

export const changeCustom = (name = {}, assign = {}) => (
  dispatch,
  getState
) => {
  const {custom} = getState().deck
  const ind = custom.findIndex(c => c.name === name)
  const newCustom =
    ind > -1
      ? custom.map((c, i) => (i === ind ? {...c, ...assign} : c))
      : [
          ...custom,
          {
            notes: "",
            category: null,
            name,
            ...assign,
          },
        ]
  dispatch(changeDeck("custom", newCustom))
}

export const addCard = (cards, board, remove, replace) => (
  dispatch,
  getState
) => {
  const {list} = getState().deck
  const newList = keyInCards(cards, board, remove, replace, list)
  dispatch(changeDeck("list", newList))
  dispatch(changeFilters("tune", newList[newList.length - 1]))
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
            ...changes,
            author: user._id,
            date: new Date(),
            added: collapseDeckData(changes.added),
            removed: collapseDeckData(changes.removed),
          },
        ],
      })
      .then(res => dispatch(newMsg("SUBMITTED SUGGESTION", "success")))
      .catch(err => dispatch(newMsg("PROBLEM SUBMITTING SUGGESTION", "error")))
}

export const resolveSuggestion = (id, as) => (dispatch, getState) => {
  const {
    main: {cardData},
    deck: {suggestions, list, allow_suggestions},
  } = getState()

  console.log("resolveSuggestion", suggestions)
  const {added, removed} = suggestions.find(ch => ch.id === id)

  const toAdd = added.map(add => cardData.find(c => c.name === add.name))
  const toRemove = removed.map(remove =>
    cardData.find(c => c.name === remove.name)
  )

  if (toAdd.length || toRemove.length) {
    if (as === "keep") {
      dispatch(addCard(toRemove, null, true))
      dispatch(addCard(toAdd))
    }
    if (as === "maybe") dispatch(addCard(toAdd, MAYBE_BOARD))

    dispatch(
      changeDeck(
        "suggestions",
        suggestions.map(s => (s.id !== id ? s : {...s, resolved: as}))
      )
    )
  }
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
      dispatch(newMsg(`Added ${deck.name} to "Liked Decks"`, "success"))
    } else {
      likes = Math.max(deck.likes - 1, 0)
      liked = user.liked.filter(l => l !== deck._id)
    }
    axios
      .patch(`/api/decks/${deck._id}`, {likes})
      .then(_ => axios.patch(`/api/users/${user._id}`, {liked}))
      .then(_ => {
        dispatch(changeDeck("likes", likes))
        dispatch(loadDecks())
        dispatch({type: A.USER, key: "liked", val: liked})
        dispatch(updateUser({liked}))
      })
  }
}
