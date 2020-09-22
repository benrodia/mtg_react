import React, {useState, useEffect} from "react"
import {v4 as uuidv4} from "uuid"

export default ({
	addable,
	removable,
	changeable,
	text,
	list,
	callBack,
	filters,
	children,
	area,
}) => {
	const [input, setInput] = useState(addable ? "" : text || "")
	const [edit, isEditing] = useState(addable)

	const canAdd = input.trim().length && addable
	const add = _ => {
		if (canAdd) {
			callBack({text: input, method: "add"})
			setInput("")
		}
	}
	const remove = _ => {
		callBack({text: input, method: "remove"})
	}
	const change = doit => {
		if (doit || (edit && input.length)) {
			callBack({text: input, method: "change"})
			isEditing(!edit)
		}
	}
	return (
		<div className="bar even">
			{!edit ? (
				<div onClick={changeable && change}>{children}</div>
			) : area ? (
				<textarea
					id={uuidv4()}
					autoFocus
					rows={10}
					columns={40}
					onBlur={changeable && change}
					className={`custom-input {changeable?'discrete-input':''}`}
					type="text"
					value={input}
					placeholder={text}
					onChange={e => setInput(e.target.value)}
				/>
			) : (
				<input
					id={uuidv4()}
					autoFocus
					onBlur={changeable && change}
					className={`custom-input {changeable?'discrete-input':''}`}
					type="text"
					value={input}
					placeholder={text}
					onChange={e => setInput(e.target.value)}
				/>
			)}
			{!addable ? null : (
				<button
					className={`success-button icon-plus ${!canAdd && "disabled"}`}
					onClick={add}
				/>
			)}
			{!changeable ? null : (
				<span className="clicky-icon icon-pencil" onClick={change} />
			)}
			{!removable ? null : (
				<span className="icon-cancel" onClick={remove}>
					X
				</span>
			)}
		</div>
	)
}
