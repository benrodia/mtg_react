import React from 'react'

export default ({accept,callBack})=> {
  let reader

  const handleRead = _ => {
    if (reader.result) callBack(reader.result)
    else callBack("Unable to read file.")
  }

  const onLoad = file => {
    reader = new FileReader()
    reader.onloadend = handleRead 
    reader.readAsText(file)
  }

  return <input type="file" onChange={e=>onLoad(e.target.files[0])} accept={accept||"text/plain"}/>
}
