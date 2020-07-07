import React from 'react'
import {sum, dif, average} from '../functions/math.js'
import {BASIC_LANDS} from '../Constants'

import Modal from './Modal'


export default class FillManabase extends React.Component {
	render() {
		return <button className="fillBtn" onClick={this.addLands}>Auto Choose Lands</button>
	}

	evaluateLandNumber() {
		const list = this.props.deckInfo.list
		if (!list.length) {return}
		const maxCards = this.props.deckInfo.format == 'EDH' ? 100 : 60
		const currentLands = list.filter(c=>c.type_line.includes('Land')).length
		const currentNonLands = list.filter(c=>!c.type_line.includes('Land'))
		const averageCMC = average(currentNonLands.map(c=>c.cmc))
		const weightedLandTotal = Math.ceil((maxCards/3) + (averageCMC*2.5-7))
		const landNumToAdd = (weightedLandTotal - currentLands)
		return landNumToAdd
	}

	evaluateColorDensity(landNumToAdd) {
		let list = this.props.deckInfo.list
		if (!list.length) {return}
		let colors = ['W','U','B','R','G']
		let manaSymbolTotals = colors.map(color=>{
			return sum(list.map(card=>{
				if(card.cmc && card.mana_cost) return card.mana_cost.split('').filter(i=>i===color).length
				else return card.color_identity.filter(i=>i.includes(color)).length
			}))
		})
		let colorPercentages = manaSymbolTotals.map(symbols=>symbols/sum(manaSymbolTotals))
		let landsPerColor = (colorPercentages.map(perc=>Math.round(perc*landNumToAdd)))
		landsPerColor[landsPerColor.indexOf(Math.max(landsPerColor))] 
			-= sum(landsPerColor)-landNumToAdd
	
		return landsPerColor
	}

	createLandList(landsPerColor) {

		
		let fullList = []
		for (var i = 0; i < landsPerColor.length; i++) {
			for (var j = 0; j < landsPerColor[i]; j++) {
				fullList.push(BASIC_LANDS[i])
			}
		}
		return fullList
	}

	addLands() {

		const landNumToAdd = this.evaluateLandNumber()
		const landsPerColor = this.evaluateColorDensity(landNumToAdd)
		const fullList = this.createLandList(landsPerColor)
		
		if (window.confirm('Add ('+fullList.length+") cards? including: \n"+fullList.join('\n'))) {		
			for (var i = 0; i < fullList.length; i++) {
				console.log('fullList',fullList[i])
				const card = this.props.legalCards.filter(c=>c.name===fullList[i])[0]
				if (card) setTimeout(()=>{this.props.handleQuantity(card,1)},70)
			}
		}
	}
}