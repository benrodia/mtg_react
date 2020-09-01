import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
// import utilities from "../utilities"

export default connect(({auth: {isAuthenticated, errors, user: {name, email, password}}}) => {
	return {
		isAuthenticated,
		errors,
		name,
		email,
		password,
	}
}, actions)(({isAuthenticated, errors, name, email, password, loadUser, register, logout, login, newMsg}) => {
	const [activeForm, setActiveForm] = useState(null)
	const [inForm, setInForm] = useState({email})
	const [upForm, setUpForm] = useState({})
	const [showPassword, setShowPassword] = useState(false)

	useEffect(_ => {
		// loadUser()
	}, [])

	const setForm = (form, e) => {
		const {name, value} = e.target
		return form === "in" ? setInForm({...inForm, [name]: value}) : setUpForm({...upForm, [name]: value})
	}

	const validate = (form = {}, reqName, reqConfirm) => {
		const {name, email, password, passwordConfirm} = form
		return (
			email && password && password.length >= 8 && (!reqName || name) && (!reqConfirm || passwordConfirm === password)
		)
	}

	const outForm = (
		<div className="log-out">
			<h3>Hi {name}</h3>
			<button className="inverse-small-button" onClick={logout}>
				Log Out
				<span className="icon-logout" />
			</button>
		</div>
	)

	const buttons = (
		<div className="bar center mini-spaced-bar">
			<button
				className={`${activeForm === "in" && "selected"}`}
				onClick={_ => setActiveForm(activeForm === "in" ? null : "in")}>
				Log In
				<span className="icon-user" />
			</button>
			<button
				className={`${activeForm === "up" && "selected"}`}
				onClick={_ => setActiveForm(activeForm === "up" ? null : "up")}>
				Sign Up
				<span className="icon-user-add" />
			</button>
		</div>
	)

	return (
		<div className="log-in-form">
			{isAuthenticated ? outForm : buttons}
			<div className={`in-form ${(!isAuthenticated && activeForm === "in") || "hide"}`}>
				<div className="block">
					<h4>Email</h4>
					<input
						value={inForm.name}
						type="email"
						name="email"
						onChange={e => setForm("in", e)}
						placeholder={"your@email.com"}
						required
					/>
				</div>
				<div className="block">
					<h4>
						Password{" "}
						<span
							className={`clicky-icon  icon-eye${showPassword ? "" : "-off"}`}
							onClick={_ => setShowPassword(!showPassword)}
						/>
					</h4>
					<input
						value={inForm.password}
						type={showPassword ? "text" : "password"}
						name="password"
						onChange={e => setForm("in", e)}
						placeholder={'ex. "password"'}
						required
					/>
				</div>
				<button className={`block success-button ${validate(inForm) || "disabled"}`} onClick={_ => login(inForm)}>
					Log In
					<span className="icon-login" />
				</button>
			</div>

			<div className={`up-form ${(!isAuthenticated && activeForm === "up") || "hide"}`}>
				<div className="block">
					<h4>User Name</h4>
					<input type="text" name="name" onChange={e => setForm("up", e)} placeholder={"username"} required />
				</div>
				<div className="block">
					<h4>Email</h4>
					<input name="email" onChange={e => setForm("up", e)} placeholder={"your email"} required />
				</div>
				<div className="block">
					<h4>Password</h4>
					<input
						type="password"
						name="password"
						onChange={e => setForm("up", e)}
						placeholder={"at least 8 chars"}
						required
					/>
				</div>
				<div className="block">
					<h4>Confirm Password</h4>
					<input
						type="password"
						name="passwordConfirm"
						onChange={e => setForm("up", e)}
						placeholder={"must match password"}
						required
					/>
				</div>
				<button
					className={`block success-button ${validate(upForm, true, true) || "disabled"}`}
					onClick={_ => register(upForm)}>
					Sign Up
					<span className="icon-login" />
				</button>
			</div>
		</div>
	)
})
