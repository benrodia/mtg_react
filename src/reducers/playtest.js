import * as A from '../constants/actionNames'
import {INIT_PLAYTEST_STATE} from '../constants/initialState'
import {COLORS} from '../constants/definitions'
import {MANA,ETB,IS_SPELL} from '../constants/greps'
import '../functions/utility'
import {Q, prepCardsForTest,normalizePos} from '../functions/cardFunctions'


export default function main(playtest = INIT_PLAYTEST_STATE([],null,0), action) {
	const {type,item,key,val,bool,list,format,token,cards,effect,effectType,text,res,src} = action
	switch (type) {
		case A.PLAYTEST: return {...playtest,[key]:bool?playtest[key]+val:val}
		case A.INIT_GAME: return {...INIT_PLAYTEST_STATE(list,format,playtest.num+1)}
		case A.ADD_STACK: return {...playtest,stack:[...playtest.stack,{key:playtest.stack.length,effect,effectType,text,res,src}]}
		case A.RES_STACK: return {...playtest,stack:[...playtest.stack.splice(0,Math.max(0,playtest.stack.length-1))]}
		// case A.UNTAP: return {...playtest,deck:playtest.deck.map(c=>{return{...c,tapped:false}})}
		case A.TOKEN: return {...playtest,deck:[...playtest.deck,...prepCardsForTest(token,null,true)]}
		case A.MANA: 
			console.log('A.MANA',val,bool)
			return {...playtest,mana:val?bool?[...val]:playtest.mana.map((m,i)=>m+val[i]):COLORS().map(_=>0)}
		case A.CARD: 
    	console.log('A.CARD',cards,key,val)
		return {...playtest,deck:playtest.deck.map(c=>!cards||cards.filter(cs=>cs.key===c.key).length?{...c,[key]:val}:c)}
		case A.BOARD:
			let {deck,look} = playtest
			const {card,dest,col,row,effects} = val
		    const toMove = card!==undefined?card:deck.filter(c=>c.zone==="Library")[0]
		    if(!toMove) return playtest
		    else {
			    const ind = deck.findIndex(c=>c.key===toMove.key)
			    const toDest = dest || "Hand"		    
				if (look&&toMove.zone==='Library'&&(toDest!==toMove.zone||effects&&effects.bottom)) look=look-1
				else if(toMove.zone!=='Library') look = 0  
				const newDeck = normalizePos(Object.assign([], deck, {[ind]: {...deck[ind],
					col: col>=0?col:deck.filter(c=>c.zone===toDest&&c.row===row).length,
					row: row||0,
					stack: deck.filter(c=>c.zone===toDest&&c.row===row&&c.col===col).length,
					order: effects&&effects.bottom?0:deck.filter(c=>c.zone==="Library").length,
					zone: toDest,
					// faceDown: toDest=="Library",
				}}))
	    		return {...playtest,deck:newDeck,look}
		    }

		case A.NEW_TURN: 
			return {
				...playtest,
				turn: playtest.turn+1,
				mana: COLORS().map(_=>0),
				deck: playtest.deck.map(c=>c.zone!=='Battlefield'?c
					:{...c,tapped:false,sickness:false})
			}

		case A.SHUFFLE: 
			const shuffled = playtest.deck.filter(c=>c.zone==="Library").shuffle()
		    const afterShuffle = shuffled.map((c,i)=>{c.order=i;return c}).concat(playtest.deck).unique('key')
			return {...playtest,deck:afterShuffle,look: 0}

		case A.HISTORY:
			return {...playtest,
				history: [...playtest.history,{
					index:playtest.history.length,
					...item,
				}]

			}
		case A.UNDO: 
			const old = playtest.history[playtest.history.length-1]
			return {...playtest,
				[old.key]:old.val,
				future:[{key:old.key, val:playtest[old.key]}, ...playtest.future],
				history:playtest.history.splice(0,playtest.history.length-2)
			}
		// case A.REDO: 
		// 	return {...playtest,
		// 		[item.key]:item.val,
		// 		future:[{key:playtest[item.key],val:playtest[item.val]},...playtest.future],
		// 		history:playtest.history.splice(0,playtest.history.length-2)
		// 	}



		// NO OP
		default: return playtest
	}
}

