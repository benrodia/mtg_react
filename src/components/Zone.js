import React,{useState,useEffect,useRef} from 'react'

import {ETB} from '../constants/greps'
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

export default function Zone(props) {
  const {zone,deck,context,look,reveal,header,handleMana,handleShuffle,gameState,cardState,moveCard,openModal,cardClick,spawnToken} = props
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

  const Zone = () => {
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
      ?[...Array(rows)].map((und,row)=><div key={"row"+row} className={`row row-${row}`}>
          {[...Array(cols)].map((und,col)=>slot(col,row))}
        </div>
      )
      : <div className="inner">
        {[...Array(rows)].map((und,row)=><div key={"row"+row} className={`row row-${row}`}>
          {[...Array(cols)].map((und,col)=>slot(col,row))}
        </div>
        )}
      <div className='bottom' ref={bottom}/>
      </div>
    }
    </div>
  }

  const slot = (col,row) => {
    const cardStack = context==='grid' ? cards.filter(c=>col===c.col&&row===c.row)
      : context==='list' ? cards
      : zone==="Command"? cards : cards
        .splice(cards.length-(look||1),look||1)
        .map((c,i)=>{c.faceDown=!look&&!reveal;return c})


    return <DropSlot key={"slot"+col}
        zone={zone}
        col={col} row={row}
        accept={zone==='Command'?ItemTypes.COMMANDER:[ItemTypes.CARD,ItemTypes.COMMANDER]}
        callBack={card=>moveCard({card:card,dest:zone,col:col,row:row})}
        >
          {cardStack[0]&&cardStack.map((c,i)=>renderCard(c,i))}
        </DropSlot>
  }


  const renderCard = (card,ind) => { 
    const tutorable = tutorableCards(card,deck)
    return <CardControls key={card.key} card={card} {...props}
      itemType={card.commander?ItemTypes.COMMANDER:ItemTypes.CARD}
      style={{
        position: (context==='single'||context==='grid')&&ind ? 'absolute':'block',
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
          console.log('tutor',c.name,tutorable.dest)
          cardClick(c,false,tutorable.dest)
          handleShuffle()
          if (tutorable.sac) cardClick(card,false,'Graveyard')
        }}
        />}
        {zone==="Library"&&look?<button onClick={_=>{
          setTimeout(_=>moveCard({card:card,dest:'Library',effects:{bottom:true}}),50)
        }}>bottom</button>:null}
        {zone!=="Battlefield"?null:<>
          <Counters card={card} cardState={cardState}/>
          <ManaSource card={card} cardState={cardState} handleMana={handleMana}/>      
          {!Q(card,'type_line','Token')?null:<button onClick={_=>spawnToken(card)}>Clone</button>}
        </>}
      </CardControls>
  }

  return Zone()
}



