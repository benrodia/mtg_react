import React from 'react'
import {connect} from 'react-redux'

function Notifications({noteLog}) {
	return <div className="notifications">
      {noteLog.map(n=><div key={n.key} className={`notification alert ${n.type}`}>{n.message}</div>)}
    </div>      
}

export default connect(state=>{return{noteLog:state.main.noteLog}})(Notifications)