import React from 'react'
import {connect} from 'react-redux'

function BGImg({playmat}) {return <div className="bg-img"><div className="playmat" style={{backgroundImage: "url('"+playmat+"')"}}/></div>}

export default connect(state=>{return{playmat:state.settings.playmat}})(BGImg)