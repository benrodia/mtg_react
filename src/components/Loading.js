import React from 'react'


export default function Loading(props) {
	return (
		<div className="loading">
			<h3>{props.message?props.message:"Loading..."}</h3>
		</div>
	)
}