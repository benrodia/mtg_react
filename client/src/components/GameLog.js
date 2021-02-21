import React, {useState, useRef, useEffect} from "react"

import {connect} from "react-redux"
import actions from "../actions"

export default connect(({playtest: {history, current, timeID}}) => {
  return {history, current, timeID}
}, actions)(({history, current, timeID, timeTravel}) => {
  const [open, openLog] = useState(false)
  const bottom = useRef()
  useEffect(
    _ => {
      bottom.current.scrollIntoView()
    },
    [open]
  )

  const past = open ? history : [{...history[history.length - 1]}]

  return (
    <div className="history">
      <div
        className="game-log"
        tabIndex={"0"}
        onClick={_ => openLog(true)}
        onBlur={_ => openLog(false)}>
        {past.map(p => (
          <div
            onClick={_ => open && timeTravel(p.timeID)}
            key={"GameLog_" + p.timeID}
            className={`log ${p.current > current && "inactive"} ${
              open &&
              p.current === current &&
              current < history.length &&
              "pointer"
            }`}>
            <span className="action">{p.msg}</span>
          </div>
        ))}
        <div ref={bottom} />
      </div>
    </div>
  )
})
