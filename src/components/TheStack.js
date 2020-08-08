import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import {formatText} from '../functions/text'

function TheStack({resStack,stack}) {
	const stackItems = [...stack].reverse()

	return <div className={`stack ${!stack.length?'empty':''} `}>
      {stackItems.map((s,i)=>{
        const {key,src,res,text,effect,effectType} = s
      	const active = i===0
        return (
          <div key={key} style={{opacity:(1-(.2*i))}} className={`item action alert ${!active?'disabled':''}`}>
          	<div className="msg">
          		<div className="header">{src} - {effectType}</div>
          		{!active?null:<div className="body">{formatText(text)}</div>}
          	</div>
          	{!active?null: 
          	<div className="stackOp">
	            <button autoFocus={active} className='small-button success-button' onClick={_=>{
                resStack()
                if(res!==null) res()
              }}>{effect}</button>
              <button className='small-button warning-button' onClick={resStack}>Counter</button>
          	</div>
          	}
          </div>
        )
      })}
    </div>      
}



export default connect(state=>{return{stack: state.playtest.stack}},actions)(TheStack)