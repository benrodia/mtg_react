import React from "react"

import {connect} from "react-redux"
import actions from "../actions"

import ChooseTheme from "./ChooseTheme"

import utilities from "../utilities"

const {pluralize} = utilities

export default connect(
	({settings}) => settings,
	actions
)(
	({
		userName,
		gameLog,
		scale,
		wobble,
		showSubTitle,
		stacktions,
		useStack,
		manaTolerance,
		gameActions,
		changeSettings,
	}) => {
		const manaT = [
			"Do not show me mana",
			"Do not auto spend mana",
			"Pay costs with floating mana",
			"If able use extra mana sources",
		]

		const textSize = (
			<div className="setting-check-box">
				<p>Text Size</p>
				<button className={`smaller-button ${scale === 80 && "selected"}`} onClick={_ => changeSettings("scale", 80)}>
					Small
				</button>
				<button className={`smaller-button ${scale === 100 && "selected"}`} onClick={_ => changeSettings("scale", 100)}>
					Normal
				</button>
				<button className={`smaller-button ${scale === 120 && "selected"}`} onClick={_ => changeSettings("scale", 120)}>
					Large
				</button>
			</div>
		)

		return (
			<section className="info settings">
				<div className="display-settings block thin-block">
					<h4 className="field-label">UI Settings</h4>
					{textSize}
					<button
						className={`smaller-button mini-block ${showSubTitle && "selected"}`}
						onClick={_ => changeSettings("showSubTitle", !showSubTitle)}>
						Deck Subtitle
					</button>
					<button
						className={`smaller-button mini-block ${wobble && "selected"}`}
						onClick={_ => changeSettings("wobble", !wobble)}>
						Wobble Background
					</button>
				</div>
				<div className="game-settings block">
					<h4 className="field-label">Playtester Settings</h4>
					<button
						className={`smaller-button mini-block thin-block ${gameLog && "selected"}`}
						onClick={_ => changeSettings("gameLog", !gameLog)}>
						Gamelog
					</button>
					<h5 className="block ">Use Stack For</h5>
					<div className="col thin-block">
						{stacktions.map((st, i) => (
							<button
								key={st}
								className={`smaller-button mini-block ${useStack.includes(st) && "selected"}`}
								onClick={_ =>
									changeSettings("useStack", useStack.includes(st) ? useStack.filter(s => s !== st) : [...useStack, st])
								}>
								{pluralize(st)}
							</button>
						))}
					</div>
					<h5 className="block">Auto Spend Mana</h5>
					<div className="col thin-block">
						{manaT.map((msg, i) => (
							<button
								key={manaT[i]}
								className={`smaller-button mini-block ${manaTolerance === i && "selected"}`}
								onClick={_ => changeSettings("manaTolerance", i)}>
								{msg}
							</button>
						))}
					</div>
				</div>

				<div className="themes">
					<ChooseTheme type="sleeves" />
					<ChooseTheme type="playmat" />
				</div>

				<div className="reset">
					<button className="small-button warning-button" onClick={_ => changeSettings("clear")}>
						Reset to Default
					</button>
				</div>
			</section>
		)
	}
)
