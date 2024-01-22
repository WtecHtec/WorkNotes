
/**
 * 单例模式
 * 一个类仅有一个实例
 * 全局只有一个实例类 
 */
class Sun {
  // #instance
  constructor() {
    console.log('constructor', this.instance)
  }

  static getInstance() {
    console.log('getInstance')
    if (!this.instance) this.instance = new Sun()
    return this.instance
  }

  run() {
    console.log('run')
  }
}

// const sun = new Sun()
Sun.getInstance()
const instance = Sun.getInstance()

console.log(instance)