
function initSetting(canvas){
  canvas.freeDrawingBrush.color = g_fc_color; //设置自由绘颜色
  canvas.freeDrawingBrush.width = g_fc_drawWidth;
}
function setBrushColor(canvas, color) {
  g_fc_color = color
  canvas.freeDrawingBrush.color = g_fc_color;
}