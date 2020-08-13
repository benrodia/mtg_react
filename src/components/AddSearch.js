import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'


import BasicSelect from './BasicSelect'

function AddSearch({legalCards,filters,addCard,changeFilters}) {
	return <div className="add-search">
			<div className="search-bar">
			<h4>Search Cards</h4>
			<BasicSelect 
			limit={20}
			// filters={filters}
			options={legalCards} 
			callBack={addCard} 
			placeholder="Enter Card Name"
			/>
			</div>
		</div>
}

const select = state => {
	return {
		filters: state.filters,
	}
}

export default connect(select,actions)(AddSearch)