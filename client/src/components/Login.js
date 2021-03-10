import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import {useHistory} from "react-router-dom"
import actions from "../actions"
import utilities from "../utilities"

const {HOME_DIR, testEmail, badPassword, createSlug} = utilities

export default connect(
	({
		main: {users},
		auth: {
			isAuthenticated,
			user: {name, email, password},
		},
	}) => {
		return {
			isAuthenticated,
			users,
			name,
			email,
			password,
		}
	},
	actions
)(
	({
		inModal,
		activeForm,
		isAuthenticated,
		users,
		name,
		email,
		password,
		loadUser,
		register,
		logout,
		login,
		newMsg,
		openModal,
	}) => {
		const [inForm, setInForm] = useState({email})
		const [upForm, setUpForm] = useState({})
		const [showPassword, setShowPassword] = useState(false)
		const [registering, setRegistering] = useState(false)
		const setForm = (form, e) => {
			const {name, value} = e.target
			return form === "in"
				? setInForm({...inForm, [name]: value})
				: setUpForm({...upForm, [name]: value})
		}

		const nameAvailable = text =>
			!users.filter(u => u.name === text || u.slug === createSlug(text, users))
				.length
		const emailAvailable = text => !users.filter(u => u.email === text).length

		const validate = (form = {}) => {
			const {name, email, password, passwordConfirm} = form
			return !registering
				? email && password
				: testEmail(email) &&
						!badPassword(password) &&
						nameAvailable(name) &&
						name.length >= 4 &&
						passwordConfirm === password
		}

		if (isAuthenticated) useHistory().push(HOME_DIR)

		const InFormDiv = (
			<div className={`in-form`}>
				<div className="block">
					<h4>
						<span>Email</span>
					</h4>
					<input
						value={inForm.email}
						type="email"
						name="email"
						onChange={e => setForm("in", e)}
						placeholder={"your@email.com"}
						required
					/>
				</div>
				<div className="block">
					<h4>
						<span>Password </span>
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
				<button
					className={`block success-button ${validate(inForm) || "disabled"}`}
					onClick={_ => {
						login(inForm)
					}}>
					Log In
					<span className="icon-login" />
				</button>
			</div>
		)

		const UpFormDiv = (
			<div className={`up-form`}>
				<div className="block">
					<h4 className="mini-spaced-bar">
						<span>Name</span>
						<span
							className={`asterisk icon-${
								!upForm.name || !upForm.name.length
									? ""
									: upForm.name.length >= 4 && nameAvailable(upForm.name)
									? "ok success"
									: "attention attention"
							}`}>
							{!upForm.name || !upForm.name.length || upForm.name.length >= 4
								? nameAvailable(upForm.name)
									? ""
									: "Already in use"
								: "Should be at least 4 letters"}
						</span>
					</h4>
					<input
						type="text"
						name="name"
						onChange={e => setForm("up", e)}
						placeholder={"username"}
						required
					/>
				</div>
				<div className="block">
					<h4 className="mini-spaced-bar">
						<span>Email</span>
						<span
							className={`asterisk icon-${
								!upForm.email || !upForm.email.length
									? ""
									: testEmail(upForm.email) && emailAvailable(upForm.email)
									? "ok success"
									: "attention attention"
							}`}>
							{!upForm.email || !upForm.email.length || testEmail(upForm.email)
								? emailAvailable(upForm.email)
									? ""
									: "Already in use"
								: "Not a valid email address"}
						</span>
					</h4>
					<input
						name="email"
						onChange={e => setForm("up", e)}
						placeholder={"your@email.com"}
						required
					/>
				</div>
				<div className="block">
					<h4 className="mini-spaced-bar">
						<span>Password</span>
						<span
							className={`asterisk icon-${
								!upForm.password || !upForm.password.length
									? ""
									: !badPassword(upForm.password)
									? "ok success"
									: "attention attention"
							}`}>
							{!upForm.password ||
							!upForm.password.length ||
							!badPassword(upForm.password)
								? ""
								: badPassword(upForm.password)}
						</span>
					</h4>
					<input
						type="password"
						name="password"
						onChange={e => setForm("up", e)}
						placeholder={"8+ chars, UPPER, lower, numb3r, & speci@l"}
						required
					/>
				</div>
				<div className="block">
					<h4 className="mini-spaced-bar">
						<span>Confirm Password</span>
						<span
							className={`asterisk icon-${
								!upForm.passwordConfirm || !upForm.passwordConfirm.length
									? ""
									: upForm.passwordConfirm === upForm.password
									? "ok success"
									: "attention attention"
							}`}>
							{!upForm.passwordConfirm ||
							!upForm.passwordConfirm.length ||
							upForm.passwordConfirm === upForm.password
								? ""
								: "No match"}
						</span>
					</h4>
					<input
						type="password"
						name="passwordConfirm"
						onChange={e => setForm("up", e)}
						placeholder={"must match password"}
						required
					/>
				</div>
				<button
					className={`block success-button ${
						validate(upForm, true, true) || "disabled"
					}`}
					onClick={_ => register(upForm)}>
					Sign Up
					<span className="icon-login" />
				</button>
			</div>
		)

		return (
			<div className="section">
				<h1 className="block">Account</h1>
				<div className="flex-row tab-switch ">
					<div
						className={`tab ${registering || "selected"}`}
						onClick={_ => setRegistering(false)}>
						Login
					</div>
					<div
						className={`tab ${registering && "selected"}`}
						onClick={_ => setRegistering(true)}>
						Register
					</div>
				</div>
				<div className="forms flex-row spaced-bar center start">
					{registering ? UpFormDiv : InFormDiv}
				</div>
			</div>
		)
	}
)
