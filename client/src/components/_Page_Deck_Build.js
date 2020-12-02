import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import axios from "axios"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuidv4} from "uuid"
import utilities from "../utilities"

import Board from "./Board"
import BoardFilters from "./BoardFilters"
import DeckInfoEdit from "./DeckInfoEdit"
import AdvancedFilters from "./AdvancedFilters"
import AdvancedField from "./AdvancedField"
import AdvancedCart from "./AdvancedCart"
import AdvancedResults from "./AdvancedResults"
import CardControls from "./CardControls"
import Loading from "./Loading"

const {advancedFields} = utilities
export default connect(
	null,
	actions
)(({}) => {
	return (
		<div className="advanced">
			<div className="inner">
				<div className="advanced-search spaced-col gap">
					{advancedFields.map((a, i) => {
						return <AdvancedField key={"field__" + i} index={i} />
					})}
				</div>
				<div className="advanced-search-results">
					<h1 className="block">Card Search</h1>
					<AdvancedFilters />
					<AdvancedResults />
				</div>
			</div>
		</div>
	)
})
