import * as A from '../constants/actionNames'
import {INIT_PLAYTEST_STATE} from '../constants/initialState'
import {MANA,ETB,IS_SPELL} from '../constants/greps'
import '../functions/utility'
import {Q, prepCardsForTest,normalizePos} from '../functions/cardFunctions'


export default function main(playtest = INIT_PLAYTEST_STATE([],null,0), action) {
	const {type,obj,key,val,bool,list,format,token,cards} = action
	switch (type) {
		case A.PLAYTEST: return {...playtest,[key]:bool?playtest[key]+val:val}
		case A.INIT_GAME: return {...INIT_PLAYTEST_STATE(list,format,playtest.num+1)}
		case A.UNTAP: return {...playtest,deck:playtest.deck.map(c=>{return{...c,tapped:false}})}
		case A.TOKEN: return {...playtest,deck:[...playtest.deck,...prepCardsForTest(token,null,true)]}
		case A.MANA: return {...playtest,mana:val?bool?val:playtest.mana.map((m,i)=>m+=val[i]):[0,0,0,0,0,0]}
		case A.CARD: return {...playtest,deck:playtest.deck.map(c=>cards.filter(cs=>cs.key===c.key).length?{...c,[key]:val}:c)}
		case A.BOARD:
			let {deck,look} = playtest
			const {card,dest,col,row,effects} = val
		    const toMove = card!==undefined?card:deck.filter(c=>c.zone==="Library")[0]

		    if(!toMove) return playtest
		    else {
			    const ind = deck.findIndex(c=>c.key===toMove.key)
			    const toDest = dest || "Hand"		    
			    deck[ind] = {...deck[ind],
			      col: col>=0?col:deck.filter(c=>c.zone===toDest&&c.row===row).length,
			      row: row>=0?row:0,
			      stack: deck.filter(c=>c.zone===toDest&&c.row===row&&c.col===col).length,
			      order: effects&&effects.bottom?0:deck.filter(c=>c.zone==="Library").length,
			      zone: toDest,
			      faceDown: toDest=="Library",
			    }
				if(look) {
					if (deck[ind].zone==='Library'&&(toDest!==deck[ind].zone||effects&&effects.bottom)) look--
					else if(deck[ind].zone!=='Library') look = 0      
				}

	    		return {...playtest,deck:normalizePos(deck),look:look}
		    }

		case A.NEW_TURN: 
			return {
				...playtest,
				turn: playtest.turn+1,
				mana: [0,0,0,0,0,0],
				deck: playtest.deck.map(c=>{
					if (c.zone==='Battlefield') {
						c.tapped = false
						c.sickness = false
					}
					return c
				})
			}

		case A.SHUFFLE: 
			let shuffled = bool ? playtest.deck.shuffle() : playtest.deck.filter(c=>c.zone==="Library").shuffle()
		    shuffled = shuffled.map((c,i)=>{c.order=i;return c}).concat(playtest.deck).unique('key')
			return {...playtest,deck: shuffled,look: 0}




		// NO OP
		default: return playtest
	}
}

