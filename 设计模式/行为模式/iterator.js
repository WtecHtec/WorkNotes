/**
 * 迭代模式
 * “提供了一种机制来按顺序访问集合中的各元素，而不需要知道集合内部的构造。”
 * 例如： 一页一页的翻书
 */

// 迭代接口
class iterator {
	next() { console.log('下一页') }
	hasNext() { console.log('结束?') }
}

class Books extends iterator {
	constructor() {
		super()
		this.pages = []
		this.size = 10
		this.index = 0
	}
	append() {
		if (this.pages.length >= this.size) return
		this.pages.push(Math.random())
	}
	next() {
		console.log(`第${this.pages[this.index]}页`)
		this.index += 1
	}
	hasNext() {

		if (this.index >= this.pages.length) {
			console.log('结束')
			return true
		}
		return false
	}
}

const book = new Books()
book.append()
book.append()
book.append()
book.append()
while (!book.hasNext()) {
	book.next()
}