import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {formatText} from "../functions/text"
import CardControls from "./CardControls"

function TheStack({resStack, stack}) {
  const stackItems = [...stack].reverse()

  return (
    <div className={`stack ${!stack.length ? "empty" : ""} `}>
      {stackItems.map(({key, src, text, effectType, options, cards}, i) => {
        const active = i === 0
        console.log("THE STACK", text, src, effectType, cards)
        return (
          <div
            key={key}
            style={{opacity: 1 - 0.2 * i}}
            className={`item action alert ${!active ? "disabled" : ""}`}>
            <div className="msg2">
              <h2 className="header">
                {src} - {effectType}
              </h2>
              {!active ? null : <div className="body">{formatText(text)}</div>}
            </div>
            {cards ? (
              <div className={"bar"}>
                {cards.map(c => (
                  <CardControls card={c} />
                ))}
              </div>
            ) : null}
            <div className="stackOp">
              {!active
                ? null
                : options.map((op, num) =>
                    op.hide ? null : (
                      <button
                        key={num}
                        autoFocus={num === 0}
                        className={`small-button ${op.color}-button`}
                        onClick={_ => {
                          resStack()
                          if (typeof op.res === "function") op.res()
                        }}>
                        {op.effect}
                      </button>
                    )
                  )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default connect(state => {
  return {stack: state.playtest.stack}
}, actions)(TheStack)
