

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

Array.prototype.unique = function(key) {
    let b = []
    for(var i=0; i<this.length; ++i) {
        if (key && !b.map(b=>b[key]).includes(this[i][key])) b.push(this[i])  
    }
    return b
}
