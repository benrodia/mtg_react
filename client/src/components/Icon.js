import React from "react"
import SVG from "react-inlinesvg"

export default function Icon({className, src, text, name, loader}) {
	return (
		<span className={`even bar mini-spaced-bar icon ${className}`}>
			{!src ? null : (
				<SVG
					className={className}
					title={name}
					src={src || null}
					loader={<span className="spinner icon-spin2" />}
					onError={error => console.log(error.message)}
				/>
			)}
			{text ? <span>{text}</span> : null}
		</span>
	)
}
