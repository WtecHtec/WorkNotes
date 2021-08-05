const Draw = function (canvasID,canvas, width, height, pixelRatio, config = {}) {

  if (!(this instanceof Draw)) {
    return new Draw(canvas, config);
  }
  if (!canvas) {
    return;
  }

  console.log('canvas', canvas)

  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.width = width;
  this.height = height;
  const context = this.context;
  // 根据设备像素比优化canvas绘图
  const devicePixelRatio = pixelRatio;

  if (devicePixelRatio) {
    canvas.height = height * devicePixelRatio;
    canvas.width = width * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
  } else {
    canvas.width = width;
    canvas.height = height;
  }
  context.fillStyle = '#fff'
  context.fillRect(0, 0, this.width, this.height )

  
  context.lineWidth = 6;
  context.strokeStyle = 'black';


  const { _left: left = 0, _top: top = 0 } = canvas;
  const point = {};

  let pressed = false;

  const paint = (signal) => {
    switch (signal) {
      case 1:
        context.beginPath();
        context.moveTo(point.x, point.y);
      case 2:
        context.lineTo(point.x, point.y);
        context.stroke();
        break;
      default:
    }
  };

  const create = signal => (e) => {
    if (signal === 1) {
      pressed = true;
    }
    if (signal === 1 || pressed) {
      point.x = e.x - left;
      point.y = e.y - top;
      paint(signal);
    }
  };
  this.start = create(1);
  this.move = create(2);
  this.clear = ()=>{
    context.fillStyle = '#fff'
    context.fillRect(0, 0, this.width, this.height )
  }
  this.createBase64 = ()=>{
    return this.canvas.toDataURL('image/png', 1)

    
// wx.canvasToTempFilePath({
//   x: 0,
//   y: 0,
//   width: width,
//   height: height,
//   destWidth: width,
//   destHeight: height,
//   canvas: canvas,
//   success(res) {
//     console.log(res.tempFilePath)
//   }
// })

   
  }
}
export {
  Draw
}