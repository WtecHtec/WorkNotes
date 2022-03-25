const OPT_TYPE = {
  close: handleClose,
  save: handleSave,
  remove: handleRemove,
  pen: handlePen,
  select: handleSelect,
}
function handleOpt(type) {
  g_select_status = false
  g_fc_drawType = type
  if (g_unactives.indexOf(type) === -1) {
    g_fabric_canvas.isDrawingMode = false;
  }
  if (['pen', 'remove'].indexOf(type) === -1) {
    g_fabric_canvas.skipTargetFind = true; //画板元素不能被选中
    g_fabric_canvas.selection = false; //画板不显示选中
  }
  if (OPT_TYPE[type])  {
    OPT_TYPE[type](g_fabric_canvas);
  }
}

function handleClose() {
  g_loadingel.show()
  g_noteStatus = false
  setTimeout(()=> {
    $('body').removeClass('hz-tool_canvas')
    $('.hz-tools_content').hide()
    $('.herz-m-from').hide()
    g_loadingel.hide()
  }, 500)
}

function handleSave() {
  if (g_fabric_canvas && g_noteStatus) {
    let elJson = g_fabric_canvas.toJSON(['drawType'])
    // console.log('====', JSON.stringify(elJson))
    try {
      let pathUrl = window.location.href
      if (g_login) {

      } else {
        window.localStorage.setItem(pathUrl, JSON.stringify(elJson))
      }
    } catch(e){
      console.log('77777777', e)
    }
  }
}
function handleRemove(canvas) {
  canvas.discardActiveObject()
  canvas.selection = true;
  canvas.skipTargetFind = false;
  canvas.selectable = true;
}
function handlePen(canvas) {
  canvas.isDrawingMode = true;
}
function handleSelect(canvas) {
  g_select_status = true
  canvas.selection = true;
  canvas.skipTargetFind = false;
  canvas.selectable = true;
}