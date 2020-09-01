import React, {useState} from "react"
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
  const [fileText, setFileText] = useState(meta + textList(list))
  const [fileExt, setFileExt] = useState(".txt")

  return (
    <div className="download-box">
      <h3>
        File Name: <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} />
      </h3>
      <h3>Preview File:</h3>
      <textarea columns={50} rows={15} value={fileText} onChange={e => setFileText(e.target.value)} />

      <br />
      <br />
      <div className="bar">
        <a
          onClick={_ => openModal(null)}
          download={`${fileName}${fileExt}`}
          href={URL.createObjectURL(new Blob([...fileText], {type: "text/plain"}))}>
          <button className="success-button">Download</button>
        </a>
        <BasicSearch self={fileExt} options={[".txt", ".dec"]} callBack={e => setFileExt(e)} />
      </div>
    </div>
  )
})
