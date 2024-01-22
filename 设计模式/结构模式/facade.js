/**
 * 外观模式
 * 通过封装多个子系统,提供外部方法实现需求操作
 * 例如： 饭店，对于客户就是为了吃饭，饭店做饭，买菜等操作，客户是不关心的
 */

// 服务员
class Waiter  {
  order() {
    console.log('招待、下单')
  }

  serve() {
    console.log('上菜')
  }
}

// 厨师
class Chef {
  cook() {
    console.log('厨师下厨')
  }
}

// 清洁工
class Cleaner {
  clean() {
    console.log('清洁')
  }
}


class Facade {
  constructor() {
    this.waiter = new Waiter()
    this.chef = new Chef()
    this.cleaner = new  Cleaner()
  }

  order() {
    this.waiter.order()
    this.chef.cook()
    this.waiter.serve()
    this.cleaner.clean()
  }
}


const facade = new Facade()
facade.order()


