import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import utilities from "../utilities"

import CounterInput from "./CounterInput"

const {
	INIT_SETTINGS_STATE,
	STACKTIONS,
	pluralize,
	titleCaps,
	rnd,
	getArt,
} = utilities

export default connect(({main: {cardData}, settings}) => {
	return {cardData, settings}
}, actions)(
	({cardData, settings, updateUser, changeSettings, openModal, newMsg}) => {
		const {
			game_log,
			scale,
			darken,
			playmat,
			random_playmat,
			sleeves,
			use_stack,
			mana_tolerance,
		} = settings
		const manaT = [
			"Do not show me mana",
			"Do not auto spend mana",
			"Pay costs with floating mana",
			"If able use extra mana sources",
		]

		return (
			<div className="info settings big-block">
				<h1 className="block">Settings</h1>
				<div className="bar">
					<div className="display-settings big-block">
						<h2>Display Settings</h2>
						<div className="mini-block">
							<h4>Text Size (75% - 125%)</h4>
							<div className="mini-block thin-indent">
								<span className="bar even mini-spaced-bar">
									<CounterInput
										value={scale}
										callBack={n => changeSettings("scale", n)}
										upper={125}
										lower={75}>
										<span
											className={`icon-minus ${scale <= 75 && "disabled"}`}
											onClick={_ =>
												changeSettings("scale", Math.max(75, scale - 5))
											}></span>
										<span
											className={`icon-plus ${scale >= 125 && "disabled"}`}
											onClick={_ =>
												changeSettings("scale", Math.min(125, scale + 5))
											}></span>
									</CounterInput>
									%
								</span>
							</div>
							<div className="mini-block">
								<h4>Darken Background (0% - 100%)</h4>
								<div className="mini-block thin-indent">
									<span className="bar even mini-spaced-bar">
										<CounterInput
											value={darken}
											callBack={n => changeSettings("darken", n)}
											upper={100}
											lower={0}>
											<span
												className={`icon-minus ${darken <= 0 && "disabled"}`}
												onClick={_ =>
													changeSettings("darken", Math.max(0, darken - 5))
												}></span>
											<span
												className={`icon-plus ${darken >= 100 && "disabled"}`}
												onClick={_ =>
													changeSettings("darken", Math.min(100, darken + 5))
												}></span>
										</CounterInput>
										%
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="game-settings block">
						<h2>Playtester Settings</h2>
						<span className="bar even mini-block mini-spaced-bar thin-indent">
							<span
								className={`icon-toggle${game_log ? "-on attention " : "-off"}`}
								onClick={_ => changeSettings("game_log", !game_log)}></span>
							<span>Display Game Log</span>
						</span>
						<h4 className="block ">Effects Allowed On The Stack </h4>
						<div className="col thin-indent">
							{STACKTIONS.map((st, i) => (
								<span
									className={`bar even mini-spaced-bar ${
										use_stack.includes(st) && " alert"
									}`}>
									<span
										key={st}
										className={`icon-toggle${
											use_stack.includes(st) ? "-on attention alert" : "-off"
										}`}
										onClick={_ =>
											changeSettings(
												"use_stack",
												use_stack.includes(st)
													? use_stack.filter(s => s !== st)
													: [...use_stack, st]
											)
										}
									/>
									<span>{pluralize(st)}</span>
								</span>
							))}
						</div>
						<h4 className="block">Auto Spend Mana</h4>
						<div className="col thin-indent">
							{manaT.map((msg, i) => (
								<span className="bar even mini-spaced-bar">
									<span
										key={manaT[i]}
										className={`icon${mana_tolerance === i ? "-ok" : "-empty"}`}
										onClick={_ => changeSettings("mana_tolerance", i)}></span>
									<span>{msg}</span>
								</span>
							))}
						</div>
					</div>

					<div className="themes">
						<div className={` block choose-playmat`}>
							<div className="bar even mini-spaced-bar">
								<h4>Playmat</h4>
								<button
									title="If unlocked, this image will be shuffled everytime you open the app."
									className={`small-button icon-lock${
										random_playmat ? "-open-alt" : " selected"
									}`}
									onClick={_ =>
										changeSettings(`random_playmat`, !random_playmat)
									}>
									{random_playmat ? "Surprise Me" : "Locked Image"}
								</button>
								<button
									className={`small-button icon-loop`}
									onClick={_ =>
										getArt().then(art => changeSettings("playmat", art))
									}>
									Shuffle
								</button>
							</div>
							<div className="inner">
								<img className={"playmat"} src={playmat} alt={playmat} />
							</div>
						</div>
					</div>

					<div className="reset">
						<button
							className="small-button success-button"
							onClick={_ => {
								updateUser({settings})
								openModal(null)
								newMsg("Updated Settings!", "success")
							}}>
							Save Changes
						</button>
						<button
							className="small-button warning-button"
							onClick={_ => {
								changeSettings("clear")
								updateUser({settings: INIT_SETTINGS_STATE})
								openModal(null)
							}}>
							Reset to Default
						</button>
					</div>
				</div>
			</div>
		)
	}
)

// <button
// 	className={`smaller-button mini-block ${showSubTitle && "selected"}`}
// 	onClick={_ => changeSettings("showSubTitle", !showSubTitle)}>
// 	Deck Subtitle
// </button>

// <button
// 	className={`smaller-button mini-block ${wobble && "selected"}`}
// 	onClick={_ => changeSettings("wobble", !wobble)}>
// 	Wobble Background
// </button>

// <div className={` block choose-sleeves`}>
// 	<div className="bar even mini-spaced-bar">
// 		<h4>Sleeves</h4>
// 		<button
// 			title="If unlocked, this image will be shuffled everytime you open the app."
// 			className={`small-button icon-lock${randomSleeves ? "-open-alt" : "-on attention selected"}`}
// 			onClick={_ => changeSettings(`randomSleeves`, !randomSleeves)}>
// 			{randomSleeves ? "Surprise Me" : "Locked Image"}
// 		</button>
// 		<button
// 			className={`small-button icon-loop`}
// 			onClick={_ =>
// 				changeSettings("sleeves", rnd(getArt(cardData, {type_line: ["artifact", "enchantment"]})))
// 			}>
// 			Shuffle
// 		</button>
// 	</div>
// 	<div className="inner">
// 		<img className={"sleeves"} src={sleeves} alt={sleeves} />
// 	</div>
// </div>
