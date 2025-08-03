function drawSerial(canvas, mouseFrom, mouseTo, color, drawWidth, other = {}) {
  //绘制圆形
  const circle = new fabric.Rect({
    width: 18,
    height: 18,
    originX: 'center',//调整中心点的X轴坐标
    originY: 'center',//调整中心点的Y轴坐标
    fill:'#1296db',
  });
  let textNum = 1
  if (!other.num) {
    g_fc_serial_num = g_fc_serial_num + 1
    textNum = g_fc_serial_num
  } else {
    textNum = other.num
  }
  //绘制文本
  const text = new fabric.Text(textNum + '' , {
      fontSize: 8,
      fill: '#fff',
      originX: 'center',
      originY: 'center'
  })
  const textbox = new fabric.Textbox( other.boxDesc ? other.boxDesc : "选择并双击输入内容", {
    left: 14,
    top: -5,
    fontSize: 18,
    borderColor: other.borderColor ? other.borderColor : "#FF0000",
    fill: other.fill ? other.fill : "#FF0000",
    editingBorderColor: other.editingBorderColor ? other.editingBorderColor : "#FF0000"
  });

 
  //进行组合
  const group = new fabric.Group([circle, text, textbox], {
    left: mouseFrom.x,
    top: mouseFrom.y,
    hasControls: false,
    drawType: 'serial',
  })
  // group.set('drawType', 'serial')
  group.on("mousedblclick", function(event){
    const tb = event.target.item(2)
    // const mCanvas = canvas.viewportTransform;
    // let mObject = tb.calcTransformMatrix();
    // let mTotal = fabric.util.multiplyTransformMatrices(mCanvas, mObject);
    // let trans = fabric.util.qrDecompose(mTotal);
    // console.log(trans)
    // 创建临时编辑文本对象
    let tempText = new fabric.Textbox(tb.text, {
      //... 旧文本对象需要克隆到临时的文本对象上，为了保证模拟出来的编辑框内容视觉统一。
      left: tb.group.get('left') + 25,
      top: tb.group.get('top') + 2,
      fontSize: 18,
      borderColor: tb.get('borderColor'),
      fill: tb.get('fill'),
      editingBorderColor: tb.get('editingBorderColor'),
    });

    //...

    tempText.on("editing:exited", () => {
      // 退出编辑态处理，
      // 将 text value 赋值给原始文本对象 this.item(1)
      // 将临时文本对象干掉
      tb.group.addWithUpdate(tempText)
      tb.group.remove(tb)
      canvas.remove(tempText);
      requestAnimationFrame(()=> {
        g_fc_textbox = null
      })
    });
    // textbox.enterEditing();
    // textbox.hiddenTextarea.focus();
    tb.set({
      visible: false,
    });
    // 将临时文本对象加入画布，并激活，选中进入编辑态
    canvas.add(tempText);
    canvas.setActiveObject(tempText);
    tempText.selectAll();
    tempText.enterEditing();
    requestAnimationFrame(()=> {
      g_fc_textbox = tempText
    })
  });
  return group;
}
function setSerialSortNum(canvas) {
  const elDatas = canvas.getObjects()
  let serialEls = elDatas.filter(item=> {
    return item.get('drawType') === 'serial'
  })
  g_fc_serial_num = serialEls.length
  serialEls = serialEls.sort((a, b)=> {
    return Number(a.item(1).get('text')) -  Number(b.item(1).get('text')) 
  })
  serialEls.forEach((el, index)=> {
    let text = el.item(1)
    text.set('text', (index + 1)  + '')
  })
  requestAnimationFrame(()=> {
    canvas.renderAll();
  })
}
function createSerialByInitCache(canvas) {
  const elDatas = canvas.getObjects()
  let serialEls = elDatas.filter(item=> {
    return item.get('drawType') === 'serial'
  })
  g_fc_serial_num = serialEls.length
  let gobj = null
  serialEls.forEach((el)=> {
    const text = el.item(1)
    const tb =  el.item(2)
    gobj = drawSerial(canvas, { x: el.left, y: el.top}, null, null, null,
      {
        num: text.get('text'),
        boxDesc: tb.get('text'),
        borderColor: tb.get('borderColor'),
        fill: tb.get('fill'),
        editingBorderColor: tb.get('editingBorderColor'),
      })
    canvas.remove(el)
    canvas.add(gobj)
  })
}