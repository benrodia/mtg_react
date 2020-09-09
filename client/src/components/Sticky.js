import React, {useEffect, useRef, useState} from "react"

export default ({children, offset}) => {
	const [isSticky, setSticky] = useState(false)
	const handleScroll = _ => setSticky(window.pageYOffset > (offset || 0))
	useEffect(
		_ => {
			window.removeEventListener("scroll", handleScroll)
			window.addEventListener("scroll", handleScroll)
			return _ => window.removeEventListener("scroll", handleScroll)
		},
		[offset]
	)

	return React.cloneElement(children, {className: `${children.props.className} ${isSticky && "sticky"}`})
}
