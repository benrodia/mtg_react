import React,{useState,useEffect} from 'react'

export default function ItemImput({
	addable,
	removable,
	changeable,
	value,
	list,
	callBack,
	filters
}) {
	const [input,update] = useState(!!addable?'':value.name)
	const [edit,isEditing] = useState(!!addable)
	useEffect(_ => {
	  window.addEventListener('keyup',keyEvent)
	  return _ => {window.removeEventListener('keyup',keyEvent)}
	}, [])

	const keyEvent = e => {
		if (e.key === 'Enter'&&document.activeElement.id===value.key){
			changeable&&change(true)
			addable&&add()
		} 
	}

	const canAdd = input.trim().length&&!list.filter(l=>l.name===input).length
	const add = _ => {
		if (canAdd) {
			callBack([...list,{key:value.key,name:input}])
			update('')
		}
	}
	const remove =_=> {
		// console.log('remove',value.key,list.map(l=>l.key))
		callBack(list.filter(l=>l.key!==value.key))
	}
	const change = doit => {
		const doChange = doit||(edit&&input.length)
		if(doChange) callBack(list.map(l=>{l.name = l.key===value.key?input:l.name;return l}))
		isEditing(!edit)
	}
	return <>
		{!edit?<span onClick={change}>{value.name}</span>
		:<input id={value.key} autoFocus onBlur={changeable&&change} 
			className={`custom-input {changeable?'discrete-input':''}`} type="text" 
			value={input} 
			placeholder={value.name} 
			onChange={e=>update(e.target.value)}/>
		}
		{!addable?null:<button className={`success-button ${!canAdd&&'disabled'}`} onClick={add}>+</button>}
		{!changeable?null:<span className='icon-pencil' onClick={change}/>}
		{!removable?null:<span className='icon-trashcan' onClick={remove}>X</span>}
	</>
}