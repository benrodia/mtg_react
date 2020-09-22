import React, {useEffect, useState} from "react"

export default ({message, subMessage, anim, spinner, full}) => {
	return (
		<div
			style={{position: full ? "fixed" : "default"}}
			className="loading col spaced-col">
			<span style={{animationName: anim}} className="main-msg">
				{spinner || <span className="spinner icon-spin2" />}
				{!message ? null : <h3 className="message">{message}</h3>}
			</span>
			{!subMessage ? null : <p className="sub-msg">{subMessage}</p>}
		</div>
	)
}
