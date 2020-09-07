import React, {useState} from "react"
import {Link} from "react-router-dom"
import {connect} from "react-redux"
import ago from "s-ago"
import actions from "../actions"
import utilities from "../utilities"

const {HOME_DIR, FORMATS, COLORS, ItemTypes, sum, audit, titleCaps, textList, formattedDate, canPublish} = utilities

export default connect(({auth: {user: {_id}}, main: {legalCards, users, decks}, deck, filters: {board, basic}}) => {
	return {_id, legalCards, users, decks, ...deck, board, basic}
}, actions)(({_id, desc, author, openModal, changeDeck, canEdit}) => {})
