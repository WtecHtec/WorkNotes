/**
 * 策略模式
 * 强调的是行为的灵活切换, 通过添加策略行为实现灵活的实现方式
 * 例如： 计算
 */

// 接口
class Strategy {
	calculate(a, b) { console.log(a, b) }
}

class Add extends Strategy {
	constructor() { super() }
	calculate(a, b) { console.log(a + b); return a + b }
}

class Mod extends Strategy {
	constructor() { super() }
	calculate(a, b) { console.log(a % b); return a % b }
}

class Calculator {

	constructor() {
		this.strategy = null
	}

	setStrategy(strategy) {
		this.strategy = strategy
	}

	getRuleData(a, b) {
		this.strategy.calculate(a, b)
	}

}


const calculator = new Calculator()

calculator.setStrategy(new Add())
calculator.getRuleData(45, 12)

calculator.setStrategy(new Mod())
calculator.getRuleData(4, 2)


