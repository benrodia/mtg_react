import React,{useState,useRef,useEffect} from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'


function GameLog(props) {
   //  const {history} = props
   //  const [open,openLog] = useState(false)
   //  const bottom = useRef()
   //  useEffect(() => bottom.current.scrollIntoView())
   
   //  const logBook = open
   //    ?history.slice(Math.max(history.length - (props.showLast||50), 0))
   //    :[{...history[history.length-1]}]

  	// return (
   //    <div className="game-log" 
   //    tabIndex={"0"} 
   //    onClick={()=>openLog(true)}
   //    onBlur={()=>openLog(false)} 
   //    >

   //      {logBook.map(l=>{
   //        return <div key={"gamelog-"+l.index} className={`log`}>
   //              <span className="action"><span className="timestamp">{l.timestamp}</span> {l.action}</span>
   //              <span className="undo" onClick={()=>props.undoAction(l.index)}><span className="icon-ccw"/></span>
   //            </div>
            
   //      })}
   //      <div ref={bottom}></div>
   //    </div>      
   //  )
   return null
}

const select = state => {
  return {
    // history: state.playtest.history,
  }
}

export default connect(select,actions)(GameLog)