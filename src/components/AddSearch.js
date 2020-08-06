import React from 'react'
import {connect} from 'react-redux'

import * as actions from '../actionCreators'

import CardSelect from './CardSelect'
import {COLORS,CARD_TYPES} from '../constants/definitions'

function AddSearch(props) {
const {legalCards,filters,addCard,cacheState} = props

	const display = (
		<div className="add-search">
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
						<button className={`smaller-button ${filters.all&&'selected'}`} onClick={()=>cacheState('filters','all',!filters.all)}>			
							Must be
						</button>
						<button className={`smaller-button ${filters.only&&'selected'}`} onClick={()=>cacheState('filters','only',!filters.only)}>			
							Only
						</button>
				</div>
				<div className="colors">
					{COLORS('symbol').map((co,i)=><span key={'color-filter-'+co}
					onClick={()=>cacheState('filters',co,!filters[co])}
					className={`ms ms-${co.toLowerCase()} ${filters[co]?'selected-icon':''}`}
					/>
					)}
				</div>
			</div>					
		</div>
	)
	return null
}

const select = state => {
	return {
		filters: state.filters,
	}
}

export default connect(select,actions)(AddSearch)