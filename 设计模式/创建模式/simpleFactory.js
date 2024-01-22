/**
 * 简单工厂
 * 根据类型创建不同的实例
 * 可以创建一个工厂创建接口，继承这个接口，代表一个工厂类
 */

/** 抽象类 */
class Enemy {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	show() {
		console.log(' Enemy show')
	}
}

class Tank extends Enemy {
	constructor(x, y) {
		super(x, y)
	}
	show() {
		console.log(' Tank show')
	}
}


class Airplane extends Enemy {
	constructor(x, y) {
		super(x, y)
	}
	show() {
		console.log(' Airplane show')
	}
}

/** 
 * 简单工厂类
 */
class SimpleFactory {
	constructor() {

	}
	create(type) {
		switch (type) {
			case 'tank':
				return new Tank()
				break
			case 'airplane':
				return new Airplane()
				break
			default:
				console.log('empty')
		}
	}
}

const simpleFactory = new SimpleFactory()
simpleFactory.create('tank').show()
simpleFactory.create('airplane').show()


/**
 * 工厂接口
 */
class FactoryInteface {
	create(type) { }
}

/**
 * tank 工厂类
 */
class TankFactory extends FactoryInteface {
	create(type) {
		switch (type) {
			case 'tank':
				return new Tank()
				break
			default:
				console.log('empty')
		}
	}
}



const tankFactory = new TankFactory()
tankFactory.create('tank').show()