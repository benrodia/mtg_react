import React from 'react'

import {FORMATS,CARD_TYPES,SINGLETON} from '../constants/definitions'
import {EXAMPLE_DECK_NAMES,EXAMPLE_DECK_DESCS} from '../constants/data_objects'

import titleCaps from '../functions/titleCaps'
import {Q} from '../functions/cardFunctions'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'

import BasicSelect from './BasicSelect'
import CardSelect from './CardSelect'
import CardControls from './CardControls'
import ChooseTheme from './ChooseTheme'


const exName = 'ex. '+ (EXAMPLE_DECK_NAMES[Math.floor(Math.random()*EXAMPLE_DECK_NAMES.length)])
const exDesc = 'ex. \n'+ (EXAMPLE_DECK_DESCS[Math.floor(Math.random()*EXAMPLE_DECK_DESCS.length)])

export default function DeckInfo(props) {
	const {deckInfo,legalCards,changeState,openModal} = props
	const {name,desc,format,list} = deckInfo

	return <div className='info-bar'>
		<div className="name">
			<h3 className='field-label'>Name</h3>
			<input className='nameEntry' type='text' maxLength={15} value={name} placeholder={exName} onChange={(e)=>changeState('deckInfo','name',e.target.value)}/>
		</div>		
		<div className="format">
			<h3 className='field-label'>Format</h3>
			<BasicSelect 
				self={format}
				options={FORMATS} 
                callBack={e=>changeState('deckInfo','format',e)} 
            />
		</div>
		<div className="desc">
			<h3 className='field-label'>Description</h3>
			<textarea className='desc-entry' rows='5' type='text' value={desc} placeholder={exDesc} onChange={(e)=>changeState('deckInfo','desc',e.target.value)}/>
		</div>	
	</div>
}

		// <div className="tags">
		// 	<h3 className='field-label'>Tags</h3>
		// 	"COMING SOON"
		// </div>		