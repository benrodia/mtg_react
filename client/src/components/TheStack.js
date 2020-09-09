import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {formatText} from "../functions/text"

function TheStack({resStack, stack}) {
  const stackItems = [...stack].reverse()

  return (
    <div className={`stack ${!stack.length ? "empty" : ""} `}>
      {stackItems.map((s, i) => {
        const {key, src, text, effectType, options} = s
        const active = i === 0
        return (
          <div key={key} style={{opacity: 1 - 0.2 * i}} className={`item action alert ${!active ? "disabled" : ""}`}>
            <div className="msg2">
              <div className="header">
                {src} - {effectType}
              </div>
              {!active ? null : <div className="body">{formatText(text)}</div>}
            </div>
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
