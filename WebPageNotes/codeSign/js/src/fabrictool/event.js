//坐标转换
function transformMouse(mouseX, mouseY) {
	return { x: mouseX / 1, y: mouseY / 1 };
}

function handleMouseDown(canvas) {
	canvas.on("mouse:down", function (options) {
		const xy = transformMouse(options.e.offsetX, options.e.offsetY);
		g_fc_mouseFrom.x = xy.x;
		g_fc_mouseFrom.y = xy.y;
		g_fc_doDrawing = true;
	});
}
function handleMouseUp(canvas, drawing) {
	canvas.on("mouse:up", function (options) {
		const xy = transformMouse(options.e.offsetX, options.e.offsetY);
		g_fc_mouseTo.x = xy.x;
		g_fc_mouseTo.y = xy.y;
		// drawing();
		g_fc_drawingObject = null;
		g_fc_moveCount = 1;
		if (typeof drawing === 'function' && g_fc_out_drawtypes.indexOf(g_fc_drawType) !== -1) {
			drawing(canvas);
		}
		requestAnimationFrame(() => {
			g_fc_doDrawing = false;
		})
	});
}
function handleMouseMove(canvas, drawing) {
	canvas.on("mouse:move", function (options) {
		if (g_fc_moveCount % 2 && !g_fc_doDrawing) {
			//减少绘制频率
			return;
		}
		g_fc_moveCount++;
		const xy = transformMouse(options.e.offsetX, options.e.offsetY);
		g_fc_mouseTo.x = xy.x;
		g_fc_mouseTo.y = xy.y;
		if (typeof drawing === 'function' && g_fc_out_drawtypes.indexOf(g_fc_drawType) === -1) {
			drawing(canvas);
		}
	});
}
function handleSelectionCreated(canvas) {
	canvas.on("selection:created", function (e) {
		if (g_select_status) return
		if (g_fc_drawType === 'remove') {
			if (e.target._objects) {
				if (e.target.type === 'group') {
					e.target._restoreObjectsState();
				}
				//多选删除
				let etCount = e.target._objects.length;
				requestAnimationFrame(() => {
					for (let etindex = 0; etindex < etCount; etindex++) {
						canvas.remove(e.target._objects[etindex]);
					}
					canvas.remove(e.target);
				})
			} else {
				//单选删除
				requestAnimationFrame(() => {
					canvas.remove(e.target);
				})
			}
			canvas.discardActiveObject(); //清楚选中框

			requestAnimationFrame(() => {
				console.log(canvas.getObjects())
				setSerialSortNum(canvas)
			})
		}
	});
}
