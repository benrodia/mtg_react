import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import { PieChart } from 'react-minimal-pie-chart'

import utilities from '../utilities'
import Settings from './Settings'

const {HOME_DIR,subTitle,COLORS,sum} = utilities

export default connect(({deck,settings:{showSubTitle}})=>{return {deck,showSubTitle}},actions)
(({deck,showSubTitle,userName,openModal})=> {
  const path = useLocation().pathname
  const colorData = COLORS().map(color=>{
    const value = sum(deck.list.map(c=>c.mana_cost.split('').filter(i=>i===color.symbol).length))
    return {label:color.name,value,color: color.fill}
  })


	return <nav className="main-header">
      <div className="title">
        <Link to={HOME_DIR}>ReactMTG</Link>
            <p className="sub-title">
              
             | {deck.name||"New Deck"} 
            {!showSubTitle?null:subTitle(deck)}
            <span className="icon"> 
              <PieChart data={colorData} startAngle={270}/>
            </span>
            </p>
      </div>

      <div className="nav">
        <Link to={`${HOME_DIR}/build`} className={`navItem ${path===`${HOME_DIR}/build`&&'active'}`}>Build</Link>
        <Link to={`${HOME_DIR}/test`} className={`navItem ${path===`${HOME_DIR}/test`&&'active'}`}>Test</Link>
        <span className="icon-cog cog" onClick={_=>openModal(<Settings/>)}></span>
      </div>
    </nav>
})