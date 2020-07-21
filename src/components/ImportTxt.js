import React from 'react'

import {itemizeDeckList} from '../functions/cardFunctions'

export default function DownloadTxt(props) {

  const onLoad = event => {
    console.log(event.target.files[0])
    const file = event.target.files[0]
    if (file.type.match(/text.*/)) {
        let reader = new FileReader()

        reader.onload = function(e) {
            //Here the content has been read successfuly
            console.log(reader.result)
            props.callBack(reader.result)
        }
        reader.readAsText(file)
    } 
  }

  return <input type="file" onChange={e=>onLoad(e)} accept="text/plain"/>
  // return null
}
