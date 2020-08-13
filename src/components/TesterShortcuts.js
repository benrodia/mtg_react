import React,{useState,useEffect,useRef} from 'react'

import {connect} from 'react-redux'
import {attackAll} from '../functions/gameLogic'
import * as actions from '../actionCreators'

function TesterShortcuts({
	moveCard,
	startTest,
	untap,
	handleTurns,
	handleCombat,
	landDrop,
	resStack,
	handleShuffle,
	gameState,
}) {
	
	const [cooledDown,coolDown] = useState(true)
	useEffect(_=>{
		const keyEvent = e => {
			if (cooledDown && !document.activeElement.id) {	
				coolDown(false)
				setTimeout(_=>coolDown(true),100)
				// console.log(e.key)

				switch (e.key) {
					case 'd': return moveCard()
					case 'r': return startTest()
					case 'u': return untap()
					case 'n': return handleTurns()
					case 'a': return handleCombat()
					case 'l': return landDrop()
					case 's': return handleShuffle()
					case ',': return gameState('life',1,true)
					case '.': return gameState('life',-1,true)
					case '<': return gameState('eLife',1,true)
					case '>': return gameState('eLife',-1,true)
				}
			}
		}
		window.addEventListener('keydown',keyEvent)
		return _=> window.removeEventListener('keydown',keyEvent)
	},[])
	return null
}

export default connect(null,actions)(TesterShortcuts)