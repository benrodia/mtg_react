import React from 'react'
import {Q} from '../functions/cardFunctions'
import {COLORS} from '../constants/definitions'
import {MANA} from '../constants/greps'

export default function ManaSource ({card,cardState,handleMana}) {

	const addMana = (type,amt) => {
		if (!card.tapped) {
			cardState(card,'tapped',true)
			handleMana(COLORS().map((C,i)=>type===i?amt:0))
		}
	}

	if (Q(card,...MANA.source)) {
		let types = COLORS('symbol').map(C=>card.oracle_text.includes("{"+C+"}")?C:false)
		if (Q(card,...MANA.any)) types = COLORS('symbol').map(C=>C!=='C'?C:false)
		if (types.filter(t=>!!t).length===1) types = []
		const amt = Q(card,...MANA.twoC)?2:1

		const manaTapDisplay =  types.map((C,i)=>!C?null
			: <div key={`tapfor${C}`} className={`tap-for`} onClick={_=>addMana(i,amt)}>
				{[...Array(amt)].map(_=><span key={amt} className={`ms ms-${C.toLowerCase()}`}/>)}
			  </div>
		)

		return !types.length ? null
		: <div className="mana-source">
			<span className={`ms ms-tap`}/>: Add {manaTapDisplay}
		  </div>
	} else return null

}