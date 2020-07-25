import React from 'react'

let cooledDown = true

export default class TesterShortcuts extends React.Component {
	constructor(props) {
		super(props)
		this.addEvents = this.addEvents.bind(this)
	}
	render() {return null}

	componentDidMount() {window.addEventListener('keydown',this.addEvents)}

	componentWillUnmount() {window.removeEventListener('keydown',this.addEvents)}

	addEvents(e) {
		// console.log('TesterShortcuts',e.key)
		if (cooledDown && !document.activeElement.id) {	
			cooledDown = false
			setTimeout(()=>cooledDown=true,100)

			if (e.key === 'd') {this.props.moveCard({})}
			else if (e.key === 'r') {this.props.startTest()}
			else if (e.key === 'u') {this.props.cardState(this.props.deck,'tapped',false)}
			else if (e.key === 't') {this.props.cardState(this.props.deck,'tapped',true)}
			else if (e.key === 'n') {this.props.handleTurns()}
			else if (e.key === 'a') {this.props.gameFunction('attack')}
			else if (e.key === 'l') {this.props.gameFunction('playLand')}
			else if (e.key === 's') {this.props.handleShuffle()}
			else if (e.key === ',') {this.props.gameState('life',1,true,"You gained 1 life")}
			else if (e.key === '.') {this.props.gameState('life',-1,true,"You lost 1 life")}
			else if (e.key === '<') {this.props.gameState('eLife',1,true,"Enemy gained 1 life")}
			else if (e.key === '>') {this.props.gameState('eLife',-1,true,"Enemy lost 1 life")}
			else if (e.key === 'z') {this.props.undoAction(-1)}
		}
	}
	
}

