import React from 'react'

import Search from './Search'

import titleCaps from '../functions/titleCaps'
import isLegal from '../functions/cardFunctions'



const rndListNames = [
	"Timmy's BIG Surprise",
	"Roon's War Crimes",
	"Kaput",
	"Septa",
	"Something Clever",
	"Lord of Shit Mountain",
	"Johnny Cash Money"
]
let exName = 'ex. '+ (rndListNames[Math.floor(Math.random()*rndListNames.length)])


export default class DeckInfo extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const formats = ['brawl','commander','duel','future','legacy','modern','oldschool','pauper','penny','standard','vintage','casual']
		const exDesc = "ex. \nI'm a new and impressionable deck that needs guidance and a good description."

		return (
			<div className='info'>

				<section className="addInfoArea">
					<h3>Name</h3>
					<input className='nameEntry' type='text' value={this.props.deckInfo.name} placeholder={exName} onChange={(e)=>this.props.changeDeck('name',e.target.value)}></input>
					<h3>Description</h3>
					<textarea className='descEntry' rows='5' type='text' value={this.props.deckInfo.desc} placeholder={exDesc} onChange={(e)=>this.props.changeDeck('desc',e.target.value)}></textarea>
					<div className="format">
						<h3>Format</h3>
						<select value={this.props.deckInfo.format} className="selectFormat" onChange={e=>this.props.changeDeck('format',e.target.value)}>
							{formats.map(op=><option key={op+'Op'} value={op}>{titleCaps(op)}</option>)}
						</select>
						<div style={{display: this.props.deckInfo.format !== 'commander' && 'none'}}>
							<h3>Commander</h3>
						</div>
					</div>
				</section>
				
			</div>
		)
	}


}
