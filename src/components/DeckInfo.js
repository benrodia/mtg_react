import React from 'react'
import {connect} from 'react-redux'

import * as actions from '../actionCreators'

import {FORMATS} from '../constants/definitions'
import {EXAMPLE_DECK_NAMES,EXAMPLE_DECK_DESCS} from '../constants/data'

import BasicSelect from './BasicSelect'


const exName = 'ex. '+ (EXAMPLE_DECK_NAMES[Math.floor(Math.random()*EXAMPLE_DECK_NAMES.length)])
const exDesc = 'ex. \n'+ (EXAMPLE_DECK_DESCS[Math.floor(Math.random()*EXAMPLE_DECK_DESCS.length)])

function DeckInfo({name,desc,format,changeDeck}) {
	return <div className='info-bar'>
		<div className="name">
			<h3 className='field-label'>Name</h3>
			<input className='nameEntry' type='text' 
			maxLength={15} value={name} placeholder={exName} 
			onChange={e=>changeDeck('name',e.target.value)}
			/>
		</div>		
		<div className="format">
			<h3 className='field-label'>Format</h3>
			<BasicSelect 
				self={format}
				options={FORMATS} 
                callBack={e=>changeDeck('format',e)} 
            />
		</div>
		<div className="desc">
			<h3 className='field-label'>Description</h3>
			<textarea className='desc-entry' rows='5' type='text' value={desc} 
			placeholder={exDesc} 
			onChange={e=>changeDeck('desc',e.target.value)}
			/>
		</div>	
	</div>
}


const select = state => {
	return {
		name: state.deck.name,
		format: state.deck.format,
		desc: state.deck.desc,
	}
}

export default connect(select,actions)(DeckInfo)