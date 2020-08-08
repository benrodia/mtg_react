import React from 'react'
import {CARD_TYPES,COLORS,ZONES,SINGLETON,TOKEN_NAME} from '../constants/definitions'
import {SPECIAL_SYMBOLS,NUMBER_WORDS} from '../constants/data_objects'


export const formatManaSymbols = text => {
	if(text && typeof text === 'string') {		
		const textAr = text.split('{')
		return textAr.map((m,i)=>{
			if (m.length) {
				let ms = m.substring(0,m.indexOf("}"))
					.replace('}','')
					.replace('/','')
					.toLowerCase()
					.replace('t','tap')

				const cName = 
				SPECIAL_SYMBOLS.includes(ms)?
				'ms ms-cost ms-'+ms
				:''

				return <span key={ms+i}>
					<span key={cName+i} className={cName}/>
					<span>{m.substring(m.indexOf("}")+1,m.length)}</span>
				</span>
			}
			return null
		})
	} return null
}


export const BGcolor = (colors,identity,type) => {
	let colorVal
	let colorVals = [
		{symbol: 'W',val: '#F0F0E6'},
		{symbol: 'U',val: '#64B8DD'},
		{symbol: 'B',val: '#544656'},
		{symbol: 'R',val: '#D8795B'},
		{symbol: 'G',val: '#6Ca572'},
	]

	if (!colors || !colors.length) {
		if (type.includes('Artifact')) {
			return '#999'
		} else if (type.includes('Land') && !type.includes('Basic')) {
			return '#876'
		}
	} else if (colors.length === 1 || identity.length === 1) {
		for (var i = 0; i < colorVals.length; i++) {
			if(colorVals[i].symbol == colors[0] ||
			   colorVals[i].symbol == identity[0]) {
				colorVal = colorVals[i].val
			} 
		}
	} else if(colors.length > 1) {
		colorVal = '#C1AD70'
	}
	return colorVal
}

export const formatText = text => {
	return text.split('\n')
	.map(l=>formatManaSymbols(l))
	.map((l,i)=><p key={l+i}>{l}</p>)
}


export const subTitle = deckInfo => {
  const subTitle = deckInfo.list.filter(c=>c.board==='Command').length
  ?": "+ deckInfo.list.filter(c=>c.board==='Command')
    .map(c=>c.name.indexOf(',')!== -1 ? c.name.substr(0,c.name.indexOf(',')):c.name)
    .join(' / ')
  :null

  const colorBy = SINGLETON(deckInfo.format)?'color_identity':'colors'

  return <span className="subtitle">
    {" ("}
    {titleCaps(deckInfo.format)}
    {subTitle} {deckInfo[colorBy].map(c=><span key={'subtitle'+c} className={`ms ms-${c.toLowerCase()}`}/>)}
    )
  </span>
}

export function cardMoveMsg(card,dest) {
    const {zone,name,type_line} = card
    return (
        dest==="Exile" ? `Exiled "${name}" from ${zone}` :
        dest==="Hand"&&zone!=="Library" ? `Returned "${name}" from ${zone} to hand` :
        dest!=="Library"&&(zone==="Hand"||zone==="Command")&&!type_line.includes('Land') ? `Cast "${name}"` :
        dest==="Hand"&&zone==="Library" ? `Drew "${name}"` :
        dest==="Battlefield"&&(zone==="Graveyard"||zone==="Exile") ? `Returned "${name}" from ${zone} to Battlefield` :
        dest==="Battlefield" ? `Played "${name}"` :
        dest==="Graveyard"&&zone==="Library" ? `Milled "${name}"` :
        dest==="Graveyard"&&zone==="Battlefield" ? `Sacrificed "${name}"` :
        `Put "${name}" into ${dest} from ${zone}`
    )
}

export const effectText = (effects,token) => {
	let text = ''
	for (var i = 0; i < effects.length; i++) {
		const [key,val] = effects[i]
	  	if (val>0) {
			const valText = val===1?'a':NUMBER_WORDS[val]
			const addText = (t,plu) => `${text}${text?' and ':''} ${t}${plu&&val!==1?'s':''}`

		    if (key==='life') text = val>0?addText(`gain ${valText} life`):addText(`lose ${valText} life`)
		    if (key==='look') text = addText(`reveal top ${val===1?'':valText} card`,true)
		    if (key==='draw') text = addText(`draw ${valText} card`,true)
		    if (key==='mill') text = addText(`mill ${valText} card`,true)
		    if (key==='token'&&token) text = addText(`create ${valText} ${TOKEN_NAME(token)}`,true)     
	    }
	}
	return text||null
}



/*
 * Title Caps
 * 
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */

	var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
	var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
  
	export function titleCaps(title){
		var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;
		
		while (true) {
			var m = split.exec(title);

			parts.push( title.substring(index, m ? m.index : title.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
					return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
				})
				.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
				.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
					return punct + upper(word);
				})
				.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));
			
			index = split.lastIndex;
			
			if ( m ) parts.push( m[0] );
			else break;
		}
		
		return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});
	};
    
	function lower(word){
		return word.toLowerCase();
	}
    
	function upper(word){
	  return word.substr(0,1).toUpperCase() + word.substr(1);
	}

