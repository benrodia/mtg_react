import React, {useRef, useEffect, useState} from "react"
import {connect} from "react-redux"

export default connect(({settings: {playmat, wobble, darken}}) => {
	return {playmat, wobble, darken}
})(({playmat, wobble, darken}) => {
	return (
		<div className="bg-img">
			<div
				className="playmat"
				style={{
					// filter: `brightness(${1 - darken / 100})`,
					// transform: wobble && `scale(${Math.abs(mod / 100) + 1}) translate(${x}%,${y}%)`,
					backgroundImage: `url(${playmat})`,
					// background: `crimson`,
					// transition: "transform .1s ease-out",
				}}
			/>
			<div className="grad" />
		</div>
	)
})
