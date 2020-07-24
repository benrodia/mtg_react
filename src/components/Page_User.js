import React from 'react'

import {FORMATS,CARD_TYPES,SINGLETON} from '../constants/definitions'
import {CARD_SLEEVES,PLAYMATS,EXAMPLE_DECK_NAMES,EXAMPLE_DECK_DESCS} from '../constants/data_objects'

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
	const {deckInfo,legalCards,openModal,settings,changeState} = props
	const {name,desc,format,list} = deckInfo

	const tolerances = [
		"Don't even show me mana",
		"Do not auto spend",
		"Use floating mana only",
		"Tap extra lands if needed",
		// "Don't allow illegal spellcasting",//not ready yet
	]

	return (
		<section className='info settings'>
			<div className="user-settings">
				<div className="name">
					<h3 className='field-label'>Display Name</h3>
					<input type='text' maxLength={15}
					className='name-entry'  
					value={settings.userName} 
					placeholder={"my_username"} 
					onChange={e=>changeState('settings','userName',e.target.value)}
					/>
				</div>		
			</div>
			<div className="display-settings">
				<h3 className="field-label">UI Settings</h3>
				
				<div className="setting-check-box">
					<p>Text Size</p>

					<button className={`smaller-button ${settings.scale===80&&'selected'}`} onClick={_=>changeState('settings','scale',80)}>
					Small
					</button>
					<button className={`smaller-button ${settings.scale===100&&'selected'}`} onClick={_=>changeState('settings','scale',100)}>
					Normal
					</button>
					<button className={`smaller-button ${settings.scale===120&&'selected'}`} onClick={_=>changeState('settings','scale',120)}>
					Large
					</button>
				</div>

				<div className="setting-check-box">
					<p>Deck Subtitle</p>
					<button className={`smaller-button ${settings.subtitle&&'selected'}`} onClick={_=>changeState('settings','subtitle',!settings.subtitle)}>
					{settings.subtitle?"ON":"OFF"}
					</button>
				</div>

			</div>

			<div className="game-settings">
				<h3 className="field-label">Playtester Settings</h3>
				<div className="setting-check-box">
					<p>Show Gamelog</p>
					<button className={`smaller-button ${settings.gameLog&&'selected'}`} onClick={_=>changeState('settings','gameLog',!settings.gameLog)}>
					{settings.gameLog?"ON":"OFF"}
					</button>
				</div>
				
				<div className="setting-check-box">
					<p>Auto Spend Mana</p>
					{tolerances.map((msg,i)=><button key={tolerances[i]}
					className={`smaller-button ${settings.manaTolerance==i&&'selected'}`} 
					onClick={_=>changeState('settings','manaTolerance',i)}>{msg}</button>)}					
				</div>

			</div>


			<div className="themes">
				<ChooseTheme type='sleeve' {...props}/>
				<ChooseTheme type='playmat' {...props}/>
			</div>

			<div className="reset">
				<button className="small-button warning-button" onClick={_=>changeState('settings','clear')}>Reset to Default</button>
			</div>

		</section>
	)

}
