import React,{useState} from 'react'
import Select from 'react-select'
import SVG from 'react-inlinesvg'

import {sum} from '../functions/utility'
import {Q,itemizeDeckList, isLegal,audit} from '../functions/cardFunctions'
import titleCaps from '../functions/titleCaps'

import {RARITY_COLOR,SINGLETON} from '../constants/definitions'
import {FILTER_TERMS,NUMBER_WORDS} from '../constants/data_objects'
import {DUAL_COMMANDER} from '../constants/greps'

import DropSlot from './DropSlot'
import CardSelect from './CardSelect'
import BasicSelect from './BasicSelect'
import CardControls from './CardControls'
import Card from './Card'

export default function ListBoard(props) {
	const {legalCards,sets,deckInfo,board,layout,openModal,addCard,changeState,changeBoard,header} = props
	const {list,format,color_identity} = deckInfo
	const {view} = layout
	
	let cards = list.filter(c=>c.board===board)
	

	const boardInner = () => {
		const Filter_By = FILTER_TERMS.filter(t=>t.name===layout.sortBy)[0]
		const sortBy = {...Filter_By,
			vals: Filter_By.vals||cards.map(c=>c[Filter_By.key]).sort(),
			other: Filter_By.other||`Missing ${Filter_By.name}`
		}

		const sorted = (val,ind) => {

			const filteredCards = ind==='other'
			?cards
			:cards.filter(c=>{
				c = sortBy.subKey?c[sortBy.key]:c
				const key = sortBy.subKey||sortBy.key
				
				return c[key]===undefined||c[key]===null?false
				: typeof c[key]==='number'?c[key]<=val
				: Array.isArray(c[key]) ? c[key].length?c[key].join('')===val:'C'===val
				: Q(c,key,val) 
			})

			cards = cards.filter(b=>!filteredCards.filter(c=>c.key===b.key).length)
			
			const cardStacks = itemizeDeckList(filteredCards,['name']).orderBy('name')
			const valName = sortBy.valNames&&!isNaN(ind)?sortBy.valNames[ind]:val.toString()
		
			return !cardStacks.length ? null
			:	<div key={board+"_"+sortBy.key+"_"+valName} className={`${valName}-list list ${view}-view`}>
					<h3 style={{display:board==='Command'&&'none'}}>{<div className={`icon ms ms-${val.toString().toLowerCase()}`}/>} {titleCaps(layout.sortBy=='Type'?valName==='Sorcery'?'Sorceries':valName+'s':valName)} ({filteredCards.length})</h3>
					<div className={`${view}-inner`}>				
						{cardStacks.map(c=>renderCardStack(c))}
					</div>
				</div>
		}

		return <>
			{sortBy.vals.map((val,ind)=>sorted(val,ind))}
			{sorted(sortBy.other,'other')}
		</>

	}


	const renderCardStack = cards => {
		const legal = isLegal(cards[0],format,color_identity) 
		const numOfSets = itemizeDeckList(cards,['set_name'])
		return <div className={`of-name`}>	
		{numOfSets.map(cardsOfSet=>cardsOfSet.map((card,cardInd)=>{
			const setLogo = <span className="icon">	
				<SVG className={card.rarity} title={card.set_name}
				  src={!sets||!sets.length?null:sets.filter(s=>s.name===card.set_name)[0].icon_svg_uri}
				  loader={<span>{card.set}</span>}
				  onError={error => console.log(error.message)}
				/>
			</span>

			return <CardControls 
			key={card.key} card={card} 
			type={card.key.includes('Commander')?'commander':'card'}
			openModal={openModal}
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
				<span onClick={()=>openModal(printSelector(card))}>
				{view==='list'?setLogo
				:<button>{setLogo} {card.set_name}</button>}
				</span>

			</CardControls>
		}))}
		</div>
	}

	const printSelector = card => {	
		const options = legalCards.filter(print=>print.name===card.name).map(print=>{
			return <div className='print-select-card' onClick={()=>{
					const newCard = {...print,key:card.key,board:card.board}
					changeState('deckInfo','list',list.map(c=>c.key===newCard.key?newCard:c))
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
	// return <BasicSelect 
	// 		self={card}
	// 		options={legalCards.filter(c=>c.name===card.name)} 
	// 		// key={legalCards.filter(c=>c.name===card.name)}//keep this
	// 		labelBy={'set_name'} valueBy={'set_name'}
	// 		placeholder={"Change printing"}		
	// 		img={card=>view==='list'?
	// 		<SVG className={card.rarity} title={card.set_name}
	// 		  src={sets&&sets.filter(s=>s.name===card.set_name)[0].icon_svg_uri}
	// 		  loader={<span>{card.set}</span>}
	// 		  onError={error => console.log(error.message)}
	// 		/>:undefined}
	// 		callBack={} 
	// 	/>
	
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
			<DropSlot key={"slot"+board} board={board}
			accept={board==='Command'?'commander':['card','commander']}
			callBack={changeBoard}
			>
			<div className={`board-inner ${view}`}>{boardInner()}</div>
			</DropSlot>
		</div>
}






