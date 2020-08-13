import React from 'react'
import {connect} from 'react-redux'

import * as actions from '../actionCreators'

import {Q,itemizeDeckList, isLegal,audit} from '../functions/cardFunctions'
import {titleCaps,pluralize} from '../functions/text'

import {FILTER_TERMS,NUMBER_WORDS,ItemTypes} from '../constants/data'
import {SINGLETON,DUAL_COMMANDER} from '../constants/greps'

import DropSlot from './DropSlot'
import BasicSelect from './BasicSelect'
import CardControls from './CardControls'
import Card from './Card'
import Icon from './Icon'
import ItemInput from './ItemInput'

function ListBoard({
	legalCards,
	sets,
	list,
	format,
	color_identity,
	board,
	view,
	sortBy,
	openModal,
	addCard,
	changeDeck,
	changeFilters,
	changeField,
	header,
	customFields
}) {	
	let cards = list.filter(c=>c.board===board)
	
	const boardInner = _ => {
		const Filter_By = FILTER_TERMS.filter(t=>t.name===sortBy)[0]
		console.log(board,'sortBy',sortBy,'Filter_By',Filter_By,'FILTER_TERMS',FILTER_TERMS)
		const category = {...Filter_By,
			vals: sortBy==='Custom'?(customFields.map(f=>f.key))
			: Filter_By.vals || cards.map(c=>c[Filter_By.key]).sort(),
			valNames: sortBy==='Custom'?(customFields.map(f=>f.name))
			:Filter_By.valNames,
			other: Filter_By.other||`Missing ${Filter_By.name}`
		}

		const sorted = (val,ind) => {
			const filteredCards = ind==='other'
			?cards
			:cards.filter(c=>{
				c = category.subKey?c[category.key]:c
				const key = category.subKey||category.key
				return c[key]===undefined||c[key]===null?false
				: typeof c[key]==='number'?c[key]<=val
				: Array.isArray(c[key]) ? c[key].length?c[key].join('')===val:'C'===val
				: Q(c,key,val) 
			})

			cards = cards.filter(b=>!filteredCards.filter(c=>c.key===b.key).length)
			
			const cardStacks = itemizeDeckList(filteredCards,['name']).orderBy('name')
			const valName = category.valNames&&!isNaN(ind)?category.valNames[ind]:val.toString()
			
			if (category.name==='Custom'&&board==='Main'&&ind!=='other') {
				return <DropSlot key={"custom"+valName} field={val}
				accept={[ItemTypes.CARD,ItemTypes.COMMANDER]}
				callBack={c=>changeField(c,'customField',val)}
				>	
					<div key={board+"_"+category.key+"_"+valName} className={`${valName}-list list ${view}-view`}>
						<h3 style={{display:board==='Command'&&'none'}}>
						<ItemInput changeable removable 
						value={{name:titleCaps(valName),key:val}} 
						list={customFields} 
						callBack={n=>changeFilters('customFields',n)}
						/> ({filteredCards.length})
						</h3>
						<div className={`${view}-inner`}>				
							{cardStacks.map((c,i)=>renderCardStack(c,i,valName))}
						</div>
					</div>	
				</DropSlot>
			}
			else return !cardStacks.length ? null
			:	<div key={board+"_"+category.key+"_"+valName} className={`${valName}-list list ${view}-view`}>
					<h3 style={{display:board==='Command'&&'none'}}><div className={`icon ms ms-${val.toString().toLowerCase()}`}/> {titleCaps(pluralize(valName))} ({filteredCards.length})</h3>
					<div className={`${view}-inner`}>				
						{cardStacks.map((c,i)=>renderCardStack(c,i,valName))}
					</div>
				</div>
		}

		return <>
			{category.vals.map((val,ind)=>sorted(val,ind))}
			{sorted(category.other,'other')}
		</>

	}


	const renderCardStack = (cards,i,val) => {
		const legal = isLegal(cards[0],format) 
		const numOfSets = itemizeDeckList(cards,['set_name'])
		return <div key={board+val+i} className={`of-name`}>	
		{numOfSets.map(cardsOfSet=>cardsOfSet.map((card,cardInd)=>{
			const setLogo = <Icon name={card.set_name}
			className={card.rarity} 
			loader={card.set} 
			src={!sets.length?null:sets.filter(s=>s.name===card.set_name)[0].icon_svg_uri} 
			/>
			return <CardControls 
			key={card.key} card={card} 
			itemType={card.key.includes('Commander')
				?ItemTypes.COMMANDER
				:ItemTypes.CARD}
			imgSize='small'
			illegal={cards.length>legal?cardInd>=legal:false}
			cardHeadOnly={view==='list'&&board!=='Command'}
		    style={{
		      position:(cardInd>0&&view==='grid') && 'absolute',
		      marginTop:(cardInd>0&&view==='grid') && (cardInd-cardsOfSet.length-10)+"rem",
		      pointerEvents: (cardInd!==cardsOfSet.length-1&&view==='grid') && 'none',
		      marginBottom:(cardsOfSet.length>1&&!cardInd&&view==='grid') && cardsOfSet.length+"rem",
		    }}
			>
				<div className={`quantity ${view==='list'&&cardInd!==0?'hide':''}`}>
					<span className={`icon-sort-up ${cards.length>=legal?'disabled':''}`} onClick={()=>addCard(card,board)}/>
					<span className="icon-sort-down" onClick={()=>addCard(card,board,true)}/>
				</div>
				<span onClick={_=>openModal(printSelector(card))}>
				{view==='list'?setLogo:<button>{setLogo} {card.set_name}</button>}
				</span>

			</CardControls>
		}))}
		</div>
	}

	const printSelector = card => {	
		const options = legalCards.filter(print=>print.name===card.name).map(print=>{
			return <div className='print-select-card' onClick={_=>{
					const newCard = {...print,
						key:card.key,
						board:card.board,
						customField:card.customField
					}
					changeDeck('list',list.map(c=>c.key===newCard.key?newCard:c))
					openModal(null)
				}}>
				<h4>{print.set_name}</h4>
				<Card classes={`${print.set_name===card.set_name?'selected':'not-selected'}`} imgSize={'png'} card={print}/>
			</div>
		})
		return <div className="choose-print">
			<h2>Change Printing</h2>
			<div className="options">
				{options}
			</div>
		</div>

	}
	
	const title = `${board}${board==='Command'
			?cards.length>1||Q(cards,...DUAL_COMMANDER).length
			?'ers':'er':'board'}`

	const illegalAmt = board==='Main'&&
		cards.length<(SINGLETON(format)?99:60)
		||cards.length>(SINGLETON(format)?99:600)

	const amt = board==='Command'?null
		:<span style={{color:illegalAmt&&'#f46'}}> ({cards.length})</span>
		

	return <div className={`board ${board}-board`}>
			<div className="list-head">
				<h2>{title}{amt}</h2> {header||null}
			</div>
			<DropSlot key={"slot"+board} field={board}
			accept={board==='Command'?ItemTypes.COMMANDER:[ItemTypes.COMMANDER,ItemTypes.CARD]}
			callBack={c=>changeField(c,'board',board)}
			>
			<div className={`board-inner ${view}`}>{boardInner()}</div>
			</DropSlot>
		</div>
}






const select = state => {
	return {
		sets: state.main.sets,
		legalCards: state.main.legalCards,
		view: state.filters.view,
		sortBy: state.filters.sortBy,
		customFields: state.filters.customFields,
		list: state.deck.list,
		format: state.deck.format,
	}
}

export default connect(select,actions)(ListBoard)