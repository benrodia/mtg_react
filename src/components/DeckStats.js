import React,{useState} from 'react'
import { PieChart } from 'react-minimal-pie-chart';
import {Canvas} from 'react-canvas-js'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'
const {COLORS,sum,rem,log,titleCaps,FILTER_TERMS,filterCardType} = utilities


export default connect(({main:{legalCards},deck:{list},filters:{sortBy,customFields}})=>{return {legalCards,list,sortBy,customFields}},actions)
(({list,legalCards,sortBy,customFields,changeFilters,openModal,optimizePrices})=> {


	const getGraph = (graph,dataType) => {
		const F = FILTER_TERMS.filter(t=>t.name===dataType)[0]||{}
		const category = {...F,
			vals: dataType==='Custom'?(customFields.map(f=>f.key))
			: F.vals || list.map(c=>c[F.key]).sort(),
			valNames: F.valNames || list.unique(F.key).map(c=>c[F.key]),
		}		
		let {name,key,vals,valNames,fill} = category
		vals = vals.filter((v,i)=>!!v&&!!valNames[i]).slice(0,20)

		const data = vals.map((val,i)=>{
			const value = filterCardType(list,category,val).length
			const C = base => parseInt(((256/3)/(1+vals.length)*i*base))
			const color = fill?fill[i]:`rgb(${C(3)},${C(2)},${C(1)})`
			return {title:valNames[i],label:valNames[i],value,color,category}
		})
		return graph==='pie'?
		<PieChart 
		data={data}
		label={({dataEntry})=>`${dataEntry.title} (${dataEntry.value})`}
		labelStyle={{
			fontSize: "5px",
			fill: "#FFFFFF",
		}}
		startAngle={270}
		onClick={(_,i)=>changeFilters('focus',{key,val:vals[i]})}
		labelPosition={60}
		viewBoxSize={[100, 100]}
        />
        :graph==='bar'? 
		<div>
		{data.map((d,i)=>{
			const barRatio = d.value/Math.max(...data.map(_=>_.value))
			return !d.value?null:
			<span onClick={(_,i)=>changeFilters('focus',{key,val:vals[i]})} className="bar">
				<span className={`graph icon ms ms-${valNames[i].toLowerCase()}`} style={{width:rem(barRatio*17),background:d.color}}>
				{titleCaps(d.label||'')} ({d.value})
				</span>
			</span>
		})}
		</div>
		:null
	}

 
	return <div className="stats">
		<div className="price-stats">
		{getGraph('pie','Type')}
		{getGraph('pie','Rarity')}
		{getGraph('bar','CMC')}
		<h3>Total List Price: <br/>${Math.round(sum(list.map(c=>c.prices.usd)))} / {Math.round(sum(list.map(c=>c.prices.tix)))} TIX</h3>
		{!list.filter(c=>!c.prices.usd).length?null:<i>(Missing price data for {list.filter(c=>!c.prices.usd).length} cards.)</i>}
		<button className="optimize-prices" onClick={_=>openModal(optimizePrices)}>Optimize Prices</button>
		</div>
	</div>
})
