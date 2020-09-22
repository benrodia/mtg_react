import React, {useState, useRef, useEffect} from "react"
import axios from "axios"
import {connect} from "react-redux"
import actions from "../actions"

import DropSlot from "./DropSlot"
import Loading from "./Loading"
import CardControls from "./CardControls"
import Icon from "./Icon"
import utilities from "../utilities"

export default connect(({deck: {format}, main: {sets}}) => {
  return {format, sets}
}, actions)(({commander, callBack, format, sets}) => {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [typing, setTyping] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = _ => {
    setLoading(true)
    const terms = `f:${format}${
      commander ? "&is:commander" : ""
    }&order:edhrec&not:reprint&q=${encodeURIComponent(search)}`
    axios
      .get(`https://api.scryfall.com/cards/search?${terms}`)
      .then(res => {
        setLoading(false)
        setResults(res.data.data)
      })
      .catch(err => console.error(err))
  }

  const delaySearch = e => {
    setSearch(e.target.value)
    if (typing) clearTimeout(typing)
    setTyping(
      setTimeout(_ => (search.length ? fetchData() : setResults([])), 300)
    )
  }

  const option = o => (
    <span className="bar even search-cards mini-spaced-bar">
      <Icon
        name={o.set_name}
        className={`${o.rarity === "common" ? "" : o.rarity}`}
        loader={o.set}
        src={
          !sets.length
            ? null
            : sets.filter(s => s.name === o.set_name)[0].icon_svg_uri
        }
      />
      <div onClick={_ => callBack && callBack(o)}>
        <CardControls card={o} cardHeadOnly />
      </div>
    </span>
  )

  return (
    <div className="basic-search">
      <DropSlot callBack={c => callBack(c, null, true)}>
        <div className="search-bar bar even">
          <input
            type="text"
            value={search}
            onChange={e => delaySearch(e)}
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
        <div className={`results ${results.length || "hide"}`}>
          {loading ? <Loading /> : results.slice(0, 20).map(r => option(r))}
        </div>
      </DropSlot>
    </div>
  )
})
