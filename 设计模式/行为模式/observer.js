/**
 * 观察者模式
 * 
 * 针对被观察对象与观察者对象之间一对多的依赖关系建立起一种行为自动触发机制，当被观察对象状态发生变化时主动对外发起广播，以通知所有观察者做出响应。
 * 
 */


class Shop {

  constructor() {
    this.product = "无商品";
    this.buyers = []
  }
  //商店出货
  getProduct() {
    return this.product;
  }
  //商店进货
  setProduct(product) {
    this.product = product;
    // 通知
    this.notifyBuyers()
  }


  // 注册买家到预订清单中
  register(buyer) {
    this.buyers.push(buyer);
  }

  // 通知所有注册买家
  notifyBuyers() {
    this.buyers.forEach(b => b.inform(this.getProduct()));
  }
}


class Buyer {

  constructor(name) {
    this.name = name;
  }

  inform(product) {
    // 买家购买商品
    console.log(this.name + "购买：", product);
  }

}


const shop = new Shop()

const buyer1 = new Buyer('burer1')
const buyer2 = new Buyer('burer2')
const buyer3 = new Buyer('burer3')

shop.register(buyer1)
shop.register(buyer2)

shop.setProduct('手机')