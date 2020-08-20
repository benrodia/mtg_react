
export const cache = (obj,key,val) => {
  const data = key==='all' ? val : {...(JSON.parse(localStorage.getItem(obj))||{}),[key]:val}
  localStorage.setItem(obj,JSON.stringify(data))
}

export const session = (obj,key,val) => {
  const data = key==='all' ? val : {...(JSON.parse(sessionStorage.getItem(obj))||{}),[key]:val}
  sessionStorage.setItem(obj,JSON.stringify(data))
}


export const sum = nums =>!nums||!nums.length?0: nums.reduce((a, b)=>Number(a)+Number(b),0)

export const average = nums => nums.reduce((a, b) => a + b, 0)/nums.length

export const rem = (num=1) => num * parseFloat(window.getComputedStyle(document.getElementsByTagName("html")[0]).fontSize||16)

export const rnd = (arr,num) => {
  const rand = _=> arr[Math.floor(Math.random()*arr.length)]
  if (!num) return rand()
  else return [...Array(num)].map(_=>rand())
}

export const paginate = (arr=[],per=1) =>  [...Array(Math.ceil(arr.length/per)||1)].map((_,i)=>arr.slice(per*i,per*i+per))

export const timestamp = _ => {
	const today = new Date()
	const timestamp = (today.getHours()<10?'0'+today.getHours():today.getHours())
		+":"+((today.getMinutes()<10)?'0'+today.getMinutes():today.getMinutes())
		+":"+((today.getSeconds()<10)?'0'+today.getSeconds():today.getSeconds())

	// console.log('timestamp',timestamp)
	return timestamp
}

export const matchStr = (text='',searchWords=[],every=null) => {
  text = text.toString()
  return every===true?searchWords.every(el=>text.match(new RegExp(el,"i")))
  :every===false?!searchWords.every(el=>text.match(new RegExp(el,"i")))
  :searchWords.some(el=>text.match(new RegExp(el,"i")))
}


export const log = objs => {
  if (typeof objs === 'object') {
    let log = []
    for (var i = 0; i < Object.keys(objs).length; i++) 
      log.push(Object.keys(objs)[i],': ',Object.values(objs)[i],'\n')
    
    console.log(...log)
  }
}



Array.prototype.shuffle = function() {
    let cards = this
    let counter = this.length
    let t,i

    while (counter) {
      i = Math.floor(Math.random() * counter-- )
      t = cards[counter]
      cards[counter] = cards[i]
      cards[i] = t
    }
    return cards
}

Array.prototype.orderBy = function(key) {return this.sort((a,b)=>(a[key] > b[key])?1:-1)}


Array.prototype.unique = function(key) {
    let b = []
    for(var i=0; i<this.length; ++i) {
        if (key && !b.map(b=>b[key]).includes(this[i][key])) b.push(this[i])  
    }
    return b
}

