import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import BasicSearch from "./BasicSearch"

const {textList, titleCaps} = utilities

export default connect(({deck: {name, format, list}, auth: {user}}) => {
  return {name, format, list, user}
}, actions)(({accept, name, user, list, format, openModal}) => {
  const userName = user.name || "Author Unknown"
  const fn =
    titleCaps(format.replace(/\s+/g, "_")) + "_" + name.replace(/\s+/g, "_") + "_by_" + userName.replace(/\s+/g, "_")

  const meta = [
    "//Deck file created in ReactMTG",
    "//NAME : " + name,
    "//CREATOR : " + userName,
    "//FORMAT : " + format,
    "",
    "",
  ].join("\n")

  const [fileName, setFileName] = useState(fn)
  const [fileExt, setFileExt] = useState(".txt")
  const [fileText, setFileText] = useState(textList(list))

  useEffect(
    _ => {
      const simple = fileExt !== ".mwDeck"
      setFileText((simple ? "" : meta) + textList(list, simple))
    },
    [fileExt]
  )

  return (
    <div className="download-box col">
      <div className="block">
        <h4>File Name</h4>
        <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} />
      </div>
      <div className="block">
        <h4>Extension</h4>
        <BasicSearch self={fileExt} options={[".dek", ".txt", ".mwDeck"]} callBack={e => setFileExt(e)} />
      </div>
      <div className="block">
        <h4>Preview File:</h4>
        <textarea columns={50} rows={15} value={fileText} onChange={e => setFileText(e.target.value)} />
      </div>

      <div className="bar even block">
        <a
          onClick={_ => openModal(null)}
          download={`${fileName}${fileExt}`}
          href={URL.createObjectURL(new Blob([...fileText], {type: "text/plain"}))}>
          <button className="success-button">Download</button>
        </a>
      </div>
    </div>
  )
})
