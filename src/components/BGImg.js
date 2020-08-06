import React from 'react'
import {connect} from 'react-redux'


function BGImg(props) {
	const {playmat} = props
	return (
		<div className="bg-img">
			<div className="playmat" style={{backgroundImage: "url('"+playmat+"')"}}/>
		</div>
	) 
}

const select = state => {
	return {
		playmat: state.settings.playmat
	}
}

export default connect(select)(BGImg)