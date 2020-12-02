import React, {useState, useRef, useEffect} from "react"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {connect} from "react-redux"
import actions from "../actions"

import DropSlot from "./DropSlot"
import Loading from "./Loading"
import CardControls from "./CardControls"
import Icon from "./Icon"
import utilities from "../utilities"

const {legalCommanders} = utilities

export default connect(({deck: {format}, main: {sets, cardData}}) => {
  return {format, sets, cardData}
}, actions)(({commander, callBack, format, sets, cardData, getCardData}) => {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [delay, setDelay] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(
    _ => {
      if (!cardData.length) getCardData()
    },
    [cardData]
  )

  useEffect(_ => {
    const keyEvent = e => {
      if (e.key === "Escape") {
        setSearch("")
        setResults([])
      }
    }
    window.addEventListener("keydown", keyEvent)
    return _ => window.removeEventListener("keydown", keyEvent)
  }, [])

  useEffect(
    _ => {
      if (delay === false) {
        if (search.length > 2)
          setResults(
            matchSorter(
              commander ? legalCommanders(format, cardData) : cardData,
              search,
              {
                keys: [
                  "name",
                  {threshold: rankings.CONTAINS, key: "oracle_text"},
                  {threshold: rankings.WORD_STARTS_WITH, key: "type_line"},
                ],
              }
            )
          )
        else setResults([])
      }
    },
    [delay, search]
  )

  const delaySearch = e => {
    setSearch(e.target.value)
    clearTimeout(delay)
    setDelay(setTimeout(_ => setDelay(false), 300))
  }

  const option = o => (
    <span
      className="bar even search-cards mini-spaced-bar"
      onClick={_ => callBack && callBack(o)}>
      <CardControls card={o} cardHeadOnly desc />
    </span>
  )

  return (
    <div className="basic-search">
      <DropSlot callBack={c => callBack(c, null, true)}>
        <div className="search-bar bar even">
          <input
            type="text"
            value={search}
            onChange={delaySearch}
            placeholder={commander ? "Choose Commander" : "Search All Cards"}
          />
          <button
            className={`exit icon-cancel warning-button ${
              results.length || "hide"
            }`}
            onClick={_ => {
              setSearch("")
              setResults([])
            }}
          />
        </div>
        <div className={`results ${results.length || "hide"} flex-col`}>
          {loading ? <Loading /> : results.slice(0, 20).map(r => option(r))}
        </div>
      </DropSlot>
    </div>
  )
})
