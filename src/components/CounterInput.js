import React from 'react'

export default function CounterInput({value,children,callBack,icon,neg,addOnClick}) {

	return  <p className='counter'>
          <span className={icon} onClick={()=>addOnClick&&callBack(addOnClick)}>
          {children}
          </span>
          <input className='discrete-input' type="number" value={value} onChange={e=>{
          	const val = parseInt(e.target.value)
			if (!isNaN(val)&&(val+value>=0||neg)) callBack(val)		
          }}/>
      </p> 

}