import React, {useRef, useEffect, useState} from "react"
import {connect} from "react-redux"

export default connect(({settings: {playmat, wobble, darken}}) => {
	return {playmat, wobble, darken}
})(({playmat, wobble, darken}) => {
	const ref = useRef(null)
	const mod = -3
	const [{x, y}, setTranslate] = useState({x: 0, y: 0})
	useEffect(_ => {
		const trackMouse = ({clientX, clientY}) => {
			const x = (mod * clientX) / window.innerWidth - mod / 2
			const y = (mod * clientY) / window.innerHeight - mod / 2
			setTranslate({x, y})
		}

		window.addEventListener("mousemove", trackMouse)
		return _ => window.removeEventListener("mousemove", trackMouse)
	}, [])
	return (
		<div ref={ref} className="bg-img">
			<div
				className="playmat"
				style={{
					filter: `brightness(${1 - darken / 100})`,
					transform: wobble && `scale(${Math.abs(mod / 100) + 1}) translate(${x}%,${y}%)`,
					backgroundImage: "url('" + playmat + "')",
					transition: "transform .1s ease-out",
				}}
			/>
		</div>
	)
})
