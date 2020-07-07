import React from 'react'
import Select from 'react-select'

import {sum} from '../functions/math.js'
import {itemizeDeckList, isLegal} from '../functions/cardFunctions'
import titleCaps from '../functions/titleCaps'

import {FILTER_TERMS} from '../Constants'

import DragContainer from './DragContainer'
import DropSlot from './DropSlot'
import CustomSelect from './CustomSelect'
import Card from './Card'
import CardControls from './CardControls'
import QuantButtons from './QuantButtons'


export default function ListBoard(props) {

	const cards = props.deckInfo.list.filter(c=>c.board===props.board)
	return (
		<div className={`board ${props.board}-board ${props.layout.focus===props.board && 'focus'}`}>
			<h2 onClick={()=>props.changeLayout('focus',props.board)}>{props.board}board ({cards.length})</h2>
			<div className="board-inner">
				{board(props.board,cards,props)}
			</div>
		</div>
		)
}



function board(board,cards,props) {
	const Filter_By = FILTER_TERMS.filter(t=>t.name===props.layout.sortBy)[0]
	const sortBy = {
		prop: Filter_By.prop,
		vals: Filter_By.vals?Filter_By.vals:props.deckInfo.list.map(c=>c[Filter_By.prop]).unique().sort()
	}

	const filteredAreas = sortBy.vals.map(val=>{
		const filteredCards = cards.filter(c=>c[sortBy.prop].includes(val)&&c.board===board)
		// if (val!=='Creature'&&sortBy.prop=="Type") {cards = cards.filter(card=>!card.type_line.includes('Creature'))}
		const cardStacks = filteredCards.length
		?itemizeDeckList(filteredCards)
			// .sort((a,b)=>a.name>b.name?1:-1)
		:[]
		
		return (
			<div style={{display:!cardStacks.length&&'none'}} key={board+"_"+sortBy.prop+"_"+val} className={`${val}-list ${props.layout.view}-view`}>
				<h3>{titleCaps(props.layout.sortBy=='Type'?val==='Sorcery'?'Sorceries':val+'s':val)} ({filteredCards.length})</h3>
				<div className={`${props.layout.view}-inner`}>				
					{cardStacks.map(c=>renderCardStack(c,props,board))}
				</div>
			</div>
		)
	})

	return (
		<DropSlot 
		key={"slot"+board}
		board={board}
		accept={'card'}
		callBack={props.changeBoard}
		>
		{filteredAreas}
		</DropSlot>
	)	
}


function renderCardStack(cards,props,board) {
	return (cards.map((card,i)=>{
		if (props.layout.view==='grid'||i===0) {
			return (
			<div key={board+card.key+i} className={`${props.layout.view}-card`}>
			<DragContainer key={card.key} item={card}>
				<CardControls key={card.key} card={card} openModal={props.openModal}>
					<div className="controls">					
						<QuantButtons {...props} item={card} dest={board}
						total={cards.length}
						limit={isLegal(card,props.deckInfo.format)}
						callBack={props.handleQuantity}
						showQuant={props.layout.view==='list'}
						/>
						{printSelector(card,props)}
					</div>
					<Card card={card} cardHeadOnly={props.layout.view==='list'}/>
				</CardControls>
			</DragContainer>
			</div>
		)}
		else return null
	})) 
}


function printSelector(card,props) {
	let allPrintings = props.legalCards.filter(c=>c.name===card.name)
	if (allPrintings.length>1) {			
		return <CustomSelect 
				defaultVal={card.set_name}
				forPrint={card}
				labelBy={'set_name'}
				options={allPrintings} 
				callBack={props.changeList} 
				placeholder={"Change printing"}
				/>
	}
	else return null
}







