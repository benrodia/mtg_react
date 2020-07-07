import React from 'react'

import * as f from '../functions/cardFormatting'

            
export default class Inspect extends React.Component {
	constructor(props) {
		super(props)
		this.state = {rulings: []}
		this.getRulings = this.getRulings.bind(this)
	}

	componentDidMount(){this.getRulings(this.props.card.rulings_uri)}
	getRulings(uri) {
	    return fetch(uri)
	      .then(response => {if (!response.ok) {throw new Error("HTTP status " + response.status)}return response.json()})
	      .then(data=>{
	      	console.log('rulings data',data.data)
	      	this.setState({rulings:data.data})
	      }).catch('loadFail')    
	}
	render() {

		console.log('modal target info',this.props.card)
		const uris = this.props.card.image_uris
		let imgSrc = null
		if (uris&&uris['png']) {imgSrc = uris['png']}
		else if (uris&&uris['large']) {imgSrc = uris['large']}

		return (
			<div className='inspectContainer'>
				<img src={imgSrc} alt="" />
				<div className="info">
					<h2>{this.props.card.name}</h2>
					{f.formatText(this.props.card.oracle_text)}
					<h3>Rulings</h3>
					<div className='rulings'>
					{this.state.rulings.map(r=>
						<div className="ruling">
							<h4>{r.published_at}</h4>
							<p>{r.comment}</p>
						</div>
					)}
					</div>
				</div>
			</div>
		)
	}

}

function modalZoneButtons(props) {
  if (props.info) {  
    let zones = ['Library','Hand','Battlefield','Graveyard','Exile']
    zones.splice(zones.indexOf(props.info.zone),1)
    return zones.map((btn,i) => 
    	<button 
      		key={zones[i]+'MoveToBtn'}
      		onClick={()=>{props.handleCloseModal(props.info,btn)}}
      	>{btn}</button>
    )
  }
}


