import React from 'react'


export default function Notifications(props) {
	return (
    <div className="notifications">
      {props.noteLog.map(n=>{
        return (
          <div key={n.key} className={`notification alert ${n.type}`}>
            {n.message}
          </div>
        )
      })}
    </div>      
  )
}

