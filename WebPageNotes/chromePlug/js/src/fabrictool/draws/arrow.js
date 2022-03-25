//绘制箭头方法
function drawArrow(fromX, fromY, toX, toY, theta, headlen) {
  theta = typeof theta != "undefined" ? theta : 20;
  headlen = typeof theta != "undefined" ? headlen : 10;
  // 计算各角度和对应的P2,P3坐标
  var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
    angle1 = (angle + theta) * Math.PI / 180,
    angle2 = (angle - theta) * Math.PI / 180,
    topX = headlen * Math.cos(angle1),
    topY = headlen * Math.sin(angle1),
    botX = headlen * Math.cos(angle2),
    botY = headlen * Math.sin(angle2);
  var arrowX = fromX - topX,
    arrowY = fromY - topY;
  var path = " M " + fromX + " " + fromY;
  path += " L " + toX + " " + toY;
  arrowX = toX + topX;
  arrowY = toY + topY;
  path += " M " + arrowX + " " + arrowY;
  path += " L " + toX + " " + toY;
  arrowX = toX + botX;
  arrowY = toY + botY;
  path += " L " + arrowX + " " + arrowY;
  return path;
}

function creatArrow(canvas, mouseFrom, mouseTo, color, drawWidth) {
  return new fabric.Path(drawArrow(mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y, 12, 12), {
    stroke: color,
    fill: "rgba(255,255,255,0)",
    hasControls: false,
    strokeWidth: drawWidth
  });
}