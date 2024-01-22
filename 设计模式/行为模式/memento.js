/**
 * 备忘录模式
 * 缓存机制,返回上一步等操作使用
 * 例子：记笔记
 */

// 单个数据历史类
class History {
  constructor(body) {
    this.body = body
  }
  getBody() {
    return this.body
  }
}

// 笔记类
class Doc {
  constructor() {
    this.title = ''
    this.body = ''
  }
  setTitle(title) {
    this.title = title
  }
  getTitle() {
    return this.title
  }
  setBody(body) {
    this.body = body
  }
  getBody() {
    return this.body
  }

  createHistory() {
    return new History(this.body)
  }
   restoreHistory(history) {
    this.body = history.getBody()
   }
}

class Editor {
  constructor(doc) {
    this.doc  = doc
    this.historys = [] // 历史记录
    this.hisIndex = 0 // 历史记录位置
  }

  // 保存记录
  backup() {
    this.historys.push(this.doc.createHistory())
    this.hisIndex ++
  }

  show() {
    console.log('显示:',this.doc.getBody())
  }

  write(body) {
    this.doc.setBody(body)
    this.backup()
    this.show()
  }
  
  undo() {
    if (this.hisIndex === 0) {
      console.log('end')
      return
    }
    this.hisIndex --
    const history = this.historys[this.hisIndex]
    this.doc.restoreHistory(history)
    this.show()
  }

}

const editor = new Editor(new Doc())
editor.write('测试')
editor.write('测试1')

editor.undo()
editor.undo()
editor.undo()
// editor.show()