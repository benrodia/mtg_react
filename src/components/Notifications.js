import React from 'react'
import {connect} from 'react-redux'

export default connect(({main:{noteLog}})=>{return{noteLog}})
(({noteLog})=> {
	return <div className="notifications">
      {noteLog.map(n=><div key={n.key} className={`notification alert ${n.type}`}>{n.message}</div>)}
    </div>      
})
