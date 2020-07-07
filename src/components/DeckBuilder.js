import React from 'react'
import Select from 'react-select'
import {v4 as uuidv4} from  'uuid'

import CustomSelect from './CustomSelect'
import ImportCards from './ImportCards'
import ListBoard from './ListBoard'

import FillManabase from './FillManabase'
import DataVis from './DataVis'

import {FILTER_TERMS, BOARDS} from '../Constants'
import {itemizeDeckList, isLegal, setPrint} from '../functions/cardFunctions'


export default class DeckBuilder extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			layout: {
				view: 'grid',
				sortBy: 'Type',
				focus: 'Main'
			}
		}
		
		this.changeLayout = this.changeLayout.bind(this)
		this.handleQuantity = this.handleQuantity.bind(this)
		this.handleClear = this.handleClear.bind(this)
		this.copyItemizedList = this.copyItemizedList.bind(this)
		this.changeList = this.changeList.bind(this)
		this.changeBoard = this.changeBoard.bind(this)
	}

	render() {

		return (
			<div className='builder'>

				<section className='top-area'>
					<div className="add-search">
						<CustomSelect 
						options={this.props.legalCards} 
						callBack={this.handleQuantity} 
						placeholder="Enter Card Name"
						/>
						
						<button className="small-button" onClick={()=>this.props.openModal(
						<ImportCards legalCards={this.props.legalCards} 
						handleQuantity={this.handleQuantity}
						newMsg={this.props.newMsg}
						/>
						)}>Import Cards</button>
						<button className="small-button" onClick={()=>this.props.openModal(
						<FillManabase 
						{...this.props} 
						handleQuantity={this.handleQuantity}
						/>
						)}>Auto Choose Lands</button>
					</div>
					<div className="exportList">
						<button className="small-button" onClick={this.copyItemizedList}>Copy List</button>
						<button className="small-button warning-button" onClick={this.handleClear}>Clear List</button>
					</div>

				</section>
	   	
				<section className='boards-area'>
					<div className="list-head">
						<button 
							onClick={()=>this.changeLayout('view',this.state.layout.view==='list'?'grid':'list')}>
							{this.state.layout.view==='list'?'Grid':'List'}
						</button>
						<Select
							defaultVal={this.state.layout.sortBy}
			                options={FILTER_TERMS.map(s=>{return{label:s.name,value:s.prop}})} 
			                onChange={s=>this.changeLayout('sortBy',s.label)} 
			            />			
					</div>
					<div className="boards">
						{BOARDS.map(b=>this.listBoard(b))}	
					</div>
				</section>


			</div>
		)
	}

	listBoard(board) {
		return <ListBoard key={board}
		    {...this.state}
		    board={board}
	    	legalCards={this.props.legalCards}
	    	deckInfo={this.props.deckInfo}
			handleQuantity={this.handleQuantity}
			changeList={this.changeList}
			changeBoard={this.changeBoard}
			changeLayout={this.changeLayout}
			openModal={this.props.openModal}
	    />
	}


	changeLayout(prop,val) {
		console.log('changeLayout',prop,val)
		this.setState({
			layout: {...this.state.layout,
			[prop]:val
		}})
	}
				

	handleQuantity(card,add,board) {
		let list = [...this.props.deckInfo.list]
		if(!card) return null
		const existing = list.filter(c=>c.name===card.name)

		if((add && (1+existing.length)<=isLegal(card,this.props.deckInfo.format))
				|| !existing.length) {

			list = [...list,{
				...card,
				board: board || 'Main',
				key: "CardID__"+card.id+"__UUID4__"+uuidv4()
			}]
		} 
		else if (!add) {list = list.filter(c=>c.key!==card.key)} 

				
		this.props.changeDeck('list',list)
	}


	handleClear() {
		if (window.confirm('Delete all cards from this deck?')) {
			this.props.changeDeck('list',[])
			localStorage.clear()
		}
	}

	copyItemizedList() {
		const list = itemizeDeckList([...this.props.deckInfo.list])
		let textList = ''
		for (var i=0;i< list.length;i++) {textList+=list[i].numOfCopies+' '+list[i].name+'\n'}
		navigator.clipboard.writeText(textList)
		this.props.newMsg('Copied list to clipboard!','success')
	}

	changeList(card) {
	  const revised = this.props.deckInfo.list.map(c=>{
	    if(c.key===card.key){c=card}
	    return c
	  })
	  this.props.changeDeck('list',revised)
	}

	changeBoard(card) {
		let changed = this.props.deckInfo.list.filter(c=>c.key===card.key)[0]
		if (card.board&&card.board!==changed.board) {
			changed.board = card.board
			this.changeList(changed)
		}
	}


}


