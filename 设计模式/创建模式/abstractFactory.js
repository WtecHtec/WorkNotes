/**
 * 抽象工厂
 * 通过抽象工厂接口，创建不同产品的实例类
 */

/**
 * 抽象产品类
 */
class Car {
  constructor(name) {
    this.name = name
  }
  getName() {
    console.log('name==:',  this.name)
  }
}

class LowCar extends Car {
  constructor(name) {
    super(name)
  }
}

class IntermediateCar extends Car {
  constructor(name) {
    super(name)
  }
}



class HighCar extends Car {
  constructor(name) {
    super(name)
  }
}

/**
 * 抽象工厂类
 */
class AbstractFactory {
  createLow() {}
  createIntermediate() {}
  createHigh() {}
}


/**
 * 工厂类
 */
class CarFactory extends AbstractFactory {
  createLow() {
    return new LowCar('低级')
  }
  createIntermediate() {
    return new IntermediateCar('中级')
  }
  createHigh() {
    return new HighCar('高级')
  }
}

const carFactory = new CarFactory()
carFactory.createLow().getName()
carFactory.createIntermediate().getName()
carFactory.createHigh().getName()