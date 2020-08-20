import React from 'react'
import {Q} from '../functions/cardFunctions'
import {sum, dif, average} from '../functions/utility'
import {COLORS} from '../constants/definitions'

import Modal from './Modal'


export default function FillManabase(props) {
	return null

	// constructor(props) {
	// 	super(props)
	// 	this.state = {
	// 		lands: [],
	// 		useCycles: []
	// 	}
	// 	this.getFacts = this.getFacts.bind(this)
	// 	this.addLands = this.addLands.bind(this)
	// }

	// componentDidMount(){this.getFacts()}

	// render() {
	// 	return (
	// 		<div className="add-lands">
	// 			<h2>Fill out your manabase the Easy Way(tm)</h2>
	// 			<div className="analysis">
	// 				<p>Based on the curve of your deck as it stands, you should aim for about {this.state.landTotal} lands.</p>
	// 				<p>Taking that, your current manabase, and your color distribution, you could get your basics easy with:</p>
	// 				{	this.state.landsPerColor&&
	// 					this.state.landsPerColor
	// 					.map((l,i)=>l?<div className="color-src"> {l} {l!==1&&i?COLORS[i].basic+"s":COLORS[i].basic}</div>:null)
	// 				}
	// 			</div>
	// 			<button className="fillBtn" onClick={this.addLands}>
	// 				Add {this.state.totalToAdd||null} Lands
	// 			</button>
	// 		</div>
	// 	)
	// }


	// evalTotalLands() {

	// 	const list = this.props.deckInfo.list
	// 	if (!list.length) {return 'uhhh, idk how many'}
	// 	const maxCards = this.props.deckInfo.format == 'commander' ? 100 : 60
	// 	const currentLands = Q(list,'type_line','Land').length
	// 	const currentNonLands = Q(list,'type_line','Land',false)
	// 	console.log('currentNonLands',currentNonLands)
	// 	const averageCMC = average(currentNonLands.map(c=>c.cmc))
	// 	const weightedLandTotal = Math.ceil((maxCards/3) + (averageCMC*3-7))
	// 	return weightedLandTotal
	// }

	// evalColorDensity(landNumToAdd) {
	// 	const list = this.props.deckInfo.list
	// 	if (!list.length) {return}
	// 	const colors = COLORS('symbol')
	// 	const manaSymbolTotals = colors.map(color=>{
	// 		return sum(list.map(card=>{
	// 			if(card.cmc && card.mana_cost) return card.mana_cost.split('').filter(i=>i===color).length
	// 			else return Q(card,'color_identity',color).length
	// 		}))
	// 	})

	// 	const colorPercentages = manaSymbolTotals.map(symbols=>symbols/sum(manaSymbolTotals))
		
	// 	console.log('colorPercentages',colorPercentages)
	// 	let landsPerColor = (colorPercentages.map(percent=>Math.round(percent*landNumToAdd)))
	// 	landsPerColor[landsPerColor.indexOf(Math.max(landsPerColor))] 
	// 		-= sum(landsPerColor)-landNumToAdd
	// 	console.log('landsPerColor',landsPerColor)
	
	// 	return landsPerColor
	// }

	// createLandList(landsPerColor) {
		
	// 	let fullList = []
	// 	for (var i = 0; i < landsPerColor.length; i++) {
	// 		if (landsPerColor) {
	// 			fullList.push({
	// 				card: this.props.legalCards.filter(c=>c.name===COLORS('basic')[i])[0],
	// 				quant: landsPerColor[i]
	// 			})
	// 		}
	// 	}
	// 	return fullList
	// }

	// addLands() {		

	// 		let toAdd = this.state.fullList
	// 		const addCards = setInterval(()=>{
	// 		for (var i = 0; i < toAdd.length; i++) {
	// 			if (toAdd[i].card&&toAdd[i].quant) {
	// 				this.props.handleQuantity(toAdd[i].card,null)
	// 				toAdd[i].quant--
	// 			} 
	// 			else toAdd.splice(i,1)
	// 		}		
	// 		if (!toAdd.length) {clearInterval(addCards)}
	// 	},100)


	// }

	// getFacts() {
	// 	const currentLands = Q(this.props.deckInfo.list,'type_line','Land').length
	// 	const landTotal = this.evalTotalLands()
	// 	const landsPerColor = this.evalColorDensity(landTotal-currentLands)
	// 	const fullList = this.createLandList(landsPerColor)		
		
	// 	this.setState({
	// 		landTotal: landTotal,
	// 		totalToAdd: landTotal-currentLands,
	// 		landsPerColor: landsPerColor,
	// 		fullList: fullList
	// 	})
	// }
}