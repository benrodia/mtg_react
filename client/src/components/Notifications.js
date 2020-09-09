import React from "react"
import {connect} from "react-redux"

export default connect(({main: {noteLog}}) => {
	return {noteLog}
})(({noteLog}) => {
	return (
		<div className="notifications">
			{noteLog.map(({key, type, message}) => {
				const icon = type === "success" ? "ok" : type === "warning" ? "attention" : type === "error" ? "alert" : ""

				return (
					<div key={key} className={`notification alert ${type} bar even `}>
						<span className={`icon icon-${icon}`} />
						<p>{message}</p>
					</div>
				)
			})}
		</div>
	)
})
