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

import {TOKEN_NAME} from "../constants/greps"

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
      <div className="tester ">
        <TesterShortcuts />
        <TheStack />
        <Zone zone="Battlefield" key="Battlefield_ZONE" context="grid" />
        <div className="player-one-row">
          <div className="zones flex-row ">
            {!list.filter(c => c.commander).length ? null : (
              <Zone zone="Command" key="Command_ZONE" context="single" />
            )}

            <Zone zone="Exile" key="Exile_ZONE" context="single" header />
            <Zone
              zone="Graveyard"
              key="Graveyard_ZONE"
              context="single"
              header
            />
            <div className="library-cont">
              <Zone zone="Library" context="single" header={true} />
            </div>
            <Zone zone="Hand" key="Hand_ZONE" context="list" header />
          </div>
        </div>
        <TestCounters />
      </div>
    )
  }
)
