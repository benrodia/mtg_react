import React, {useState} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import CardControls from "./CardControls"

import payMana from "../functions/payMana"
import utilities from "../utilities"

const {formatText, formatManaSymbols, getTargetable} = utilities

export default connect(({playtest: {stack, players}}) => {
  return {stack, players}
}, actions)(({resStack, stack, players, payCost}) => {
  // console.log("the whole stack", stack)
  return (
    <div className={`stack center ${!stack.length ? "hide" : ""} `}>
      {[...stack].reverse().map((si, i) => (
        <StackItem
          {...si}
          i={i}
          resStack={resStack}
          payCost={payCost}
          players={players}
        />
      ))}
      <h1 className="block">Actions on the Stack</h1>
    </div>
  )
})

const StackItem = ({
  i,
  resStack,
  key,
  src,
  text,
  effectType,
  options,
  cards,
  cost,
  targets,
  players,
  script,
  payCost,
}) => {
  const active = i === 0
  const [selected, setSelected] = useState([])
  const [costs, setCosts] = useState(script ? script.cost : [])

  const targetable =
    !script || !script.select
      ? []
      : getTargetable(script.select, players, script.controller)

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
      {costs && costs.length ? <h4>Pay Costs</h4> : null}
      {costs &&
        costs.map(cost => (
          <button
            onClick={_ => {
              payCost(cost)
              setCosts(
                costs.map(co =>
                  co.text === cost.text ? {...co, paid: true} : co
                )
              )
            }}
            className={
              (!cost.paid &&
                (!cost.mana || payMana(cost.mana, script.controller))) ||
              "disabled"
            }>
            {formatManaSymbols(cost.text)}
          </button>
        ))}
      {script && script.select && script.select.amt ? (
        <h4>Choose Targets</h4>
      ) : null}

      <div className="stackOp">
        {!active
          ? null
          : options.map((op, num) => (
              <button
                key={num}
                autoFocus={num === 0}
                className={`small-button ${op.color}-button ${
                  op.confirm &&
                  !costs.every(co => co.paid || co.optional) &&
                  "disabled"
                }`}
                onClick={_ => {
                  resStack()
                  if (typeof op.res === "function") op.res()
                }}>
                {op.effect}
              </button>
            ))}
      </div>
    </div>
  )
}

// {targets
//   ? targets.map(t => {
//       const toggle = _ =>
//         setSelected(
//           selected.find(s => s.key === t.key)
//             ? selected.filter(s => s.key !== t.key)
//             : [...selected, t]
//         )
//       return (
//         <span
//           onClick={toggle}
//           className={selected.find(s => s.key === t.key) && "selected"}>
//           {t.object === "card" ? (
//             <CardControls card={t} />
//           ) : (
//             <button>{t.name || t.key}</button>
//           )}
//         </span>
//       )
//     })
//   : null}
