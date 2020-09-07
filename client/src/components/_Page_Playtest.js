import React, {useEffect} from "react"
import {useParams} from "react-router-dom"

import {connect} from "react-redux"
import actions from "../actions"

//Components
import Zone from "./Zone"
import TestControls from "./TestControls"
import TesterShortcuts from "./TesterShortcuts"
import TheStack from "./TheStack"
import BasicSearch from "./BasicSearch"

import {TOKEN_NAME} from "../constants/greps"

export default connect(({main: {tokens, decks, cardData}, playtest: {look}, deck: {list}}) => {
  return {tokens, look, list, decks, cardData}
}, actions)(
  ({list, tokens, decks, cardData, look, startTest, spawnToken, handleShuffle, gameState, setPage, openDeck}) => {
    const {slug} = useParams()
    useEffect(
      _ => {
        if (decks.length) openDeck(slug)
      },
      [slug, decks]
    )
    useEffect(
      _ => {
        if (list.length && cardData) startTest()
      },
      [list, cardData]
    )

    const zone = (name, {context, header, cardHeadOnly}) => (
      <Zone zone={name} key={name} context={context} header={header} cardHeadOnly={cardHeadOnly} />
    )

    return (
      <div className="tester">
        <TesterShortcuts />
        <TheStack />
        <div className="side-col">
          {!list.filter(c => c.commander).length ? null : <Zone zone="Command" key="Command_ZONE" context="single" />}
          <BasicSearch
            searchable
            placeholder="Create Token"
            options={tokens}
            labelBy={t => TOKEN_NAME(t)}
            valueBy={"id"}
            callBack={spawnToken}
          />
          <Zone zone="Exile" key="Exile_ZONE" context="list" header cardHeadOnly />
          <Zone zone="Graveyard" key="Graveyard_ZONE" context="list" header cardHeadOnly />
          <div className="library-cont">
            {zone("Library", {context: "single", header: true})}
            <div className="library-controls">
              <button className={"smaller-button"} onClick={_ => handleShuffle(false)}>
                Shuffle
              </button>
              <div className="lookBtn">
                <button
                  className={"smaller-button warning-button"}
                  onClick={_ => gameState("look", 0)}
                  style={{display: !look && "none"}}>
                  X
                </button>
                <button className={"smaller-button"} onClick={_ => gameState("look", 1, true)}>
                  Reveal Top {look ? look : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
        <TestControls />
        <Zone zone="Battlefield" key="Battlefield_ZONE" context="grid" />
        <Zone zone="Hand" key="Hand_ZONE" context="list" header />
      </div>
    )
  }
)
