import React from 'react'


export default function TheStack({resolve,stack}) {
	const stackItems = [...stack].reverse()//.slice(0,3)
	return <div className={`stack  ${!stack.length?'empty':''} `}>
      {stackItems.map((s,i)=>{
      	const active = i===0
        return (
          <div key={s.key} style={{opacity:(1-(.1*i))}} className={`item action alert ${s.type} ${!active?'disabled':''}`}>
          	<div className="msg">
          		<div className="header">{s.src} - {s.type}</div>
          		<div className="body">{s.text}</div>
          	</div>
          	{!active?null: 
          	<div className="stackOp">
	          	{s.options.map(o=><button onClick={_=>resolve({key:s.key,resolve:o.method})}>{o.name}</button>)}
	            <button autoFocus={active} className='small-button success-button' onClick={_=>resolve({key:s.key,resolve:true})}>Resolve</button>
	            <button className='small-button warning-button' onClick={_=>resolve({key:s.key,resolve:false})}>Counter</button>
          	</div>
          	}
          </div>
        )
      })}
    </div>      
}

