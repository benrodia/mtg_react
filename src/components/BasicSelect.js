import React,{useState,useRef,useEffect} from 'react'
import matchSorter from 'match-sorter'

import '../functions/utility'
import {titleCaps} from '../functions/text'


export default function BasicSelect({
  open,
  img,
  className,
  self,
  labelBy,
  valueBy,
  options,
  defImg,
  placeholder,
  callBack,
  searchable,
  isHeader,
  limit
}) {

  const reset = {open:false,search:'',options:options||[]}
  const label=item=>(typeof(labelBy)==='function'?labelBy(item):item['name'])||item.toString()

  const [state,setstate] = useState(reset)
  let displayed = [...state.options]
  displayed.length = Math.min(displayed.length,limit||100)
  const optionDivs = displayed.map((o,i)=><div 
    className={`option`}
    key={`option-${i}${label(o)}`}
    onClick={_=>{callBack(o);setstate(reset)}}>
      <span>{titleCaps(label(o))}</span>
      {img?img(o):null}
    </div>
  )

  const search = <input type="text" 
    placeholder={placeholder||''}
    autoFocus
    onFocus={_=>setstate({...state,open: true})}
    onBlur={_=>setTimeout(_=>setstate(reset),200)}
    value={state.search} 
    id={`basicsearch${options}`}
    onChange={e=>{
      const sorted = e.target.value.length
        ?matchSorter(options.map(o=>{return{...o,label:label(o)}}),e.target.value,{keys:['label']})
        :options
      setstate({...state,search:e.target.value,options:sorted})
    }}
    />


  return <div 
    style={{display: !options||!options.length&&!isHeader&&'none'}}
    tabIndex={"0"} 
    onBlur={_=>{if(!searchable)setTimeout(_=>setstate(reset),50)}}
    className={`custom-select 
      ${state.open||state.searching?'open':''} 
      ${className?className:''}
      ${img?'icon':''}
    `}
    >
    {state.open
      ? <div className="options">
          {searchable?search:null}
          {optionDivs}
        </div>
      : <div 
      
      onClick={_=>setstate({...state,open:true})}
      className="select-collapsed">
          {defImg?defImg:null}
          {placeholder?placeholder
          :titleCaps(self!==undefined
          ?label(self)
          :'')}
        </div>
    }
    </div>
}

