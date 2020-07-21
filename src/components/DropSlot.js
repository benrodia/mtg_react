import React from 'react'
import { useDrop } from 'react-dnd'

export default function DropSlot(props) {
  const [{ isOver }, drop] = useDrop({
    accept: props.accept||'card',
    drop: item => { 
      item.board = props.board||item.board
      props.callBack(item,props.zone,props.col,props.row)
    },
    collect: monitor => ({isOver: !!monitor.isOver()})
  })

  return (
    <div 
    ref={drop} 
    className={`${props.board!=='trash'?'drop-slot':'trash'} ${props.zone||props.board}`}
    >
      {props.children}
      {isOver && (
        <div className={`drop-slot-over ${props.classes}`}/>
      )}
    </div>
  )
}

