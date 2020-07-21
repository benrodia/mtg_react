import React from 'react'
import BasicSelect from './BasicSelect'
import {Q} from '../functions/cardFunctions'
import {COUNTERS} from '../constants/data_objects'

export default function Counters(props) {
	const {card,cardState} = props
	const counters = card.counters
	
	const countersDisplay = Object.entries(counters).map(c=>{
			return <div key={c[0]+c[1]} className="counter" onClick={()=>changeCounters(c[0],-1)}>
			{
				c[0]==='PlusOne'
				?c[1]>=0?`+${c[1]}/+${c[1]}`:`${c[1]}/${c[1]}`
				:c[1]?c[1]>1?`${c[1]} ${c[0]}`:c[0]:null
			}
			</div>
	})
	const changeCounters = (type,amt) => {cardState(card,'counters',{...counters,[type]:amt+(counters[type]||0)})}
	
	const defaultCounter = 
	 Q(card,'type_line','creature')?'PlusOne'
	:Q(card,'type_line','planeswalker')?'Loyalty'
	:null

	return <>
		<div className="add-counters">	

			{!defaultCounter?null:<button className='smaller-button' onClick={()=>changeCounters(defaultCounter,1)}>{defaultCounter=="PlusOne"?'+1/+1':defaultCounter}</button>}
			<BasicSelect 
			searchable
			placeholder='Add Counter'
			options={COUNTERS.map(C=>{return{label: C,value:C}})}
			callBack={counter=>changeCounters(counter.label,1)}
			/>
		</div>
		<h3 className="counters-display">{countersDisplay}</h3>
	</>

}