/**
 * 适配模式
 * 当一个对象或类的接口不能匹配用户所期待的接口时，适配器就充当中间转换的角色，以达到兼容用户接口的目的，同时适配器也实现了客户端与接口的解耦，提高了组件的可复用性。
 * 例子：电视机 两孔插座适配三孔插座，需要一个转接头
 */

// 两孔插座抽象类
class DualPin  {
  electrify(l, n) {
    console.log('两孔====', l, n)
  }
}

class TriplePin  {
  electrify(l, n, e) {
    console.log('三孔====', l, n, e)
  }
}

class TV extends DualPin {
  electrify(l, n) {
    console.log('两孔====', l, n)
    console.log('开机')
  }
}

class Adapter extends TriplePin {
  constructor(inDualPin) {
    super()
    this.dualPin = inDualPin
  }
  electrify(l, n, e) {
    console.log('三孔====', l, n, e)
    this.dualPin.electrify(l, n)
  }
}

const tv = new TV()
const adapter = new  Adapter(tv)
adapter.electrify(0,1,2)