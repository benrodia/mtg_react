import React from 'react'
import {sum, dif, average} from '../functions/math.js'

export default class DataVis extends React.Component {
	render() {
		const data = {
			color: getColorData(this.props.deckInfo.list),
			costs: null
		}

		const display = (
			<div className="dataVis">
				<div className="colors">
					<h2>Color Breakdown</h2>
					<div className="chart">
						{data.color.map(d=><div key={d.val} className="colorData" style={{'background':d.val,'width':d.perc+'vw'}}></div>)}
					</div>
				</div>
			</div>
		)
		return display
	}
} 

function getColorData(deckList) {
		// console.log('deckList',deckList)

		let colorData = [
			{
				name:'W',
				val: '#eed',
			},
			{
				name:'U',
				val:'#69f',
			},{
				name: 'B',
				val: '#434',
			},
			{
				name:'R',
				val: '#f97',
			},
			{
				name: 'G',
				val: '#9f7',
			}
		]
		if (!deckList.length) {return colorData}
		const manaSymbolTotals = colorData.map(color=>{
			return sum(deckList.map(card=>{
				if(card.cmc && card.mana_cost){return card.mana_cost.split('').filter(i=>i===color.name).length}
				else{return 0}
			}))
		})
		const colorPercentages = manaSymbolTotals.map(symbols=>symbols/sum(manaSymbolTotals)*100)
		colorData = colorData.map((c,i)=>{
			c.perc = colorPercentages[i]
			c.total = manaSymbolTotals[i]
			return c
		})
		return colorData
	}
