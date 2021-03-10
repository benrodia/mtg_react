import React from "react"
import utilities from "../utilities"
import {connect} from "react-redux"

const {fileMeta, interpretForm} = utilities

export default connect(({main: {cardData}}) => {
  return {cardData}
}, null)(({accept, callBack, cardData}) => {
  let reader

  const handleRead = _ => {
    if (reader.result) {
      const {found, notFound} = interpretForm(
        reader.result
          .split("\n")
          .filter(l => !l.includes("//"))
          .join("\n"),
        cardData
      )
      callBack({
        meta: fileMeta(reader.result),
        cards: found,
        notFound,
        text: reader.result
          .split("\n")
          .filter(l => !l.includes("//"))
          .join("\n"),
      })
    } else callBack({err: "Unable to read file."})
  }

  const onLoad = file => {
    reader = new FileReader()
    reader.onloadend = handleRead
    reader.readAsText(file)
  }

  return (
    <input
      type="file"
      onChange={e => onLoad(e.target.files[0])}
      accept={accept || "text/plain"}
    />
  )
})
