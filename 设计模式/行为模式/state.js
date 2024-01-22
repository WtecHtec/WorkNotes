/**
 * 状态模式
 * 减少if else 判断
 * 例子： 红绿灯切换
 */

class State {
  //切换为绿灯（通行）状态
  switchToGreen(trafficLight){};
  //切换为黄灯（警示）状态
  switchToYellow(trafficLight){};
  //切换为红灯（禁行）状态 
  switchToRed(trafficLight) { }
}

class Red extends State {
  constructor() {
    super()
  }
  //切换为绿灯（通行）状态
  switchToGreen(trafficLight){
    console.log('red 不能 green')
  };
  //切换为黄灯（警示）状态
  switchToYellow(trafficLight){
    trafficLight.setState(new Yellow())
    console.log('60 秒；切换yellow')
  };
  //切换为红灯（禁行）状态 
  switchToRed(trafficLight) { 
    console.log('当前： red')
  }
}
class Yellow extends State {
  constructor() {
    super()
  }
  //切换为绿灯（通行）状态
  switchToGreen(trafficLight){
    trafficLight.setState(new Green())
    console.log('yellow 5 秒；切换 green' )
  };
  //切换为黄灯（警示）状态
  switchToYellow(trafficLight){
    // trafficLight.setState(new  Yellow())
    // console.log('yellow 5 秒；切换')
    console.log('当前： yellow')
  };
  //切换为红灯（禁行）状态 
  switchToRed(trafficLight) { 
    console.log('yellow 5 秒；切换 red')
    trafficLight.setState(new Red())
  }
}

class Green extends State {
  constructor() {
    super()
  }
  //切换为绿灯（通行）状态
  switchToGreen(trafficLight){
    console.log('当前： green')
   
  };
  //切换为黄灯（警示）状态
  switchToYellow(trafficLight){
    trafficLight.setState(new Yellow())
    console.log('60 秒；切换yellow')
  };
  //切换为红灯（禁行）状态 
  switchToRed(trafficLight) { 
    console.log(' green不能 red')
  }
}
// 红 <-> 黄 <-> 绿 
class TrafficLight {
  constructor() {
    this.state = new Red()
  }
  setState(state) {
    this.state = state
  }
  switchToGreen() { 
    this.state.switchToGreen(this)
  }
  switchToYellow() {
    this.state.switchToYellow(this)
  }
  switchToRed() {
    this.state.switchToRed(this)
  }

}

const trafficLight = new TrafficLight()
trafficLight.switchToYellow()
trafficLight.switchToRed()
trafficLight.switchToRed()
// class TrafficLight {
//   constructor() {
//     this.state = 'green'
//   }

//   switchToGreen() {
//     if (this.state === 'green') {
//       console.log(' 当前 green')
//     } else if (this.state === 'red') {
//       console.log('red 不能 green')
//     } else {
//       console.log('yellow 5 秒；切换')
//     }
//   }

//   switchToYellow() {
//     if (this.state === 'yellow') {
//       console.log(' 当前 yellow')
//     } else {
//       console.log(`${this.state} 60 秒；切换`)
//     }
//   }

//   switchToRed() {
//     if (this.state === 'green') {
//       console.log(' green 不能 red ')
//     } else if (this.state === 'red') {
//       console.log(' 当前 red')
//     } else {
//       console.log('yellow 5 秒；切换')
//     }
//   }

// }