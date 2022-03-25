const DRAW_DATA = {
  arrow: creatArrow,
  text: creatText,
  serial: drawSerial,
}
function creatText(canvas, mouseFrom, mouseTo, color, drawWidth) {
  if (g_fc_textbox) return null
  g_fc_textbox = new fabric.Textbox("", {
    left: mouseFrom.x - 60,
    top: mouseFrom.y - 20,
    width: 150,
    fontSize: 24,
    borderColor: "#FF0000",
    fill: color,
    hasControls: false,
    editingBorderColor: "#FF0000"
  });
  canvas.add(g_fc_textbox);
  g_fc_textbox.enterEditing();
  g_fc_textbox.hiddenTextarea.focus();
  return null
}