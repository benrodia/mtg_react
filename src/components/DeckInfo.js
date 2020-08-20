import React,{useState,useEffect} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'

const {EXAMPLE_DECK_NAMES,EXAMPLE_DECK_DESCS,rnd} = utilities

export default connect(({deck:{name,format,desc}})=>{return {name,format,desc}},actions)
(({name,desc,format,changeDeck})=> {
	const [exName,setExName] = useState('')
	const [exDesc,setExDesc] = useState('')
	useEffect(_=>{setExName('ex. '+ (rnd(EXAMPLE_DECK_NAMES)))},[name])
	useEffect(_=>{setExDesc('ex. \n'+ (rnd(EXAMPLE_DECK_DESCS)))},[desc])

	return <div className='info-bar'>
		<div className="name">
			<h3 className='field-label'>Name</h3>
			<input className='nameEntry' type='text' 
			maxLength={15} value={name} placeholder={exName} 
			onChange={e=>changeDeck('name',e.target.value)}
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
})