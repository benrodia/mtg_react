import React, {useState, useRef, useEffect} from "react"
import matchSorter, {rankings} from "match-sorter"

import utilities from "../utilities"

export default function BasicSelect({
  img,
  self,
  autoCompleteCards,
  className,
  searchBy,
  string,
  orderBy,
  labelBy,
  renderAs,
  unique,
  options,
  defImg,
  placeholder,
  callBack,
  searchable,
  isHeader,
  limit,
  preview,
}) {
  const {titleCaps} = utilities

  const label = item =>
    (typeof labelBy === "function" && labelBy(item)) ||
    item["name"] ||
    item + ""

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [choices, setChoices] = useState([])
  const reset = _ => {
    setOpen(false)
    setSearch("")
    setChoices(orderBy ? options.orderBy(orderBy) : options)
  }
  useEffect(
    _ => {
      reset()
      return _ => reset()
    },
    [options]
  )

  const reduced =
    searchable && !search.length && !preview
      ? []
      : unique
      ? choices.slice(0, limit || 100).unique("name")
      : choices.slice(0, limit || 100)
  const optionDivs = reduced.map((o, i) => (
    <div
      className={`option`}
      key={`option_${i}_${label(o)}`}
      onClick={_ => {
        callBack && callBack(o)
        reset()
      }}>
      {renderAs ? renderAs(o, i) : label(o)}
    </div>
  ))

  const searchBox = (
    <input
      type="text"
      placeholder={placeholder || ""}
      autoFocus
      onFocus={_ => setOpen(true)}
      onBlur={_ => setTimeout(_ => reset(), 200)}
      value={search}
      id={`basicsearch${options.map(op => label(op))}`}
      onChange={e => {
        const sorted = !e.target.value.length
          ? options
          : matchSorter(
              options.map(o => {
                return typeof o === "string"
                  ? {label: label(o)}
                  : {...o, label: label(o)}
              }),
              e.target.value,
              {keys: searchBy || ["label"]}
            ).map(o => (typeof options[0] === "string" ? o.label : o))
        setSearch(e.target.value)
        setChoices(sorted)
      }}
    />
  )

  return (
    <div
      style={{display: !options || (!options.length && !isHeader && "none")}}
      tabIndex={"0"}
      onBlur={_ => {
        if (!searchable) setTimeout(_ => reset(), 100)
      }}
      className={`custom-select 
      ${open ? "open" : ""} 
      ${className || ""}
      ${img ? "icon" : ""}
       ${searchable && "searchable"}
    `}>
      {open ? (
        <div className="options">
          {searchable ? searchBox : null}
          {optionDivs}
        </div>
      ) : (
        <div onClick={_ => setOpen(true)} className={`select-collapsed`}>
          {defImg ? defImg : null}
          {placeholder ? placeholder : self !== undefined ? label(self) : ""}
        </div>
      )}
    </div>
  )
}
