/**
 * 建造模式
 * 一步一步创建完整的产品类实例
 * 例如： 创建一个汽车类，需要有 ’车身‘, ’喷漆‘
 */

/** 产品类 */
class Car {
  constructor() {}

  setColor() {
    console.log('喷漆')
  }

  setBody() {
    console.log('车身')
  }
}

/** 建造类 */
class Builder {
  createColor(){}
  createBody(){}
}

class ConcreteBuilder extends Builder {
  constructor(inCar) {
    super()
    this.car = inCar || new Car()
  }
  createColor(){
    this.car.setColor()
  }
  createBody(){
    this.car.setBody()
  }
}


const concrete = new  ConcreteBuilder()
concrete.createBody()
concrete.createColor()
