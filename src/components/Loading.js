import React from 'react'


export default function Loading({message,anim}) {
	return <div className="loading">
		<h3 style={{animationName: anim}} className="message">{message||"Loading..."}</h3>
	</div>
}