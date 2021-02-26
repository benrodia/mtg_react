import React, {useEffect, useState} from "react"
import {useParams, NavLink, useHistory} from "react-router-dom"
import Tilt from "react-tilt"

import {v4 as uuid} from "uuid"
import {connect} from "react-redux"
import actions from "../actions"

//Components
import TestCounters from "./TestCounters"
import DeckSearch from "./_Page_Deck_Search"
import Zone from "./Zone"
import TestControls from "./TestControls"
import TesterShortcuts from "./TesterShortcuts"
import TheStack from "./TheStack"
import BasicSearch from "./BasicSearch"
import Loading from "./Loading"
import utilities from "../utilities"

const {
  HOME_DIR,
  TOKEN_NAME,
  NUMBER_WORDS,
  titleCaps,
  pluralize,
  wrapNum,
} = utilities

export default connect(
  ({main: {tokens, decks}, playtest: {look}, deck, settings: {players}}) => {
    return {tokens, look, decks, deck, players}
  },
  actions
)(
  ({
    toTest,
    deck,
    tokens,
    decks,
    look,
    players,
    startTest,
    spawnToken,
    handleShuffle,
    gameState,
    setPage,
    openDeck,
    openModal,
    changeSettings,
  }) => {
    const modes = ["Goldfish", "Duel", "Multiplayer"]
    const types = ["HMN", "---"]
    const {slug} = useParams()

    const [choosing, setChoosing] = useState(null)
    const [mode, setMode] = useState(modes[0])

    const changePlayer = (p_id, val) =>
      changeSettings(
        "players",
        players.map(p => (p.id === p_id ? {...p, ...val} : p))
      )

    useEffect(
      _ => {
        changePlayer(choosing, {deck})
      },
      [deck]
    )

    return (
      <div className="playtest-lobby section spaced-col">
        <h1 className="block">Mtg Grip Playtester</h1>
        <div className="dash-buttons bar mini-spaced-bar">
          {players.map(
            ({type, id, deck: {_id, name, feature, list, loading}}, i) => (
              <div className="mini-spaced-col">
                <div className="flex-row mini-spaced-bar even">
                  <h2>P{i + 1}</h2>
                  <button
                    className="small-button"
                    style={{fontFamily: "monospace"}}
                    onClick={_ =>
                      changePlayer(id, {
                        type:
                          types[wrapNum(types.indexOf(type) + 1, types.length)],
                      })
                    }>
                    {type}
                  </button>
                  <button
                    className={`small-button warning-button icon-cancel ${
                      players.length > 1 || "disabled"
                    }`}
                    onClick={_ =>
                      changeSettings(
                        "players",
                        players.filter(p => p.id !== id)
                      )
                    }
                  />
                </div>
                <Tilt>
                  <div
                    style={{
                      backgroundImage: `url(${feature})`,
                    }}
                    className={`dash-button center ${
                      type === "---" && "disabled"
                    }`}
                    onClick={_ => {
                      setChoosing(id)
                      openModal({
                        title: "Choose deck to play",
                        content: <DeckSearch noLink />,
                      })
                    }}>
                    {_id ? (
                      <div className="text-shadow">
                        <span>{name}</span>
                        {loading ? <Loading /> : null}
                      </div>
                    ) : (
                      <Loading spinner=" " subMessage={"No deck chosen"} />
                    )}
                  </div>
                </Tilt>
              </div>
            )
          )}
          {players.length < 4 ? (
            <button
              onClick={_ =>
                changeSettings("players", [
                  ...players,
                  {type: "HMN", id: uuid(), deck: {}},
                ])
              }>
              Add Player
            </button>
          ) : null}
        </div>
        <NavLink
          className={
            deck.loading || !players.find(p => p.type === "HMN" && p.deck)
              ? "disabled"
              : ""
          }
          to={`${HOME_DIR}/playtest/single`}>
          <button>Begin Playtest</button>
        </NavLink>
      </div>
    )
  }
)
