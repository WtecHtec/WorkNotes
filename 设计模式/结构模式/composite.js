/**
 * 组合模式
 * 对象组合成树状结构， 并且能像使用独立对象一样使用它们。
 * 例如： 文件系统
 */

// 节点抽象基类
class Node {
  constructor(name) {
    this.name = name
  }
  addChild(node) {
    console.log('添加子节点')
  }
}

// 文件夹
class Folder extends Node {
  constructor(){
    super('Folder')
    this.nodeList = []
  }
  addChild(node) {
    console.log('添加子节点===:', node)
    this.nodeList.push(node)
  }
}

// 文件
class File extends Node {
  constructor(){
    super('File')
  }
  addChild(node) {
    console.log('不能添加子节点')
  }
}

const root = new Folder()
const file = new File()
root.addChild(file)


