import React,{useState,useRef,useEffect} from 'react'


export default function GameLog(props) {
    const [open,openLog] = useState(0)
    const bottom = useRef()
    useEffect(() => bottom.current.scrollIntoView())
   
    const logBook = open
      ?props.gameHistory.slice(Math.max(props.gameHistory.length - (props.showLast||50), 0))
      :[{...props.gameHistory[props.gameHistory.length-1]}]

  	return (
      <div className="game-log" 
      tabIndex={"0"} 
      onClick={()=>openLog(true)}
      onBlur={()=>openLog(false)} 
      >

        {logBook.map(l=>{
          return <div key={"gamelog-"+l.index} className={`log`}>
                <span className="action"><span className="timestamp">{l.timestamp}</span> {l.action}</span>
                <span className="undo" onClick={()=>props.undoAction(l.index)}><span className="icon-ccw"/></span>
              </div>
            
        })}
        <div ref={bottom}></div>
      </div>      
    )
}

