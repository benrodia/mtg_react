import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actionCreators'
import utilities from '../utilities'

import Sticky from './Sticky'
import DropSlot from './DropSlot'
import BasicSearch from './BasicSearch'
import ItemInput from './ItemInput'

const {
	SINGLETON,
	FILTER_TERMS,
	ItemTypes,
	COLORS,
	BOARDS,
	MAIN_BOARD,
	rem,
} = utilities

export default connect(({deck:{list,format},filters}) => {return {list,format,...filters}},actions)
(({
	list,
	format,
	sortBy,
	view,
	board,
	showIllegal,
	showPrice,
	showTypes,
	customFields,
	changeFilters,
	changeCard,
})=> {

	return <Sticky offset={rem(6)}>	
	<div className="list-head">
		<div className="board-labels">
			{BOARDS.map(B=>{
				const cards = list.filter(c=>c.board===B)
				const legalAmt = B!==MAIN_BOARD||cards.length>=(SINGLETON(format)?100:60)&&cards.length<=(SINGLETON(format)?100:600)
				return <h2 key={B} className={`board-label ${B===board&&'active'}`} onClick={_=>changeFilters('board',B)}>
					<DropSlot key={"board_header_"+B} field={B}
					accept={[ItemTypes.CARD,ItemTypes.COMMANDER]}
					callBack={c=>changeCard(c,{board:B})}>	
					{B}board <span> (<span style={{color:!legalAmt&&'#f46'}}>{cards.length}</span>)</span>
					</DropSlot>
				</h2> 
			})}
		</div>
		<span className='view-options'>			
			<button title="Highlight Illegal Cards/Quantities" className={`small-button ${showIllegal&&'selected'}`} onClick={_=>changeFilters('showIllegal',!showIllegal)}>!!!</button>
			<button title="Display Card Prices" className={`small-button ${showPrice&&'selected'}`} onClick={_=>changeFilters('showPrice',!showPrice)}>$$$</button>
			<button title="View as Bulleted List" className={`icon-list-bullet small-button ${view==='list'&&'selected'}`} onClick={_=>changeFilters('view','list')}/>
			<button title="View as Image Grid" className={`icon-th-large small-button ${view==='grid'&&'selected'}`} onClick={_=>changeFilters('view','grid')}/>
			<BasicSearch 
				self={FILTER_TERMS.filter(f=>f.name===sortBy)[0]}
				defImg={<span className="icon-sort-alt-down"/>}
				options={FILTER_TERMS} labelBy={'name'}
	            callBack={s=>changeFilters('sortBy',s.name)} 
	        />
			{sortBy!=='Custom'?null: <ItemInput addable value={{name:'New Field',key:'custom'+customFields.length}} list={customFields} callBack={n=>changeFilters('customFields',n)}/>}
		</span>
	</div>
	</Sticky>
})			


