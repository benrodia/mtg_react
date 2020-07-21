import React from 'react'

export default function CounterInput(props) {
	const {value,children,callBack,icon,neg,addOnClick} = props


	return  <p className='counter'>
          <span className={icon} onClick={()=>addOnClick&&callBack(addOnClick)}>
          {children}
          </span>
          <input type="number" value={value} onChange={e=>{
          	const val = parseInt(e.target.value)
			if (!isNaN(val)&&(val+value>=0||neg)) callBack(val)		
          }}/>
      </p> 

}