
export function sum(nums) {
  if (!nums || !nums.length) {return 0}
  else {return parseInt(nums.reduce((a, b) => a + b, 0),10)}
  
}

export function average(nums) {
  return nums.reduce((a, b) => a + b, 0)/nums.length
}

export function dif(a,b) {
  return Math.abs(a-b)
}

export function timestamp() {
	const today = new Date()
	const timestamp = (today.getHours()<10?'0'+today.getHours():today.getHours())
		+":"+((today.getMinutes()<10)?'0'+today.getMinutes():today.getMinutes())
		+":"+((today.getSeconds()<10)?'0'+today.getSeconds():today.getSeconds())

	// console.log('timestamp',timestamp)
	return timestamp
}

export function matchStr(text,searchWords,every) {
  return every===true?searchWords.every(el=>text&& typeof text=='string'?text.match(new RegExp(el,"i")):false)
  :every===false?!searchWords.every(el=>text&& typeof text=='string'?text.match(new RegExp(el,"i")):false)
  :searchWords.some(el=>text&& typeof text=='string'?text.match(new RegExp(el,"i")):false)
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

Array.prototype.orderBy = function(key) {
  return this.sort((a,b)=>(a[key] > b[key])?1:-1)
};

Array.prototype.unique = function(key) {
    let b = []
    for(var i=0; i<this.length; ++i) {
        if (key && !b.map(b=>b[key]).includes(this[i][key])) b.push(this[i])  
    }
    return b
}

