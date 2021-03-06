import React, {useState, useImperativeHandle} from "react"
import {useDrop, DropTarget, DragPreviewImage} from "react-dnd"
import {ItemTypes} from "../constants/data"

export default function DropSlot({accept, callBack, children, field}) {
  const [hasDropped, setHasDropped] = useState(false)
  const [hasDroppedOnChild, setHasDroppedOnChild] = useState(false)
  const [{isOver, isOverCurrent}, drop, preview] = useDrop({
    accept: accept || ItemTypes.CARD,
    drop(item, monitor) {
      const didDrop = monitor.didDrop()
      if (didDrop) return

      callBack(item)
      setHasDropped(true)
      setHasDroppedOnChild(didDrop)
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({shallow: true}),
    }),
  })

  return (
    <div ref={drop} className={`drop-slot ${field} ${isOver && "over"}`}>
      {children}
    </div>
  )
}
