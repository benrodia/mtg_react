import React,{useState,useRef,useEffect} from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import * as A from '../constants/actionNames'


function GameLog({history,current,timeTravel}) {
  const [open,openLog] = useState(false)
  const bottom = useRef()
  useEffect(_=>bottom.current.scrollIntoView())
 
  const past = open?history:[{...history[history.length-1]}]

	return <div className="history">
    
    <div className="game-log" 
      tabIndex={"0"} 
      onClick={_=>openLog(true)}
      onBlur={_=>openLog(false)} 
    >
      {past.map(p=>
        <div onClick={_=>open&&timeTravel(p.current)} key={"gamelog_"+p.current} className={`log ${p.current>current&&'inactive'} ${open&&p.current===current&&current<history.length&&'pointer'}`}>
          <span className="action"><span className="timestamp">{p.timestamp}</span> {p.msg}</span>
        </div>    
      )}
      <div ref={bottom}/>
    </div>      
  </div>
}


export default connect(({playtest:{history,current}})=>{return {history,current}},actions)(GameLog)