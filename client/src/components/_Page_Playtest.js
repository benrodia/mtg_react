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

function Page_Tester({list, tokens, look, startTest, spawnToken, handleShuffle, gameState, setPage, openDeck}) {
  const {slug} = useParams()

  useEffect(
    _ => {
      openDeck(slug)
      startTest()
    },
    [slug]
  )

  const zone = (name, {context, header, cardHeadOnly}) => (
    <Zone zone={name} key={name} context={context} header={header} cardHeadOnly={cardHeadOnly} />
  )

  return (
    <div className="tester">
      <TesterShortcuts />
      <TheStack />
      <div className="side-col">
        {!list.filter(c => c.commander).length ? null : zone("Command", {context: "single"})}
        {zone("Exile", {
          context: "list",
          cardHeadOnly: true,
          header: true,
        })}
        {zone("Graveyard", {
          context: "list",
          cardHeadOnly: true,
          header: true,
        })}
        <BasicSearch
          searchable
          placeholder="Create Token"
          options={tokens}
          labelBy={t => TOKEN_NAME(t)}
          valueBy={"id"}
          callBack={spawnToken}
        />
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
      {zone("Battlefield", {context: "grid"})}
      {zone("Hand", {
        context: "list",
        faceDown: true,
        header: true,
      })}
    </div>
  )
}

export default connect(({main: {tokens}, playtest: {look}, deck: {list}}) => {
  return {tokens, look, list}
}, actions)(Page_Tester)
