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
const {TOKEN_NAME, NUMBER_WORDS} = utilities

export default connect(
  ({main: {tokens, decks}, settings: {players}, deck: {list}}) => {
    return {tokens, players, list, decks}
  },
  actions
)(
  ({
    list,
    tokens,
    decks,
    players,
    startTest,
    spawnToken,
    handleShuffle,
    gameState,
    setPage,
    openDeck,
  }) => {
    useEffect(
      _ => {
        players.length && startTest()
      },
      [players]
    )

    const PlayerRow = ({seat}) => (
      <div className={`player-row col player-${NUMBER_WORDS[seat + 1]}-row`}>
        <Zone P2={seat > 0} zone={"Battlefield"} context={"grid"} />
        <TestCounters P2={seat > 0} />
        <div className="zones flex-row ">
          {!list.filter(c => c.commander).length ? null : (
            <Zone P2={seat > 0} zone={"Command"} context="single" />
          )}
          <Zone P2={seat > 0} zone={"Exile"} context="single" header />
          <Zone P2={seat > 0} zone={"Graveyard"} context="single" header />
          <Zone P2={seat > 0} zone={"Library"} context="single" header={true} />
          <Zone P2={seat > 0} zone={"Hand"} context="list" header />
        </div>
      </div>
    )

    return (
      <div className="tester ">
        <TesterShortcuts />
        <TestControls />
        <TheStack />
        {players.length > 1 ? <PlayerRow seat={1} /> : null}
        <PlayerRow seat={0} />
      </div>
    )
  }
)
