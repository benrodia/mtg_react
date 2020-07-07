import React from 'react'
import { useDrop } from 'react-dnd'

export default function DropSlot(props) {
  const [{ isOver }, drop] = useDrop({
    accept: props.accept || 'card',
    drop: item => { 
      item.board = props.board||item.board
      props.callBack(item,props.zone,props.col,props.row)
    },
    collect: monitor => ({isOver: !!monitor.isOver()})
  })

  return (
    <div 
    ref={drop} 
    className={`drop-slot ${props.zone||props.board} ${props.row +"_"+ props.col}`}
    >
      {props.children}
      {isOver && (
        <div className='drop-slot-over'/>
      )}
    </div>
  )
}

