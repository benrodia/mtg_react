import React from 'react'

export default ({value,children,callBack,icon,neg,addOnClick})=> 
	<p className='counter'>
		<span className={icon} onClick={_=>addOnClick&&callBack(addOnClick)}>
		{children}
		</span>
		<input className='discrete-input' type="number" value={value} onChange={e=>{
			const val = e.target.value===''?0:parseInt(e.target.value)
			if (!isNaN(val)&&(val+value>=0||neg)) callBack(val)		
		}}/>
	</p> 