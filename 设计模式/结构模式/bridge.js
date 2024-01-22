/**
 * 桥接模式
 * 抽象与实现分离，使二者可以各自单独变化而不受对方约束，使用时再将它们组合起来，就像架设桥梁一样连接它们的功能
 * 例如：使用尺子绘制不同颜色的形状
 */

// 尺子接口
class Ruler  {
  regularize() { }
}

class SquareRuler  extends Ruler {
  constructor() { super() }
  regularize() { 
    console.log('正方形')
  }
}

class TriangleRuler extends Ruler {
  constructor() { super() }
  regularize() { 
    console.log('三角形')
  }
}

class Pen {
  constructor(inRule) {
    this.rule = inRule
  }
  draw() {}
}


class WhitePen extends Pen {
  constructor(inRule) {
    super(inRule)
  }
  draw() {
    console.log('白色', )
    this.rule.regularize()
  }
}


class BlackPen extends Pen {
  constructor(inRule) {
    super(inRule)
  }
  draw() {
    console.log('黑色')
    this.rule.regularize()
  }
}


new WhitePen(new TriangleRuler()).draw()
