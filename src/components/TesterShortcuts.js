import React,{useState,useEffect,useRef} from 'react'

import {connect} from 'react-redux'
import {attackAll} from '../functions/gameLogic'
import * as actions from '../actionCreators'

function TesterShortcuts(props) {
	const [cooledDown,coolDown] = useState(true)
	useEffect(_=>{
		console.log('TesterShortcuts')
		const keyEvent = e => {
			console.log(e)
			if (cooledDown && !document.activeElement.id) {	
				coolDown(false)
				setTimeout(()=>coolDown(true),100)

				switch (e.key) {
					case 'd': return props.moveCard()
					case 'r': return props.startTest()
					case 'u': return props.untap()
					case 'n': return props.handleTurns()
					case 'a': return props.gameFunction('attack')
					case 'l': return props.gameFunction('playLand')
					case 's': return props.handleShuffle()
					case ',': return props.gameState('life',1,true,"You gained 1 life")
					case '.': return props.gameState('life',-1,true,"You lost 1 life")
					case '<': return props.gameState('eLife',1,true,"Enemy gained 1 life")
					case '>': return props.gameState('eLife',-1,true,"Enemy lost 1 life")
					// case 'z': props.undoAction(-1)
				}
			}
		}
		window.addEventListener('keydown',keyEvent)
		return _=> window.removeEventListener('keydown',keyEvent)
	},[])
	return null
}

export default connect(null,actions)(TesterShortcuts)