/**
 * 装饰模式
 * 装饰器非常类似于“继承”，它们都是为了增强原始对象的功能，区别在于方式的不同，
 * 后者是在编译时（compile-time）静态地通过对原始类的继承完成，
 * 而前者则是在程序运行时（run-time）通过对原始对象动态地“包装”完成，是对类实例（对象）“装饰”的结果。
 */

// 抽象基类
class Showable {
  show() {}
}

class Girl extends Showable {
  show() {
    console.log('面部---')
  }
}

// 装饰抽象类
class Decorator extends Showable {
  constructor(showable) {
    super()
    this.showable = showable
  }
  show() {
    this.showable.show()
  }
}

// 口红
class FoundationMakeup extends Decorator {
  constructor(showable) {
    super(showable)
    this.showable = showable
  }
  show() {
    console.log('口红---')
    this.showable.show()
  }
}

// 粉底
class Lipstick  extends Decorator {
  constructor(showable) {
    super(showable)
    this.showable = showable
  }
  show() {
    console.log('粉底---')
    this.showable.show()
  }
}
const decorator = new Lipstick(new FoundationMakeup(new Girl())) 
decorator.show()