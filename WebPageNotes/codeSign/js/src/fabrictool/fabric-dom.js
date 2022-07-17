function initFabricCanvas() {
	if (g_fabric_canvas) return;
	//初始化画板
	g_fabric_canvas = new fabric.Canvas('hz-note_canvas', {
		isDrawingMode: false,
		skipTargetFind: true,
		selectable: false,
		selection: false,
		hasControls: false,
		containerClass: 'hz-tools_content',
	});
	g_fabric_canvas.freeDrawingBrush.color = '#E34F51'; //设置自由绘颜色
	g_fabric_canvas.freeDrawingBrush.width = 2;
	handleMouseDown(g_fabric_canvas);
	handleMouseUp(g_fabric_canvas, drawing)
	handleMouseMove(g_fabric_canvas, drawing)
	handleSelectionCreated(g_fabric_canvas)
}

function drawing(canvas) {
	if (g_fc_drawingObject) {
		canvas.remove(g_fc_drawingObject);
	}
	let canvasObject = null;
	if (DRAW_DATA[g_fc_drawType]) {
		canvasObject = DRAW_DATA[g_fc_drawType](g_fabric_canvas, g_fc_mouseFrom, g_fc_mouseTo, g_fc_color, g_fc_drawWidth)
	}
	if (canvasObject) {
		canvas.add(canvasObject); //.setActiveObject(canvasObject)
		if (['arrow'].indexOf(g_fc_drawType) !== -1) {
			g_fc_drawingObject = canvasObject;
		}
	}
}