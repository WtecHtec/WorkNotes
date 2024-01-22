/**
 * 访问者模式
 * 数据与算法的耦合问题，尤其是在数据结构比较稳定，而算法多变的情况下
 * 例如： 商店产品价格计算。酒水类按瓶，水果类按斤
 */

// 访问者抽象类
class Visitor {
  visitor(product) { console.log(product) }
}

/** 产品抽象类 */
class Product {

  constructor(name, price) {
    this.name = name
    this.price = price
  }

  setName(name) {
    this.name = name
  }
  getName() {
    return this.name
  }

  setPrice(price) {
    this.price = price
  }

  getPrice() {
    return this.price
  }

}


/** 水果 */
class Fruit extends Product {

  constructor(name, price, weight) {
    super(name, price)
    this.weight = weight
  }

  setWeight(weight) {
    this.weight = weight
  }

  getWeight() {
    return this.weight
  }

}


class Wine extends Product {
  constructor(name, price) {
    super(name, price)
  }
}

class DiscountVisitor extends Visitor {
  visitor(product) { 
    if (product instanceof Fruit) {
      console.log('Fruit') 
    } else if (product instanceof Wine) {
      console.log('Wine')
    }
  }
}

const discountVisitor = new DiscountVisitor()
discountVisitor.visitor(new Fruit('苹果', 10))
discountVisitor.visitor(new Wine('啤酒', 10))