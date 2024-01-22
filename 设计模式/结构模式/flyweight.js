/**
 * 享元模式
 * 缓存多个实例，使用时直接从缓存中获取
 * 例如：游戏渲染图片，
 */

class Drawable {
	draw(x, y) { console.log(`位置${x},${y} 渲染图片`) }
}

class Grass extends Drawable {
	constructor() {
		super()
		this.image = '草地'
	}
	draw(x, y) { console.log(`位置${x},${y} 渲染${this.image}`) }
}

class Stone extends Drawable {
	constructor() {
		super()
		this.image = '道路'
	}
	draw(x, y) { console.log(`位置${x},${y} 渲染${this.image}`) }
}

class House extends Drawable {
	constructor() {
		super()
		this.image = '房屋'
	}
	draw(x, y) { console.log(`位置${x},${y} 渲染${this.image}`) }
}

class TileFactory {
	constructor() {
		this.cache = {}
	}
	getDrawable(name) {
		if (!this.cache[name]) {
			switch (name) {
				case '草地':
					this.cache[name] = new Grass()
					break
				case '道路':
					this.cache[name] = new Stone()
					break
				case '房屋':
					this.cache[name] = new House()
					break
				default:
					break
			}
		}
		return this.cache[name]
	}
}

const tileFactory = new TileFactory()
tileFactory.getDrawable('草地').draw(10, 20)