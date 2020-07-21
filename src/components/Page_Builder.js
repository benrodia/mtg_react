import React,{useState} from 'react'

import DeckInfo from './DeckInfo'
import CardSelect from './CardSelect'
import BasicSelect from './BasicSelect'
import ImportCards from './ImportCards'
import ListBoard from './ListBoard'
import AddSearch from './AddSearch'

import DownloadTxt from './DownloadTxt'
import FillManabase from './FillManabase'
import CardControls from './CardControls'

import {COLORS,SINGLETON} from '../constants/definitions'
import {ALL_CARDS,FILTER_TERMS, BOARDS} from '../constants/data_objects'
import {itemizeDeckList} from '../functions/cardFunctions'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'


export default function Page_Builder (props) {
	const {settings,deckInfo,legalCards,addCard,openModal,changeState,newMsg} = props
	const [layout,changeLayout] = useState({view: 'list',sortBy: 'Type'})
				
	const copyItemizedList = () => {
		const textList = itemizeDeckList(deckInfo.list,['name'])
			.map(cards=>cards.length+" "+cards[0].name+" ("+cards[0].set+")")
			.join('\n')
		navigator.clipboard.writeText(textList)
		newMsg('Copied list to clipboard!','success')
	}


	const changeBoard = dumbCard => {
		let card = deckInfo.list.filter(c=>c.key===dumbCard.key)[0]
	    console.log('changeBoard',card)
	  	changeState('deckInfo','list',dumbCard.board==="Command"
		    ? chooseCommander(card,deckInfo.list,legalCards)
		    : deckInfo.list.map(c=>{if(c.key===card.key){c.board=dumbCard.board};return c})
	    )
	}


	const layoutHeader = <span className='view-options'>
			<button 
			className={`icon-list-bullet small-button ${layout.view==='list'&&'selected'}`} 
			onClick={()=>changeLayout({...layout,view:'list'})}/>
			<button 
			className={`icon-th-large small-button ${layout.view==='grid'&&'selected'}`} 
			onClick={()=>changeLayout({...layout,view:'grid'})}/>
			<BasicSelect 
				self={FILTER_TERMS.filter(f=>f.name===layout.sortBy)[0]}
				defImg={<span className="icon-sort-alt-down"/>}
				options={FILTER_TERMS} labelBy={'name'}
                callBack={s=>changeLayout({...layout,sortBy:s.name})} 
            />
	</span>
	const commandHeader = <div className="choose-commander">
		<BasicSelect searchable limit={20}
		options={legalCommanders(deckInfo.format,legalCards)} 
		labelBy={'name'} valueBy={'id'}
		callBack={card=>changeState('deckInfo','list',chooseCommander(card,deckInfo.list,legalCards,true))} 
		placeholder="Choose a Commander"
		/>
	</div>


	const listBoard = (board,header) => {
		return <ListBoard key={board} board={board} 
			layout={layout} {...props}
			header={header}
	    	legalCards={legalCards}
	    	deckInfo={deckInfo}
			addCard={addCard}
			changeBoard={changeBoard}
			changeLayout={changeLayout}
			openModal={openModal}
	    />
	}

	return <div className='builder'>
		<section className='top-bar'>
			<DeckInfo {...props}/>
			<AddSearch {...props}/>
			<div className="quick-import">
				<button onClick={()=>openModal(
				<ImportCards {...props}
				legalCards={legalCards} 
				addCard={addCard}
				openModal={openModal}
				newMsg={newMsg}
				/>
				)}>
				Quick Import	
				</button>
			</div>
		</section>
		
		<div className="boards">
			{listBoard('Main',layoutHeader)}
			<div className="other-boards">
				{SINGLETON(deckInfo.format)?listBoard('Command',commandHeader):null}	
				{listBoard('Side')}	
				{listBoard('Maybe')}	
			</div>
		</div>

		<div className="export">
			<button className="icon-clipboard small-button" onClick={copyItemizedList}>
			Copy List
			</button>
			<DownloadTxt settings={settings} deck={deckInfo}/>
			<button className="small-button warning-button" onClick={_=>changeState('deckInfo','clear')}>Clear List</button>
		</div>
	</div>
}





