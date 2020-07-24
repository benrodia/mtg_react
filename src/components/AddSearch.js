import React from 'react'

import CardSelect from './CardSelect'
import {COLORS,CARD_TYPES} from '../constants/definitions'

export default function AddSearch(props) {
const {legalCards,filters,addCard,changeState} = props

return	<div className="add-search">
		<div className="search-bar">
		<h4>Search Cards</h4>
		<CardSelect 
		limit={20}
		filters={filters}
		options={legalCards} 
		callBack={addCard} 
		placeholder="Enter Card Name"
		/>
		</div>
		<div className="filters">
			<h4>Containing</h4>
			<div className="operators">
					<button className={`smaller-button ${filters.all&&'selected'}`} onClick={()=>changeState('filters','all',!filters.all)}>			
						Must be
					</button>
					<button className={`smaller-button ${filters.only&&'selected'}`} onClick={()=>changeState('filters','only',!filters.only)}>			
						Only
					</button>
			</div>
			<div className="colors">
				{COLORS('symbol').map((co,i)=><span key={'color-filter-'+co}
				onClick={()=>changeState('filters',co,!filters[co])}
				className={`ms ms-${co.toLowerCase()} ${filters[co]?'selected-icon':''}`}
				/>
				)}
			</div>
			<div className="types">
				<CardSelect searchable
				multiValue
				limit={20}
				filters={filters}
				options={CARD_TYPES.map(t=>{return{name:t,key:t}})}
				callBack={types=>changeState('filters','types',types.map(t=>t.name))}
				/>
				
			</div>
		</div>					
	</div>
}