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
				<div className="game-settings block">
					<h2>Playtester Settings</h2>
					<span className="bar even mini-block mini-spaced-bar thin-indent">
						<span
							className={`icon-toggle${
								game_log ? "-on attention " : "-off"
							}`}
							onClick={_ => changeSettings("game_log", !game_log)}
						></span>
						<span>Display Game Log</span>
					</span>
					<h4 className="block ">Effects Allowed On The Stack </h4>
					<div className="col thin-indent">
						{STACKTIONS.map((st, i) => (
							<span
								className={`bar even mini-spaced-bar ${
									use_stack.includes(st) && " alert"
								}`}
							>
								<span
									key={st}
									className={`icon-toggle${
										use_stack.includes(st)
											? "-on attention alert"
											: "-off"
									}`}
									onClick={_ =>
										changeSettings(
											"use_stack",
											use_stack.includes(st)
												? use_stack.filter(
														s => s !== st
												  )
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
									className={`icon${
										mana_tolerance === i ? "-ok" : "-empty"
									}`}
									onClick={_ =>
										changeSettings("mana_tolerance", i)
									}
								></span>
								<span>{msg}</span>
							</span>
						))}
					</div>
				</div>
			</div>
		)
	}
)
