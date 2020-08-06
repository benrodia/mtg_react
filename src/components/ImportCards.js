import React, {useState,useEffect,useRef} from 'react'
import matchSorter from 'match-sorter'
import {v4 as uuidv4} from  'uuid'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import titleCaps from '../functions/titleCaps'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'
import {sum} from '../functions/utility'
import FillManabase from './FillManabase'
import CardControls from './CardControls'
import ImportTxt from './ImportTxt'


function ImportCards(props) {
	const {list,format,legalCards,addCard,openModal} = props
	console.log('legalCards',legalCards)

	const [cart,changeForm] = useState({form:'',cards:[]})

	const exText = [...Array(7)].map((ex,i)=>{
		if (!i) return 'ex.'
		const rng = Math.floor(Math.random()*legalCards.length)
		const exQuant = Math.floor(Math.random()*3+1)
		return exQuant+' '+legalCards.map(c=>c.name)[rng]
	}).join('\n')

	

	const interpretForm = (content,imported) => {

		const raw = content.split('\n')
		const meta = raw.filter(r=>r.includes('//'))
		const info = !meta.length?null:Object.assign(...['NAME','CREATOR','FORMAT'].map(l=>{
			const prop = meta.filter(m=>m.includes(l))[0]
			return {[l.toLowerCase()]:!prop?null:prop.substr(prop.indexOf(":")+1).trim()}
		}))

		// const allCards = raw.splice(meta.length)

		const interp = content.split('\n').map(item=> {
			// const boardArea = item.substr(0,item.indexOf(': ')) || ''
			// const board = boardArea.length<=0?'Main'
			// 	:boardArea.includes('SB')?'Side'
			// 	:boardArea.includes('MB')?'Maybe'
			// 	:boardArea.includes('CMDR')?'Command'
			// 	:'Main'
			
			const quantArea = item.substr(0,item.indexOf(' ')) 
			const quantity = quantArea.length<=0?1
			:!isNaN(parseInt(quantArea))?parseInt(quantArea):1
			// const setArea = item.substr(item.indexOf('['),item.indexOf(']')) || quantArea
			// const hasSet = setArea&&setArea.length>2

			const name = item.substr(item.indexOf(' ')).trim()
			const card = legalCards.filter(c=>c.name.toLowerCase()===name.toLowerCase())[0]
			// const card = !hasSet?cards[0]:cards.filter(c=>setArea.includes(c.set))[0]

			if (card!==undefined) {
				return {
					quantity: quantity,
					card: {...card},
				}
			} else return null
		})

		const adding = interp.filter(c=>c!==null)
		changeForm({form:content,cards:[...adding]}) 
	}



	const importCart = () => {
		let cards = []
		for (var i = 0; i < cart.cards.length; i++) {
			cards = cards.concat([...Array(cart.cards[i].quantity)].map(_=>cart.cards[i].card))
		}	
		console.log('importCart',cards)
	    addCard(cards)
	    openModal(null)
	}

	const total = sum(cart.cards.map(c=>c.quantity))
		
	return <div className="quick-import">
			<h2>Import .txt File</h2>
			<ImportTxt callBack={file=>interpretForm(file,true)}/>
			<h2>Or paste in card names</h2>
			<form className="import-form">
				<textarea 
					value={cart.form}
					rows={'15'}
					onChange={e=>interpretForm(e.target.value)}
					placeholder={exText}
				/>
			</form>
				{total
					?<button onClick={importCart}>Import {total} card{total!==1?'s':''}?</button>
					:null
				}
		</div>
}


const select = state => {
	return {
		list: state.deck.list,
		format: state.deck.format,
		legalCards: state.main.legalCards,
	}
}
export default connect(select,actions)(ImportCards)