import React from 'react'

import {CARD_SIZE} from '../Constants'
import {qCard,tutorableCards} from '../functions/cardFunctions'
import CustomSelect from './CustomSelect'

import DragContainer from './DragContainer'
import DropSlot from './DropSlot'
import Card from './Card'
import CardControls from './CardControls'

export default class Zone extends React.Component {

  state = {width:0,height:0}

  componentDidMount() {this.scrollToBottom();this.setSize()}
  componentDidUpdate() {if(this.state.width!==this.zoneCont.clientWidth) {this.setSize()}}

  
  render() {
    const cols = this.props.context==='grid'
        ?Math.floor(this.state.width/CARD_SIZE.w)
        :1
    const rows = this.props.context==='grid'?4:1

    const cards = this.props.deck.filter(c=>c.zone===this.props.zone)

    let inner = []
    for (var i = 0; i < rows; i++) {
      let slots = []
      for (let j = 0; j < cols; j++) {slots.push(j)}
      inner.unshift(slots)
    }

    const innerContent = inner.map((row,ind)=>{
      return <div key={"row"+row+ind} className={`inner row-${ind}`}>
        {row.map(col=>this.slot(col,ind,cards))}
      </div>
    })

    return (
      <div 
      key={this.props.zone} 
      className={`zone ${this.props.zone.toLowerCase()} ${this.props.context}`}
      ref={div=>this.zoneCont=div}>
        {this.props.header&&
        <div className="title">
          <h2>{this.props.zone} ({cards.length})</h2>
        </div>}
        {innerContent}
      </div>
    )
  }


  
  slot(col,row,cards) {
    let cardStack = cards
    if (this.props.context==='grid'){
      cardStack = cardStack.filter(c=>col===c.col&&row===c.row)
      .sort((a,b)=>(a.stack > b.stack)?1:-1) 
    } 
    else if (this.props.context==='single'){
      cardStack = [cardStack[cardStack.length-1]] 
    } 

    return (
        <DropSlot 
          key={"slot"+col}
          zone={this.props.zone}
          accept={'card'}
          col={col}
          row={row}
          callBack={this.props.moveCard}
        >
          {cardStack.map(card=>this.renderCard(card))}
        </DropSlot>
    )
  }
  
  renderCard(card) {  
    const counters = () => {
      const sign = card.counters>=0?"+":""
      return <div className="change-counters" style={{display: (!card.type_line.includes('Creature') && !card.type_line.includes('Planeswalker')) && 'none'}} >
        <button className="plusCounter" onClick={()=>this.props.cardState(card,'counters',card.counters+1)}>+1</button>/
        <button className="minusCounter" onClick={()=>this.props.cardState(card,'counters',card.counters-1)}>-1</button>
        <h3>({card.type_line.includes('Planeswalker') ? card.counters : sign+card.counters+"/"+sign+card.counters})</h3>
      </div>
    }

    const tutor = () => {
      return <CustomSelect 
        options={tutorableCards(card,this.props.deck)} 
        dest="Battlefield" 
        callBack={this.props.moveCard}
        />
    }

    return (
    <DragContainer
    item={card}
    style={{
      position: (card.stack&&this.props.context==='grid') && 'absolute',
      top: card.stack+"rem",
      left: card.stack+"rem",
      zIndex: card.stack,
    }}
    >
      <CardControls 
      openModal={this.props.openModal}
      cardClick={this.props.cardClick}
      moveCard={this.props.moveCard}
      card={card}
      controls={<>
        {tutor}
        {this.props.zone==='Battlefield'&&counters}
      </>} 
      >
        <Card
        key={card.key}
        {...this.props}
        card={card}
        faceDown={this.props.faceDown}
        cardHeadOnly={this.props.cardHeadOnly}
        />
      </CardControls>
    </DragContainer>
    )
  }

  scrollToBottom() {
    const scrollHeight = this.zoneCont.scrollHeight;
    const height = this.zoneCont.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.zoneCont.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  setSize() {
    console.log('resize')
    this.setState({
      width: this.zoneCont.clientWidth,
      height: this.zoneCont.clientWidth,
    })
  }
}


