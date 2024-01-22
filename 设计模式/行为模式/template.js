/**
 * 模板模式（提取类中公共方法）
 * 模板方法模式巧妙地结合了抽象类虚部方法与实部方法，
 * 分别定义了可变部分与不变部分，其中前者留给子类去实现，保证了系统的可扩展性；
 * 而后者则包含一系列对前者的逻辑调用，为子类提供了一种固有的应用指导规范。
 */

// 哺乳动物 抽象类
class Mammal  {
  move() {}
  eat() {}
  live() {
    this.move()
    this.eat()
    console.log('生活')
  }
}

// 狗
class Dog extends Mammal {
  move() {
    console.log('走')
  }
  eat() {
    console.log('吃骨头')
  }
}

// 猫
class Cat extends Mammal {
  move() {
    console.log('走')
  }
  eat() {
    console.log('吃猫粮')
  }
}

new Dog().live()
new Cat().live()