/**
 * 代理模式
 * 从某种意义上讲，这是代理模式区别于装饰器模式的一种体现。虽然二者的理念与实现有点类似，
 * 但装饰器模式往往更加关注为其他对象增加功能，让客户端更加灵活地进行组件搭配；
 * 而代理模式更强调的则是一种对访问的管控，甚至是将被代理对象完全封装而隐藏起来，使其对客户端完全透明。
 * 
 * 例子：拨号上网
 */

// 上网接口
class Internet  {
  httpAccess(url) { console.log(url)}
}

// 拨号
class Modem extends Internet {
  constructor() {
    super()
    console.log('拨号上网')
  }
  httpAccess(url) {
    console.log(`访问：${url}`)
  }
} 

// 代理
class RouterProxy  extends Internet {
  constructor() {
    super()
    this.modem = new  Modem()
    this.blackList = ['php']
  }
  httpAccess(url) {
    if (this.blackList.includes(url)) {
      console.log(`禁止访问：${url}`)
      return
    }
    this.modem.httpAccess(url)
  }
}

const routerProxy = new RouterProxy()

routerProxy.httpAccess('php')
routerProxy.httpAccess('juejin')
