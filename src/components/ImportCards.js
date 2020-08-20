import React, {useState,useEffect,useRef} from 'react'
import matchSorter from 'match-sorter'
import {v4 as uuidv4} from  'uuid'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'

import FillManabase from './FillManabase'
import CardControls from './CardControls'
import ImportFile from './ImportFile'

const {Q,log,sum,titleCaps,rnd,chooseCommander,legalCommanders,FORMATS,MAIN_BOARD,SIDE_BOARD,snippet,NUM_FROM_WORD} = utilities

export default connect(({
	deck:{list,format,desc},
	main:{legalCards,sets}
})=>{return {list,format,desc,legalCards,sets}},actions)
(({list,format,desc,sets,legalCards,addCard,openModal,changeDeck})=> {
	const exText = [...Array(7)].map((_,i)=>{
		if (!i) return 'ex.'
		const exQuant = rnd([...Array(3)].map((_,i)=>i))+1
		return exQuant+' '+rnd(legalCards.map(c=>c.name))
	}).join('\n')

	const [form,setForm] = useState('')
	const [cart,setCart] = useState([])
	const [meta,setMeta] = useState({})
	

	const interpretForm = content => {

		const items = content.split('\n')

		const meta = items.filter(r=>r.includes('\/\/'))
		setMeta(!meta.length?{}:Object.assign(...['NAME','CREATOR','FORMAT'].map(l=>{
			const prop = meta.filter(m=>m.includes(l))[0]
			return {[l.toLowerCase()]:prop&&prop.slice(prop.indexOf(':')+1).trim()}
		})))


		const interp = items.map((item,ind)=> {
			let [quantity,spaces] = [1,item.split(' ')]
			for (var i = 0; i < spaces.length; i++) 
				if (parseInt(spaces[i])>1) {
				 	quantity = parseInt(spaces[i])
				 	break
				}
			
			const setText = item.indexOf('[')?item.slice(item.indexOf('[')+1,item.indexOf(']')).toLowerCase(): ' '
			
			const cards = legalCards
				.filter(c=>item.includes(c.name))
				.sort((a,b)=>a.name.length< b.name.length?1:-1)
			const card = cards.filter(c=>c.set===setText)[0]||cards[0]||null

			
			return card&&{
				quantity,
				card: {...card,
					commander:item.includes('CMDR: '),
					board: items.slice(0,ind).filter(it=>it.includes('SB:')).length
						? SIDE_BOARD
						: MAIN_BOARD,
				}
			}
		})
		
		setCart(interp.filter(c=>c!==null)) 
		setForm(content) 

	}



	const importCart = _ => {
		let cards = []
		for (var i = 0; i < cart.length; i++) 
			cards = cards.concat([...Array(cart[i].quantity)].map(_=>cart[i].card))
		
		if(meta.format) changeDeck('format',meta.format)
		if(meta.name) changeDeck('name',meta.name)
		if(meta.creator) changeDeck('desc',`Original Creator: ${meta.creator} \n${desc}`)
	    addCard(cards)
	    openModal(null)
	}

	const total = sum(cart.map(c=>c.quantity))
		
	return <div className="quick-import">
			<h2>Import File</h2>
			<ImportFile accept='.txt,.dec,.mwDeck' callBack={file=>interpretForm(file)}/>
			<h2>Or paste in card names</h2>
			<form className="import-form">
				<textarea 
					value={form}
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
})


