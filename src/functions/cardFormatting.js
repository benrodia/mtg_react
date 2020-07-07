import React from 'react'

export function formatManaSymbols(text) {
	if(!text) return

	const textAr = text.split('{')

	const formatted = textAr.map((m,i)=>{
		if (m.length) {
			const ms = m.substring(0,m.indexOf("}"))
			const cName = 'ms ms-cost ms-'+ ms
			.replace('}','')
			.replace('/','')
			.toLowerCase()
			.replace('t','tap')

			return (<>
				<span key={cName+i} className={cName}></span>
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
	// .map(l=>l[0]==="("?<i>{l}</i>:l)
	.map(l=><div>{l}</div>)
	


	return lines
}
