import React from 'react'
import matchSorter from 'match-sorter';

import titleCaps from '../functions/titleCaps.js'

export default class ImportCards extends React.Component {
	constructor(props) {
		super(props)

		this.state = {form: '',exText: null}

		this.updateForm = this.updateForm.bind(this)
		this.handleImport = this.handleImport.bind(this)
	}

	updateForm(e) {this.setState({form:e.target?e.target.value:e})}

	render() {
		if (!this.state.exText && this.props.legalCards.length) {
			const cardNames = this.props.legalCards.map(c=>c.name)
			const exText = ['ex.','','','','',''].map(ex=>{
				if (ex!=='ex.') {
					const rng = Math.floor(Math.random()*cardNames.length)
					const exQuant = Math.floor(Math.random()*3+1)
					return exQuant+' '+cardNames[rng]
				}
				return ex
			}).join('\n')
			this.setState({exText: exText})
		}

		
		return (
			<form action="" className="importList" onSubmit={this.handleImport}>
				<textarea 
					className='importTextArea' 
					rows='5' 
					columns='15' 
					value={this.state.form} 
					onChange={this.updateForm}
					placeholder={this.state.exText}
				></textarea>
				<input type="submit" value="Import Cards"/>
			</form>

		)
	}

	handleImport(e) {
		e.preventDefault(e)
		// this.props.newMsg('importing...','info')
		let notImported = ''
		let interp = this.interpretForm(this.state.form)

		const addCards = setInterval(()=>{
			for (var i = 0; i < interp.length; i++) {
				if (interp[i].card&&interp[i].quant) {
					this.props.handleQuantity(interp[i].card,true)
					interp[i].quant--
				} 
				else {
					notImported += interp[i].input + '\n'	
					interp.splice(i,1)
				}
			}
			
			if (!interp.length) {clearInterval(addCards)}
		},100)

		this.updateForm(notImported)
	}

	// handleImport(e) {
	// 	e.preventDefault(e)
	// 	// this.props.newMsg('importing...','info')
	// 	let notImported = ''
	// 	const interp = this.interpretForm(this.state.form)

	// 	const addCards = setInterval(()=>{
	// 		if (interp[0].card) this.props.handleQuantity(interp[0].card,interp[0].quant)
	// 		else notImported += interp[0].input + '\n'	
	// 		interp.shift()
	// 		if (!interp.length) {clearInterval(addCards)}
	// 	},100)

	// 	this.updateForm(notImported)
	// }

	interpretForm(content) {
		return content.split('\n').map(item=> {
			let quant = parseInt(item.substr(0,item.indexOf(' ')))
			const name = !isNaN(quant)?item.substr(item.indexOf(' ')).trim():item.trim()

			return {
				quant: !isNaN(quant)?quant:1,
				card: this.props.legalCards.filter(c=>c.name.toLowerCase()===name.toLowerCase())[0],
				input: item,
			}
		})
	}
}

