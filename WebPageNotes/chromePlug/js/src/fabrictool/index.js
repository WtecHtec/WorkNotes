
function initFabricCanvas(){
  //初始化画板
  g_fabric_canvas = new fabric.Canvas('hz-note_canvas', {
    isDrawingMode: true,
    skipTargetFind: true,
    selectable: false,
    selection: false,
    hasControls: false,
    containerClass: 'hz-tools_content',
  });
  initSetting(g_fabric_canvas)
  handleMouseDown(g_fabric_canvas);
  handleMouseUp(g_fabric_canvas, drawing)
  handleMouseMove(g_fabric_canvas, drawing)
  handleSelectionCreated(g_fabric_canvas)
  cacheData = null
  try {
    let pageUrl = window.location.href
    if (g_login) {

    } else {
      cacheData = window.localStorage.getItem(pageUrl)
    }
  } catch(e){}
  if (cacheData) {
    g_fabric_canvas.loadFromJSON(JSON.parse(cacheData) , ()=> {
      requestAnimationFrame(()=> {
        createSerialByInitCache(g_fabric_canvas)
      })
    })
  }
}


function drawing(canvas) {
  console.log(g_fc_drawType)
  if (g_fc_drawingObject ) {
    canvas.remove(g_fc_drawingObject);
  }
  let canvasObject = null;
  if (DRAW_DATA[g_fc_drawType]) {
    canvasObject = DRAW_DATA[g_fc_drawType](g_fabric_canvas, g_fc_mouseFrom, g_fc_mouseTo, g_fc_color, g_fc_drawWidth)
  }
  if (canvasObject) {
    canvas.add(canvasObject); //.setActiveObject(canvasObject)
    if( ['arrow'].indexOf(g_fc_drawType) !== -1) {
      g_fc_drawingObject = canvasObject;
    }
  }
}