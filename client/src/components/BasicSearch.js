import React, {useState, useRef, useEffect} from "react"
import matchSorter, {rankings} from "match-sorter"
import {v4 as uuid} from "uuid"

import utilities from "../utilities"

const {titleCaps, pluralize, wrapNum} = utilities
export default function BasicSelect({
  img,
  self,
  className,
  searchBy,
  sort,
  labelBy,
  renderAs,
  unique,
  options,
  separate,
  defImg,
  placeholder,
  callBack,
  searchable,
  addable,
  isHeader,
  limit,
  preview,
}) {
  const outer = useRef(null)
  const objects =
    options && separate ? options.unique(separate).map(o => o[separate]) : []

  const label = item =>
    (typeof labelBy === "function" && labelBy(item)) ||
    item["name"] ||
    item + ""
  const [id, setId] = useState(uuid())
  const [open, setOpen] = useState(false)
  const [keyStroke, setKeystroke] = useState(null)
  const [search, setSearch] = useState("")
  const [choices, setChoices] = useState([])
  const [cursor, setCursor] = useState(-1)
  const [filtered, setFiltered] = useState("all")

  const reduce = (ops, s) => {
    if ((searchable && !s.length && !preview) || (separate && !filtered.length))
      return []
    else {
      let reduced = ops.slice(0, limit || 100)
      if (unique) reduced = reduced.unique("name")
      if (
        addable &&
        s.length &&
        !ops.some(ch => ch.toLowerCase() === s.toLowerCase())
      )
        reduced = [s, ...reduced]
      if (!search.length && sort === true) reduced.sort()
      else if (!search.length && sort) reduced.orderBy(sort)
      return reduced
    }
  }

  const reset = _ => {
    setOpen(false)
    setSearch("")
    setChoices(reduce(options, ""))
    setCursor(-1)
  }

  const handleKey = _ => {
    let newC = 0
    if (keyStroke === 27) reset()
    else if (keyStroke === 13) {
      callBack(choices[cursor] || search)
      reset()
    } else if (keyStroke === 37 || keyStroke === 38)
      newC = wrapNum(cursor - 1, choices.length)
    else if (keyStroke === 39 || keyStroke === 40)
      newC = wrapNum(cursor + 1, choices.length)
    setCursor(newC)
    setKeystroke(null)
  }

  if (keyStroke && open && callBack) handleKey()

  useEffect(
    _ => {
      const keyEvent = e => {
        if ([37, 38, 39, 40].includes(e.keyCode) && open) e.preventDefault()
        setKeystroke(e.keyCode)
      }
      const click = e =>
        (outer.current && outer.current.contains(e.target)) || reset()

      window.addEventListener("keydown", keyEvent, false)
      window.addEventListener("mousedown", click, false)
      reset()
      return _ => {
        reset()
        window.removeEventListener("keydown", keyEvent, false)
        window.removeEventListener("mousedown", click, false)
      }
    },
    [options]
  )

  useEffect(
    _ => {
      let ops = options.filter(
        o => !separate || filtered === "all" || filtered === o[separate]
      )

      ops = search.length
        ? matchSorter(
            ops.map(o => {
              return typeof o === "string"
                ? {label: label(o)}
                : {...o, label: label(o)}
            }),
            search,
            {keys: searchBy || ["label"]}
          ).map(o => (typeof ops[0] === "string" ? o.label : o))
        : ops
      setChoices(reduce(ops, search))
    },
    [search, filtered]
  )

  const optionDivs = choices.map((o, i) => (
    <Option
      o={o}
      i={i}
      callBack={callBack}
      label={label}
      cursor={cursor}
      setCursor={setCursor}
      renderAs={renderAs}
      reset={reset}
    />
  ))

  const searchInput = (
    <input
      type="text"
      placeholder={placeholder || ""}
      autoFocus
      onFocus={_ => setOpen(true)}
      value={search}
      id={id}
      onChange={e => setSearch(e.target.value)}
    />
  )

  return (
    <div
      ref={outer}
      tabIndex={"0"}
      className={`custom-select 
      ${open ? "open" : ""} 
      ${className || ""}
      ${searchable && "searchable"}
    `}>
      {open ? (
        <>
          {separate ? (
            <div className="bar even thin-pad mini-spaced-bar">
              <span>Include: </span>
              <button
                onClick={_ => setFiltered("all")}
                className={`smaller-button ${
                  filtered === "all" && "selected"
                }`}>
                All
              </button>
              {objects.map(obj => (
                <button
                  onClick={_ => setFiltered(obj)}
                  className={`smaller-button ${
                    filtered === obj && "selected"
                  }`}>
                  {titleCaps(pluralize(obj, 2))}
                </button>
              ))}
            </div>
          ) : null}
          {searchable ? searchInput : null}
          <div className="options">{optionDivs}</div>
        </>
      ) : (
        <div
          onClick={_ => setOpen(true)}
          className={`select-collapsed bar even thinner-pad`}>
          <span>
            {placeholder ? placeholder : self !== undefined ? label(self) : ""}
          </span>
        </div>
      )}
    </div>
  )
}

const Option = ({
  o,
  i,
  callBack,
  label,
  cursor,
  setCursor,
  renderAs,
  reset,
}) => {
  const ref = useRef(null)
  useEffect(
    _ => {
      cursor === i &&
        ref.current &&
        ref.current.scrollIntoView({block: "nearest"})
    },
    [cursor]
  )
  return (
    <div
      ref={ref}
      className={`option ${cursor === i && "selected"}`}
      key={`option_${i}_${label(o)}`}
      onMouseOver={_ => setCursor(i)}
      onClick={_ => {
        callBack && callBack(o)
        reset()
      }}>
      {renderAs ? (
        renderAs(o, i)
      ) : (
        <span className="thinner-pad">{label(o)}</span>
      )}
    </div>
  )
}
