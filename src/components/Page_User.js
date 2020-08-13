import React from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import {FORMATS,CARD_TYPES,SINGLETON} from '../constants/definitions'
import {CARD_SLEEVES,PLAYMATS,EXAMPLE_DECK_NAMES,EXAMPLE_DECK_DESCS} from '../constants/data'

import {titleCaps,pluralize} from '../functions/text'
import {Q} from '../functions/cardFunctions'
import {chooseCommander,legalCommanders} from '../functions/gameLogic'

import BasicSelect from './BasicSelect'
import CardControls from './CardControls'
import ChooseTheme from './ChooseTheme'


const exName = 'ex. '+ (EXAMPLE_DECK_NAMES[Math.floor(Math.random()*EXAMPLE_DECK_NAMES.length)])
const exDesc = 'ex. \n'+ (EXAMPLE_DECK_DESCS[Math.floor(Math.random()*EXAMPLE_DECK_DESCS.length)])

function Page_User({
	userName,
	gameLog,
	scale,
	subtitle,
	stacktions,
	useStack,
	manaTolerance,
	gameActions,
	changeSettings,
}) {

	console.log('stacktions',stacktions,'useStack',useStack)

	const manaT = [
		"Do not show me mana",
		"Do not auto spend mana",
		"Use for cost with floating mana",
		"Try to pay costs with extra mana sources",
		// "Don't allow illegal spellcasting",
	]



	const userEntry	= (
		<div className="user-settings">
			<div className="name">
				<h3 className='field-label'>Display Name</h3>
				<input type='text' maxLength={15}
				className='name-entry'  
				value={userName} 
				placeholder={"my_username"} 
				onChange={e=>changeSettings('userName',e.target.value)}
				/>
			</div>		
		</div>
	)

	const textSize = (
		<div className="setting-check-box">
			<p>Text Size</p>
			<button className={`smaller-button ${scale===80&&'selected'}`} onClick={_=>changeSettings('scale',80)}>
			Small
			</button>
			<button className={`smaller-button ${scale===100&&'selected'}`} onClick={_=>changeSettings('scale',100)}>
			Normal
			</button>
			<button className={`smaller-button ${scale===120&&'selected'}`} onClick={_=>changeSettings('scale',120)}>
			Large
			</button>
		</div>
	)

	const showSub = (
		<div className="setting-check-box">
			<button className={`smaller-button ${subtitle&&'selected'}`} onClick={_=>changeSettings('subtitle',!subtitle)}>
			Deck Subtitle
			</button>
		</div>
	)





	return <section className='info settings'>
			<div className="display-settings">
				{userEntry}
				<h3 className="field-label">UI Settings</h3>
				{textSize}
				{showSub}
			</div>

			<div className="game-settings">
				<h3 className="field-label">Playtester Settings</h3>
				<button className={`smaller-button ${gameLog&&'selected'}`} onClick={_=>changeSettings('gameLog',!gameLog)}>
					Gamelog
				</button>
				<p>Use Stack For</p>
				{stacktions.map((st,i)=> <button key={st}
					className={`smaller-button ${useStack.includes(st)&&'selected'}`} 
					onClick={_=>
						changeSettings('useStack',useStack.includes(st)
							? useStack.filter(s=>s!==st)
							: [...useStack,st]
						)
					}>{pluralize(st)}</button>
				)}
				<p>Auto Spend Mana</p>
				{manaT.map((msg,i)=><button key={manaT[i]}
				className={`smaller-button ${manaTolerance==i&&'selected'}`} 
				onClick={_=>changeSettings('manaTolerance',i)}>{msg}</button>)}					
			</div>


			<div className="themes">
				<ChooseTheme type='sleeve'/>
				<ChooseTheme type='playmat'/>
			</div>

			<div className="reset">
				<button className="small-button warning-button" onClick={_=>changeSettings('clear')}>Reset to Default</button>
			</div>

		</section>
}



export default connect(state=>state.settings,actions)(Page_User)