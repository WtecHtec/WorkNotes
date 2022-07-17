// 绘制矩形
function drawRect(canvas, mouseFrom, mouseTo, color, drawWidth) {
	// 计算矩形长宽
	let width = mouseFrom.x - mouseTo.x;
	let height = mouseFrom.y - mouseTo.y;
	// 创建矩形 对象
	let canvasObject = new fabric.Rect({
		left: mouseFrom.x,
		top: mouseFrom.y,
		width: Math.abs(width),
		height: Math.abs(height),
		stroke: color,
		fill: color,
		strokeWidth: drawWidth,
	});
	return canvasObject;
}
