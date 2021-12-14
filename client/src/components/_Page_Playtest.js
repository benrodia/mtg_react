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
import Loading from "./Loading"

import utilities from "../utilities"
const {TOKEN_NAME, NUMBER_WORDS} = utilities

export default connect(
  ({main: {tokens, decks}, playtest: {players, first_seat, second_seat}}) => {
    return {tokens, players, first_seat, second_seat}
  },
  actions
)(
  ({
    tokens,
    decks,
    players,
    first_seat,
    second_seat,
    startTest,
    spawnToken,
    handleShuffle,
    gameState,
    setPage,
    openDeck,
  }) => {
    useEffect(_ => {
      startTest()
    }, [])

    const PlayerRow = ({seat}) => {
      const P2 = seat === second_seat
      return (
        <div className={`player-row col player-${P2 ? "two" : "one"}-row`}>
          <Zone P2={P2} zone={"Battlefield"} context={"grid"} />
          <TestCounters P2={P2} />
          <div className="zones flex-row ">
            {!players[seat].deck.filter(c => c.commander).length ? null : (
              <Zone P2={P2} zone={"Command"} context="single" />
            )}
            <Zone P2={P2} zone={"Exile"} context="single" header />
            <Zone P2={P2} zone={"Graveyard"} context="single" header />
            <Zone P2={P2} zone={"Library"} context="single" header={true} />
            <Zone P2={P2} zone={"Hand"} context="list" header />
          </div>
        </div>
      )
    }

    return (
      <div className="tester ">
        <TesterShortcuts />
        <TestControls />
        <TheStack />
        {players.length > 1 ? <PlayerRow seat={second_seat} /> : null}
        {players.length ? <PlayerRow seat={first_seat} /> : <Loading />}
      </div>
    )
  }
)
