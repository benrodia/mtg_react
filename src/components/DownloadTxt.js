import React from 'react'
import {connect} from 'react-redux'

import * as actions from '../actionCreators'

import {itemizeDeckList} from '../functions/cardFunctions'
import titleCaps from '../functions/titleCaps'

function DownloadTxt(props) {
  const {name,userName,list,format} = props

  const meta = [
  	"//Deck file created by MagicTouch \n",
  	"//NAME : " + name +"\n",
  	"//CREATOR : " + userName +"\n",
  	"//FORMAT : " + format +"\n"
  ]

  const deckList = itemizeDeckList(list,['name'])
      .map(cards=>cards.length+" "+cards[0].name)
      .join('\n')
  const fileObj = meta.concat(deckList)

  
    return <a 
        className='clean-button'
        download={`${
        	titleCaps(format.replace(/\s+/g, '_'))+"_"+
        	name.replace(/\s+/g, '_')+"_by_"+
        	userName.replace(/\s+/g, '_')
        }.txt`} 
        href={URL.createObjectURL(new Blob([...fileObj], {type: 'text/plain'}))}>
          Download .txt
        </a>
}
const select = state => {
  return {
    name: state.deck.name,
    format: state.deck.format,
    list: state.deck.list,
    userName: state.settings.userName
  }
}

export default connect(select)(DownloadTxt)