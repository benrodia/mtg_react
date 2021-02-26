export const cache = (obj, key, val, session) => {
  let stored = session
    ? sessionStorage.getItem(obj)
    : session === false
    ? null
    : localStorage.getItem(obj)
  stored = !stored || stored === "undefined" ? {} : JSON.parse(stored)
  const data = key === "all" ? {...stored, ...val} : {...stored, [key]: val}
  session
    ? sessionStorage.setItem(obj, JSON.stringify(data))
    : localStorage.setItem(obj, JSON.stringify(data))
}

export const loadCache = (key, init = {}, session, clear) => {
  let data = session ? sessionStorage.getItem(key) : localStorage.getItem(key)
  data = !data || data === "undefined" ? {} : JSON.parse(data)
  return clear ? init : {...init, ...data}
}

export const sum = nums =>
  !nums || !nums.length ? 0 : nums.reduce((a, b) => Number(a) + Number(b), 0)

export const average = nums => nums.reduce((a, b) => a + b, 0) / nums.length

export const rem = (num = 1) =>
  num *
  parseFloat(
    window.getComputedStyle(document.getElementsByTagName("html")[0])
      .fontSize || 16
  )
export const wrapNum = (delt, range) =>
  delt < 0 ? range : delt >= range ? 0 : delt

export const factorial = (x, f = 1) => (x === 0 ? 1 : x * factorial(x - f))

export const rnd = (arr = [], num = 0, noDupes) => {
  if (typeof arr === "number") return Math.floor(Math.random() * arr)
  const rand = _ => arr[Math.floor(Math.random() * arr.length)]
  if (!num) return rand()
  else if (noDupes) {
    const a = [...arr]
    let r = []
    for (var i = 0; i < num; i++) r = [...r, a.shuffle().pop()]

    return r
  } else return [...Array(num)].map(_ => rand())
}

export const paginate = (arr = [], per = 1) =>
  [...Array(Math.ceil(arr.length / per) || 1)].map((_, i) =>
    [...arr].slice(per * i, per * i + per)
  )

export const timestamp = _ => {
  const today = new Date()
  const timestamp =
    (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) +
    ":" +
    (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()) +
    ":" +
    (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds())

  // console.log('timestamp',timestamp)
  return timestamp
}
export const formattedDate = date => {
  var year = date.getFullYear()

  var month = (1 + date.getMonth()).toString()
  month = month.length > 1 ? month : "0" + month

  var day = date.getDate().toString()
  day = day.length > 1 ? day : "0" + day

  return month + "/" + day + "/" + year
}

export const matchStr = (t = "", searchWords = [], every = null) => {
  t = `${t}`.toLowerCase()

  const test = (text, el) => text.includes(`${el}`.toLowerCase())

  return every === true
    ? searchWords.every(el => test(t, el))
    : every === false
    ? !searchWords.every(el => test(t, el))
    : searchWords.some(el => test(t, el))
}

export const log = objs => {
  if (typeof objs === "object") {
    let log = []
    for (var i = 0; i < Object.keys(objs).length; i++)
      log.push(Object.keys(objs)[i], ": ", Object.values(objs)[i], "\n")

    console.log(...log)
  }
}

Array.prototype.shuffle = function () {
  let cards = this
  let counter = this.length
  let t, i

  while (counter) {
    i = Math.floor(Math.random() * counter--)
    t = cards[counter]
    cards[counter] = cards[i]
    cards[i] = t
  }
  return cards
}

Array.prototype.orderBy = function (key, asc) {
  if (!this || !this.length) return []
  return this.sort((a, b) => (a[key] > b[key] ? (asc ? -1 : 1) : asc ? 1 : -1))
}

Array.prototype.unique = function (key) {
  if (!this || !this.length) return []
  let b = []
  for (var i = 0; i < this.length; ++i) {
    if (!b.find(b => (key ? b[key] === this[i][key] : b === this[i])))
      b.push(this[i])
  }
  return b
}
