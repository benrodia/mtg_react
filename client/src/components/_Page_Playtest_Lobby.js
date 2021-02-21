import React, {useEffect} from "react"
import {useParams} from "react-router-dom"

import {connect} from "react-redux"
import actions from "../actions"

//Components
import TestCounters from "./TestCounters"
import Zone from "./Zone"
import TestControls from "./TestControls"
import TesterShortcuts from "./TesterShortcuts"
import TheStack from "./TheStack"
import BasicSearch from "./BasicSearch"
import utilities from "../utilities"

const {TOKEN_NAME, NUMBER_WORDS, titleCaps, pluralize} = utilities

export default connect(
  ({main: {tokens, decks}, playtest: {look}, deck: {list}}) => {
    return {tokens, look, list, decks}
  },
  actions
)(
  ({
    list,
    tokens,
    decks,

    look,
    startTest,
    spawnToken,
    handleShuffle,
    gameState,
    setPage,
    openDeck,
  }) => {
    const {slug} = useParams()
    useEffect(
      _ => {
        if (decks.length) openDeck(slug)
      },
      [slug, decks]
    )
    useEffect(
      _ => {
        if (list.length) startTest()
      },
      [list]
    )

    return (
      <div className="playtest-lobby section">
        <h1 className="block">Mtg Grip Playtester</h1>
        <div className="dash-buttons bar mini-spaced-bar">
          {[...Array(4)].map((_, i) => (
            <div className="dash-button">
              {titleCaps(NUMBER_WORDS[i + 1])} {pluralize("Player", i + 1)}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
