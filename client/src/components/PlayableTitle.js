import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import actions from "../actions"
import utilities from "../utilities"
import {PieChart} from "react-minimal-pie-chart"
import {useDrag} from "react-dnd"
import Tilt from "react-tilt"

import DropSlot from "./DropSlot"
import Icon from "./Icon"
import Login from "./Login"
import CardControls from "./CardControls"
import ToolTip from "./ToolTip"

const logo = require("../imgs/mtggrip-logo-text.svg")

// const {
// 	Q,
// 	HOME_DIR,
// 	COLORS,
// 	titleCaps,
// 	rnd,
// 	SUB_BANNERS,
// 	GREETINGS,
// 	generateRandomDeck,
// 	creator,
// 	pageButtons,
// } = utilities

export default _ => {
	const letters = "MTGGRIP".split("").map((l, i) => {
		return {l, id: l + i, s: "anim"}
	})
	const [active, setActive] = useState(letters)

	if (!active.some(a => a.s)) {
		setActive(
			letters.map(l => {
				return {...l, s: "hide"}
			})
		)
		setTimeout(_ => setActive(letters), 2000)
	}

	return (
		<DropSlot
			accept={"Letter"}
			callBack={l =>
				setActive([...active.filter(({id}) => id !== l.id), {...l}])
			}>
			<div className="play-title flex-row mini-spaced-bar">
				{active.map((l, i) => (
					<Letter l={l} i={i} active={active} setActive={setActive} />
				))}
			</div>
		</DropSlot>
	)
}

const Letter = ({l, i, active, setActive}) => {
	const [dragState, drag] = useDrag({item: {...l, type: "Letter"}})

	return (
		<div
			style={{
				marginRight: !l.s && 0,
				transition: `margin-right 0.2s 0.4s`,
			}}>
			<Tilt scale={1.3}>
				<h1
					ref={drag}
					onClick={_ =>
						setActive(active.map(a => (a.id === l.id ? {...l, s: null} : a)))
					}
					style={{animationDelay: `${i * 200}ms`}}
					className={`letter center ${l.s || "spent"}`}>
					{l.l}
				</h1>
			</Tilt>
		</div>
	)
}
