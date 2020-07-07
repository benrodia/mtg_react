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
		if (cooledDown && !document.activeElement.id) {	
			console.log(e)
			cooledDown = false
			setTimeout(()=>cooledDown=true,100)

			if (e.key === 'd') {this.props.moveCard()}
			else if (e.key === 'r') {this.props.startTest()}
			else if (e.key === 'q') {
			//this.props.handleGoToBuilder()	
			}
			else if (e.key === 'n') {this.props.handleTurns()}
			else if (e.key === 'b') {this.props.handleTurns(true)}
			else if (e.key === 'a') {this.props.gameFunction('attackAll')}
			else if (e.key === 'l') {this.props.gameFunction('playLand')}
			else if (e.key === 's') {this.props.handleShuffle()}
			else if (e.key === ',') {this.props.gameState('life',1,true)}
			else if (e.key === '.') {this.props.gameState('life',-1,true)}
			else if (e.key === '<') {this.props.gameState('eLife',1,true)}
			else if (e.key === '>') {this.props.gameState('eLife',-1,true)}
		}
	}
	
}

