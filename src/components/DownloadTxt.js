import React from 'react'

import {itemizeDeckList} from '../functions/cardFunctions'
import titleCaps from '../functions/titleCaps'

export default function DownloadTxt(props) {
  const meta = [
  	"//Deck file created by MagicTouch \n",
  	"//NAME : " + props.deck.name +"\n",
  	"//CREATOR : " + props.settings.userName +"\n",
  	"//FORMAT : " + props.deck.format +"\n"
  ]
  const list = itemizeDeckList(props.deck.list,['name'])
      .map(cards=>cards.length+" "+cards[0].name)
      .join('\n')
  const fileObj = meta.concat(list)

  
    return <a 
        className='clean-button'
        download={`${
        	titleCaps(props.deck.format.replace(/\s+/g, '_'))+"_"+
        	props.deck.name.replace(/\s+/g, '_')+"_by_"+
        	props.settings.userName.replace(/\s+/g, '_')
        }.txt`} 
        href={URL.createObjectURL(new Blob([...fileObj], {type: 'text/plain'}))}>
          Download .txt
        </a>
}