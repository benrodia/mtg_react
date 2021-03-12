import React, {useState, useRef, useEffect} from "react"
import axios from "axios"
import {Link, useHistory} from "react-router-dom"
import matchSorter, {rankings} from "match-sorter"
import {connect} from "react-redux"
import actions from "../actions"

import BasicSearch from "./BasicSearch"
import DropSlot from "./DropSlot"
import Loading from "./Loading"
import CardControls from "./CardControls"
import Icon from "./Icon"
import ToolTip from "./ToolTip"

import utilities from "../utilities"

const {HOME_DIR, legalCommanders, createSlug, creator} = utilities

export default connect(
  ({
    filters: {
      searchBy,
      advanced: {cart},
    },
    deck: {format},
    main: {sets, users, decks, cardData},
  }) => {
    return {searchBy, cart, format, sets, users, decks, cardData}
  },
  actions
)(
  ({
    commander,
    callBack,
    searchBy,
    cart,
    format,
    sets,
    users,
    decks,
    cardData,
    changeFilters,
    getCardData,
    addCard,
    changeAdvanced,
  }) => {
    const [search, setSearch] = useState("")
    const [results, setResults] = useState([])
    const [delay, setDelay] = useState(false)
    const [loading, setLoading] = useState(false)
    const [nav, setNav] = useState(null)
    useEffect(
      _ => {
        if (!cardData.length && !loading) {
          setLoading(true)
          getCardData()
        } else setLoading(false)
      },
      [cardData]
    )
    nav && useHistory().push(nav)

    const render = o =>
      o.object === "card" ? (
        <CardControls card={o} cardHeadOnly />
      ) : o.object === "user" ? (
        <ToolTip message={`User: ${o.name}`}>
          <Link
            to={`${HOME_DIR}/user/${o.slug}`}
            className="bar even mini-spaced-bar">
            <h2 className={`icon-user-circle-o`} />
            <h2>{o.name}</h2>
          </Link>
        </ToolTip>
      ) : (
        <ToolTip
          message={
            <div>
              <p>Deck: {o.name}</p> <p>Created by {creator(o.author).name}</p>
            </div>
          }>
          <Link
            to={`${HOME_DIR}/deck/${o.slug}`}
            className="bar even mini-spaced-bar">
            <h2>
              <Icon src={require("../imgs/icon-deck.svg")} />
            </h2>
            <h2>{o.name}</h2>
          </Link>
        </ToolTip>
      )
    return (
      <div className="quick-search">
        <div className={` bar even ${cardData.length || "disabled"}`}>
          <BasicSearch
            className="quick"
            searchable
            separate={"object"}
            limit={10}
            placeholder={cardData.length ? "Quick Search" : "Loading Data..."}
            options={[...users, ...decks, ...cardData]}
            renderAs={render}
            callBack={o =>
              setNav(
                `${HOME_DIR}/${o.object}/${o.slug || createSlug(o.name)}${
                  o.object === "card" ? "/info" : ""
                }`
              )
            }
          />
        </div>
      </div>
    )
  }
)
