import React from 'react'
import {connect} from 'react-redux'

function BGImg({playmat}) {
	return <div className="bg-img">
		<div className="darken"/>
		<div className="playmat" style={{backgroundImage: "url('"+playmat+"')"}}/>	
	</div>
}

export default connect(({settings:{playmat}})=>{return{playmat}})(BGImg)