
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

export const ETB = name => {return{
		when: ['oracle_text',['when this card enters the battlefield',`when ${name} enter the battlefield`]],
		as: ['oracle_text',['as this card enters the battlefield',`as ${name} enter the battlefield`,`${name} enters the battlefield as`]],
		tapped: ['oracle_text',[name, 'enters the battlefield tapped'],true],
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


export const DRAW = ['oracle_text',['draw','card'],true]

export const SAC_AS_COST = name => ['oracle_text',['sacrifice',name,':'],true]
