import React,{useEffect} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'

import CardControls from './CardControls'
import BasicSearch from './BasicSearch'
import AdvancedSearch from './AdvancedSearch'
import DeckInfo from './DeckInfo'
import DeckStats from './DeckStats'
import BoardFilters from './BoardFilters'
import ImportCards from './ImportCards'
import Board from './Board'
import DownloadFile from './DownloadFile'

const {
	FORMATS,
	ItemTypes,
	SINGLETON,
	legalCommanders,
	chooseCommander,
	titleCaps,
	textList,
} = utilities

export default connect(({main:{legalCards},deck:{name,list,format}})=>{return {legalCards,name,list,format}},actions)
(({name,format,list,board,legalCards,openModal,changeDeck,newMsg,setPage,addCard})=> {	
	useEffect(_=>{setPage('Build')},[])

	return <div className='builder'>
		<section className='side-bar'>
			<button onClick={_=>openModal(<DeckInfo/>)} className="edit-deckinfo icon-pencil">{name||'New Deck'}</button>
			<div className="format">
				<h3 className='field-label'>Format</h3>
				<BasicSearch 
					self={format}
					options={FORMATS} 
	                callBack={e=>changeDeck('format',e)} 
	            />
				{!SINGLETON(format)?null:
				<>
					<BasicSearch
					searchable
					limit={20}
					options={legalCommanders(format,legalCards)}
					placeholder='Choose Commander'
					callBack={c=>changeDeck('list',chooseCommander(c,list,legalCards))}
					/>
					<div className="commanders">
						{list.filter(c=>c.commander).map(c=><CardControls type={ItemTypes.COMMANDER} card={c}/>)}
					</div>
				</>
				}
			</div>


			<div className="quick-import">
				<button className='small-button icon-upload' onClick={_=>openModal(<ImportCards/>)}>
				Quick Import	
				</button>
				<button className='small-button icon-download' onClick={_=>openModal(<DownloadFile/>)}>
				Download File	
				</button>
				<button className="small-button success-button icon-paste" onClick={_=>{
					navigator.clipboard.writeText(textList(list))
					newMsg('Copied list to clipboard!','success')
				}}>
				Copy List
				</button>
				<button className="small-button warning-button icon-trash" onClick={_=>changeDeck('clear')}>Clear List</button>
			</div>
			<DeckStats/>
		</section>
		<section className="deck-area">
			<div className="add-search">
				<div className="search-bar">
					<h4>Search Cards</h4>
					<BasicSearch 
					searchable
					unique
					orderBy={"name"}
					limit={20}
					label={c=>c.name}
					options={legalCards} 
					callBack={c=>addCard(c,board)} 
					placeholder={"Search For Cards"}
					/>
				</div>
				<button onClick={_=>openModal(<AdvancedSearch/>)}>Advanced Search</button>
			</div>
			<BoardFilters/>
			<Board/>
		</section>		
	</div>
})