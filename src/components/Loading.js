import React from 'react'


export default function Loading(props) {
	return (
		<div className="loading">
			<h3 style={{animationName: props.anim}} className="message">{props.message?props.message:"Loading..."}</h3>
		</div>
	)
}