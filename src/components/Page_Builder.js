import React from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import DeckInfo from './DeckInfo'
import CardSelect from './CardSelect'
import BasicSelect from './BasicSelect'
import ImportCards from './ImportCards'
import ListBoard from './ListBoard'
import AddSearch from './AddSearch'
import ItemInput from './ItemInput'

import DownloadTxt from './DownloadTxt'
import FillManabase from './FillManabase'
import CardControls from './CardControls'

import {DECK,FILTERS} from '../constants/actionNames'
import {COLORS,SINGLETON} from '../constants/definitions'
import {ALL_CARDS,FILTER_TERMS, BOARDS} from '../constants/data_objects'
import {itemizeDeckList} from '../functions/cardFunctions'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'


function Page_Builder (props) {
	const {view,sortBy,format,list,legalCards,openModal,cacheState,newMsg,customFields} = props
				
	const copyItemizedList = () => {
		const textList = itemizeDeckList(list,['name'])
			.map(cards=>cards.length+" "+cards[0].name)
			.join('\n')
		navigator.clipboard.writeText(textList)
		newMsg('Copied list to clipboard!','success')
	}


	const changeField = (card,field,val) => {
	    console.log('changeField',card,field,val)
	  	cacheState('deck','list',field==='board'&&val==="Command"
		    ? chooseCommander(card,list,legalCards)
		    : list.map(c=>{if(c.key===card.key){c[field]=val};return c})
	    )
	}


	const layoutHeader = <span className='view-options'>			
			<button 
			className={`icon-list-bullet small-button ${view==='list'&&'selected'}`} 
			onClick={_=>cacheState('filters','view','list')}/>
			<button 
			className={`icon-th-large small-button ${view==='grid'&&'selected'}`} 
			onClick={_=>cacheState('filters','view','grid')}/>
			<BasicSelect 
				self={FILTER_TERMS.filter(f=>f.name===sortBy)[0]}
				defImg={<span className="icon-sort-alt-down"/>}
				options={FILTER_TERMS} labelBy={'name'}
                callBack={s=>cacheState('filters','sortBy',s.name)} 
            />
			{sortBy!=='Custom'?null: <ItemInput addable value={{name:'New Field',key:'custom'+customFields.length}} list={customFields} callBack={n=>cacheState('filters','customFields',n)}/>}
	</span>
	const commandHeader = <div className="choose-commander">
		<BasicSelect searchable limit={20}
		options={legalCommanders(format,legalCards)} 
		labelBy={'name'} valueBy={'id'}
		callBack={card=>cacheState('deck','list',chooseCommander(card,list,legalCards,true))} 
		placeholder="Choose a Commander"
		/>
	</div>


	const listBoard = (board,header) => <ListBoard 
			key={board} 
			board={board} 
			header={header}
			changeField={changeField}
	    />
	

	return <div className='builder'>
		<section className='top-bar'>
			<DeckInfo/>
			<AddSearch/>
			<div className="quick-import">
				<button onClick={_=>openModal(<ImportCards/>)}>
				Quick Import	
				</button>
			</div>
		</section>
		
		<div className="boards">
			{listBoard('Main',layoutHeader)}
			<div className="other-boards">
				{SINGLETON(format)?listBoard('Command',commandHeader):null}	
				{listBoard('Side')}	
				{listBoard('Maybe')}	
			</div>
		</div>

		<div className="export">
			<DownloadTxt/>
			<button className="icon-clipboard small-button" onClick={copyItemizedList}>
			Copy List
			</button>
			<button className="small-button warning-button" onClick={_=>cacheState('deck','clear')}>Clear List</button>
		</div>
	</div>
}

const select = state => {
	return {
		view: state.filters.view,
		sortBy: state.filters.sortBy,
		customFields: state.filters.customFields,
		list: state.deck.list,
		format: state.deck.format,
		legalCards: state.main.legalCards,
	}
}

export default connect(select,actions)(Page_Builder)