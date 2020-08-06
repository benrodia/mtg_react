import React,{useEffect} from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

//Components
import Loading from './Loading'
import Zone from './Zone'
import TestControls from './TestControls'
import TesterShortcuts from './TesterShortcuts'
import BasicSelect from './BasicSelect'
import CardControls from './CardControls'

import {TOKEN_NAME} from '../constants/definitions'



function Page_Tester(props) {
    const {list,tokens,look,startTest,spawnToken,handleShuffle,gameState} = props
    useEffect(_=>startTest(),[])

    const zone = (name,{context,header,cardHeadOnly}) => 
      <Zone zone={name} key={name} 
      context={context} 
      header={header} 
      cardHeadOnly={cardHeadOnly}
      />

    console.log('tokens',tokens)
    

    return <div className="tester">
      <div className="side-col">                
        {!list.filter(c=>c.board==='Command').length?null:
        zone("Command",{context: 'single'})}
        {zone("Exile",{
            context: 'list',
            cardHeadOnly: true,
            header: true,
          })}
        {zone("Graveyard",{
            context: 'list',
            cardHeadOnly: true,
            header: true
          })}
        <BasicSelect 
        searchable
        placeholder='Create Token'
        options={tokens} 
        labelBy={t=>TOKEN_NAME(t)} 
        valueBy={'id'} 
        callBack={spawnToken}
        />
        <div className="library-cont">
          {zone("Library",{context: 'single', header: true})}
          <div className="library-controls">
            <button className={'smaller-button'} onClick={_=>handleShuffle(false)}>Shuffle</button>
            <div className="lookBtn">
              <button className={'smaller-button warning-button'} onClick={_=>gameState('look',0)} style={{display:!look&&'none'}}>X</button>
              <button className={'smaller-button'} onClick={_=>gameState('look',1,true)}>Look Top {look}</button>
            </div>
          </div>
        </div>    
    </div>
      <TestControls/>
      <TesterShortcuts/>
      {zone("Battlefield", {context: 'grid'})}
      {zone("Hand", {context: 'list', faceDown: true})}
  </div>   
}



const select = state => {
  return {
    tokens: state.main.tokens,
    look: state.playtest.look,
    list: state.deck.list,
  }
}

export default connect(select,actions)(Page_Tester)