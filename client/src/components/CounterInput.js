import React, {useRef} from "react"

export default ({value, children, callBack, icon, neg, addOnClick}) => {
	const ref = useRef(null)
	return (
		<p className="counter">
			<span
				className={`clicky-icon ${icon}`}
				onClick={_ => {
					ref.current.focus()
					addOnClick && callBack(addOnClick)
				}}>
				{children}
			</span>
			<input
				ref={ref}
				className="discrete-input"
				type="number"
				value={value}
				onChange={e => {
					const val = e.target.value === "" ? 0 : parseInt(e.target.value)
					if (!isNaN(val) && (val + value >= 0 || neg)) callBack(val)
				}}
			/>
		</p>
	)
}
