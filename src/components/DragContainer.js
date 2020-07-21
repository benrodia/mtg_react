import React from 'react'
import { useDrag } from 'react-dnd'


export default function DragContainer(props) {
	const [{isDragging}, drag] = useDrag({
		item: {key:props.item.key,type: props.type||'card'},
		collect: monitor => ({isDragging: !!monitor.isDragging()})
	})

	return <div ref={drag} style={props.style}>
			    {React.cloneElement(props.children,{isDragging:isDragging})}
			</div>
}

