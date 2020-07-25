import {Q} from '../functions/cardFunctions'
import {matchStr} from '../functions/utility'
import {COUNTERS,NUMBER_WORDS} from './data_objects'
import {TOKEN_NAME,CARD_TYPES,COLORS} from './definitions'

export const MANA = {
	source: ['oracle_text',['{T}','add '],true],
	any: ['oracle_text',['mana','of','any'],true],
	twoC: ['oracle_text',['add','{C}{C}'],true],

}


export const DUAL_COMMANDER = ['name',[' and ','triad','sisters','brothers','ruric','stangg']]

export const TUTOR = types =>{
	const type = types&&Array.isArray(types)?types:types?[types]:['']
	return ['oracle_text',['search your library for',...type,'shuffle'],true]

} 

export const NUMBERS = [...Array(100)].map((_,i)=>i)

export const NUM_FROM_WORD = text => Math.max(0,
	NUMBER_WORDS.indexOf(NUMBER_WORDS.filter(N=>matchStr(text,[N]))[0]),
	NUMBERS.indexOf(NUMBERS.filter(N=>matchStr(text,[N]))[0]),
)


export const ETB = card => {
	if(card) {	
		const typeText = card.oracle_text.substring(card.oracle_text.indexOf('When')+4,card.oracle_text.indexOf('enters the battlefield'))
		const types = CARD_TYPES.filter(T=>matchStr(typeText,[T]))
		const effect = card.oracle_text.indexOf('enters the battlefield')<0?''
		:card.oracle_text.substring(card.oracle_text.indexOf('enters the battlefield')+22,card.oracle_text.indexOf('.'))
		return{
			types: types,
			effect: BASIC_ABILITIES(effect),
			self: Q(card,'oracle_text',['this card enters the battlefield',`${card.name} enters the battlefield`]),
			tapped: Q(card,'oracle_text',[card.name, 'enters the battlefield tapped'],true),
			counters:(!effect.includes('counter')||NUM_FROM_WORD(effect)<=0)?{}:{[COUNTERS.filter(C=>matchStr(effect,[C]))[0]||'PlusOne']:NUM_FROM_WORD(effect)},
			copier: Q(card,'oracle_text',['entering the battlefield causes a triggered ability of a permanent you control to trigger']),
			text: card.oracle_text
		}
	}
}


export const BASIC_ABILITIES = text => {
	return {		
		look: matchStr(text,['look at the top','scry','reveal the top'])?matchStr(text,[' top card '])?1:NUM_FROM_WORD(text):0,
		draw: text.includes('draw')?text.includes('draw a card')?1:NUM_FROM_WORD(text):0,
		mill: text.includes('mill')&&!text.includes('opponent')?text.includes('a card')?1:NUM_FROM_WORD(text):0,
		life: matchStr(text,['player','gains','life'],true)||matchStr(text,['you','gain','life'],true)?NUM_FROM_WORD(text):
			  matchStr(text,['you','lose','life'],true)?-1*NUM_FROM_WORD(text):0,
		eLife: matchStr(text,['opponent','gains','life'],true)?NUM_FROM_WORD(text):
			  matchStr(text,['opponent','loses','life'],true)||matchStr(text,['player','loses','life'],true)?-1*NUM_FROM_WORD(text):0,
		token: matchStr(text,['create','token'])?matchStr(text,[' a '])?1:NUM_FROM_WORD(text):0,
	}
}



export const REMOVAL = types => {
	const type = types&&Array.isArray(types)?types:types?[types]:['']
	return {
	destroy: ['oracle_text',['destroy target',...type],true],
	exile: ['oracle_text',['exile target',...type],true],
	bounce: ['oracle_text',['return target',...type,"to its owner's hand"],true],
	wipe: ['oracle_text',['destroy all',...type],true],
	counter: ['oracle_text',['counter target',...type,'spell'],true],
	}
}

export const RAMP_LAND = ['oracle_text',['search your library for','land','battlefield'],true]

export const NO_QUANT_LIMIT = card => Q(card,'name',COLORS('basic'))||Q(card,'oracle_text','A deck can have any number of cards named')

export const SAC_AS_COST = name => ['oracle_text',['sacrifice',name,':'],true]

export const IS_SPELL = card => card&&(card.zone==="Hand"||card.zone==="Command")&&!card.type_line.includes('Land')