import React from 'react'
import {CARD_TYPES,COLORS,ZONES,SINGLETON} from '../constants/definitions'
import {SPECIAL_SYMBOLS} from '../constants/data_objects'
import titleCaps from '../functions/titleCaps'


export function formatManaSymbols(text) {
	if(!text) return null

	const textAr = text.split('{')

	const formatted = textAr.map((m,i)=>{
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

			console.log(cName,ms)

			return (<>
				<span key={cName+i} className={cName}/>
				<span>{m.substring(m.indexOf("}")+1,m.length)}</span>
			</>)
		}
		else return null
	})

	return formatted
}


export function BGcolor(colors,identity,type) {
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

export function formatText(text) {
	let lines = text.split('\n')
	.map(l=>formatManaSymbols(l))
	.map(l=><p>{l}</p>)
	


	return lines
}

export function subTitle(deckInfo) {
  const subTitle = deckInfo.list.filter(c=>c.board==='Command').length
  ?": "+ deckInfo.list.filter(c=>c.board==='Command')
    .map(c=>c.name.indexOf(',')!== -1 ? c.name.substr(0,c.name.indexOf(',')):c.name)
    .join(' / ')
  :null

  const colorBy = SINGLETON(deckInfo.format)?'color_identity':'colors'

  return <span className="subtitle">
    {" ("}
    {titleCaps(deckInfo.format)}
    {subTitle} {deckInfo[colorBy].map(c=><span className={`ms ms-${c.toLowerCase()}`}/>)}
    )
  </span>
}