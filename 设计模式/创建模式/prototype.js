/**
 * 原型模式
 * 实例化一个对象耗时，相比之下复制一个原型对象比较快
 */

class EnemyPlane {
	constructor(x = 0) {
		this.x = x
	}
	fly() {
		console.log('flying')
	}
}

function deep(obj) {
	return Object.assign({}, obj)
}

class EnemyPlaneFactory {
	static getEnemyPlane() {
		// 单例模式
		if (!this.instance) this.instance = new EnemyPlane()
		// 原型链拷贝
		return this.instance
	}
}

console.log(EnemyPlaneFactory)
console.time()
for (let i = 0; i < 10; i++) {
	const ep = new EnemyPlane()
	// const ep = EnemyPlaneFactory.getEnemyPlane()
}
console.timeEnd()