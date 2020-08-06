import React,{useState,useEffect,useRef} from 'react'

import {connect} from 'react-redux'
import * as actions from '../actionCreators'

import {CARD_SIZE} from '../constants/definitions'
import {ItemTypes} from '../constants/data_objects'
import {Q} from '../functions/cardFunctions'
import {tutorableCards,clickPlace} from '../functions/gameLogic'

import DragContainer from './DragContainer'
import DropSlot from './DropSlot'

import ManaSource from './ManaSource'
import Counters from './Counters'
import BasicSelect from './BasicSelect'
import CardControls from './CardControls'

function Zone(props) {
  const {zone,playtest,context,cardHeadOnly,header,handleMana,handleShuffle,gameState,cardState,moveCard,cardClick,spawnToken} = props
  const {deck,look,reveal} = playtest

  const [size,setSize] = useState({width:0,height:0})
  
  const zoneDiv = useRef()
  const bottom = useRef()
  useEffect(()=>{
    if(size.width!==zoneDiv.current.clientWidth) {
      setSize({
        width: zoneDiv.current.clientWidth,
        height: zoneDiv.current.clientHeight,
      })
      // if (!scrolled&&bottom.current) {bottom.current.scrollIntoView();scrolled=true}
    }
  })

  const cols = context==='grid'?Math.floor(size.width/CARD_SIZE.w):1
  const rows = context==='grid'?4:1
  const cards = deck.filter(c=>c.zone===zone).orderBy('order')

  const slot = (col,row) => {
    const cardStack = 
      context==='grid' ? cards.filter(c=>col===c.col&&row===c.row) : 
      context==='list' || zone==="Command" ? cards : 
      cards.splice(cards.length-(look||1),look||1).map(c=>{return {...c,faceDown:!look}})


    return <DropSlot key={"slot"+col}
        zone={zone}
        col={col} row={row}
        accept={zone==='Command'?ItemTypes.COMMANDER:[ItemTypes.CARD,ItemTypes.COMMANDER]}
        callBack={card=>moveCard({card:card,dest:zone,col:col,row:row})}
        >
          {cardStack[0]&&cardStack.map((c,i)=>renderCard(c,i))}
        </DropSlot>
  }


  const Zone = () => {
    const inner = [...Array(rows)].map((und,row)=><div key={"row"+row} className={`row row-${row}`}>
        {[...Array(cols)].map((und,col)=>slot(col,row))}
      </div>)
    return <div 
    key={zone} 
    className={`zone ${zone.toLowerCase()} ${context}`}
    ref={zoneDiv}
    >
      <div className="title" style={{display:!header&&'none'}}>
          <BasicSelect 
            isHeader
            searchable
            keys={['name','type_line','oracle_text']}
            options={cards} 
            labelBy={'name'}
            placeholder={`${zone} (${cards.length})`}
            callBack={c=>moveCard({card:c,dest:'Hand'})}
          />
      </div>
      {context!=='grid'
        ? inner
        : <div className="inner">{inner}<div className='bottom' ref={bottom}/></div>
      }
    </div>
  }




  const renderCard = (card,ind) => { 
    const tutorable = tutorableCards(card,deck)
    return <CardControls key={card.key} card={card} cardHeadOnly={cardHeadOnly}
      itemType={card.commander?ItemTypes.COMMANDER:ItemTypes.CARD}
      style={{
        position: (context==='single'||context==='grid')&&ind ? 'absolute':'default',
        top: (zone==='Library'?-ind:ind)+"rem",
        left: (zone==='Library'?ind*3:ind)+"rem",
        zIndex: ind,
      }}
      >
        {tutorable.from!==zone?null
        :<BasicSelect 
        options={tutorable.cards} 
        placeholder='Tutor'
        labelBy={'name'}
        callBack={c=>{
          cardClick(c,false,tutorable.dest)
          handleShuffle()
          if (tutorable.sac) cardClick(card,false,'Graveyard')
        }}
        />}
        {zone==="Library"&&look?<button onClick={_=>setTimeout(_=>moveCard({card,dest:'Library',effects:{bottom:true}}),50)}>bottom</button>:null}
        {zone!=="Battlefield"?null:<>
          <Counters card={card} cardState={cardState}/>
          <ManaSource card={card} cardState={cardState} handleMana={handleMana}/>      
          {!Q(card,'type_line','Token')?null:<button onClick={_=>spawnToken(card)}>Clone</button>}
        </>}
      </CardControls>
  }

  return Zone()
}



const select = state => {
  return {
    playtest: state.playtest,
    sleeve: state.settings.sleeve,
    list: state.deck.list,
    format: state.deck.format,
  }
}

export default connect(select,actions)(Zone)