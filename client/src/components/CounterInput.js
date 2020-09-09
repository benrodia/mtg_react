import React, {useRef} from "react"

export default ({value, children, callBack, icon, neg, lower, upper, addOnClick}) => {
	const ref = useRef(null)
	const validate = val => !isNaN(val) && (neg || val + value >= (lower || 0)) && (!upper || val + value <= upper)
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
					const val = e.target.value === "" ? lower || 0 : parseInt(e.target.value)
					if (validate(val)) callBack(val)
				}}
			/>
		</p>
	)
}
