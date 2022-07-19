// 绘制矩形
function drawRect(canvas, mouseFrom, mouseTo, color, drawWidth) {
	// 计算矩形长宽
	let width = mouseFrom.x - mouseTo.x;
	let height = mouseFrom.y - mouseTo.y;
	let left = mouseFrom.x;
	let top = mouseFrom.y;
	if (width > 0) {
		left = mouseTo.x;
	}
	if (height > 0) {
		top = mouseTo.y;
	}
	// 创建矩形 对象
	let canvasObject = new fabric.Rect({
		left,
		top,
		width: Math.abs(width),
		height: Math.abs(height),
		stroke: color,
		fill: color,
		strokeWidth: drawWidth,
    domId: String(g_dom_id),
	});
	return canvasObject;
}
