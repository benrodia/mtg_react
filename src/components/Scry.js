import React from 'react'

import '../functions/math'

export default class Scry extends React.Component {
	constructor(props) {
		super(props) 
		const libraryCards = this.props.deck.filter(c=>c.zone==="Library")
		this.state = {
			scryStarted: false,
			library: [...libraryCards],
			scryCards: [...libraryCards].slice(-1),
			remaining: null,
		}

		this.increaseScry = this.increaseScry.bind(this)
		this.scry = this.scry.bind(this)
		this.finishScry = this.finishScry.bind(this)
	}

	render() {
		const toScry = this.state.scryCards.length
		const scryTargets = [...this.state.scryCards].map((c,i)=>{
			return <ScryTarget 
			remaining={this.state.remaining} 
			card={c} 
			toScry={toScry}
			scry={this.scry}
			/>
		})
		const keepScrying = !this.state.scryStarted && this.state.scryCards.length<8
		
		return (
			<div className="scryContainer">
				<div className="scryOptions">
					<h1>Scry {toScry}</h1>
					<button 
					className={`increaseScry ${!keepScrying&&'disabled'}`}
					onClick={()=>this.increaseScry(keepScrying)}>+</button>
				</div>
				<div className="scryTargets">
					{scryTargets}
				</div>
			</div>
		)
	}

	increaseScry() {
		const total = this.state.scryCards.length+1
		this.setState({scryCards: this.state.library.slice(-total)})
	}

	scry(dest,toScry,card) {

		if (!this.state.scryStarted) {
			const library = this.state.library
			library.length = library.length-toScry
			this.setState({
				scryStarted: true,
				library: library,
				remaining: this.state.scryCards
			})
		}

		let remaining = this.state.remaining || this.state.scryCards
		let newLib = [...this.state.library]

		if (remaining.length) {
			remaining = remaining.filter(c=>c.id!==card.id)
			if (dest == 'top') {
				newLib.push(card)
			} else if (dest == 'bottom') {
				newLib.unshift(card)
			}
			else {
				card.zone = dest
				newLib.push(card)
			}
			this.setState({
				library: newLib,
				remaining: remaining
			})
		} 
		if(!remaining.length) {this.finishScry()}

	}

	finishScry() {
		const scried = this.state.library.concat(this.props.deck).unique(); 
		this.props.gameState(scried)
		this.props.handleModal()
		
		console.log('finishScry',scried)
	}


}


class ScryTarget extends React.Component {
	constructor(props) {
		super(props)
		this.state = {option: null}
	}
	render() {
		const scried = this.props.remaining&&!this.props.remaining.filter(r=>r.id===this.props.card.id).length?true:false
		const buttons = ['top','bottom','Hand','Graveyard']
		return <div className="scryTarget">
				<img className={`scryImg ${scried?'scried':''}`} src={this.props.card.image_uris.png||this.props.card.image_uris.large}/>
				{buttons.map(b=>{
				return <button 
					className={!this.state.option?'':this.state.option===b?'choice':'not'} 
					onClick={()=>{
						this.setState({option:b})
						this.props.scry(b,this.props.toScry,this.props.card)
					}
					}>{b}</button>					
				})}
			</div>

	}
}

