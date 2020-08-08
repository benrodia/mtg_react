import React,{useState,useRef,useEffect} from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'


function GameLog({history,limit,undoAction}) {
    const [open,openLog] = useState(false)
    const bottom = useRef()
    useEffect(_=>bottom.current.scrollIntoView())
   
    const logBook = open
      ?history.slice(Math.max(history.length - (limit||50), 0))
      :[{...history[history.length-1]}]

  	return (
      <div className="game-log" 
      tabIndex={"0"} 
      onClick={_=>openLog(true)}
      onBlur={_=>openLog(false)} 
      >

        {logBook.map(l=>{
          return <div key={"gamelog-"+l.index} className={`log`}>
                <span className="action"><span className="timestamp">{l.timestamp}</span> {l.action}</span>
                <span className="undo" onClick={_=>undoAction()}><span className="icon-ccw"/></span>
              </div>
            
        })}
        <div ref={bottom}></div>
      </div>      
    )
   return null
}


export default connect(state=>{return{history:state.playtest.history}},actions)(GameLog)