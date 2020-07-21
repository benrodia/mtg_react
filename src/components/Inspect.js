import React,{useState,useEffect} from 'react'

import {formatText,formatManaSymbols} from '../functions/formattingLogic'

            
export default function Inspect (props) {
	const {name,oracle_text,mana_cost,rulings_uri,image_uris,showRulings,showShopping} = props.card
	const [rulings,getRulings] = useState([])
	useEffect(() => {
		if (!rulings.length) fetch(rulings_uri)
	      .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
	      .then(data=>getRulings(data.data))
	}) 
	
	return (
		<div className='inspect-container'>
			<img src={image_uris['png'||'large']} alt={name} />
			<div className="inspect-info">
				<div className="oracle-text">
					<h2>{name}<span>{formatManaSymbols(mana_cost)}</span> </h2>
					{formatText(oracle_text)}
				</div>

				<h3 className='field-label'>Rulings</h3>
				<div className='rulings'>
					{rulings.map(r=>
						<div className="ruling">
						<h4>{r.published_at}</h4>
						<p>{r.comment}</p>
					</div>)}
				</div>
			</div>
		</div>
	)
}

