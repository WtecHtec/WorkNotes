function initFabricCanvas() {
	if (g_fabric_canvas) return;
	//初始化画板
	$('#wtc_canvas').show();
	g_fabric_canvas = new fabric.Canvas('wtc_canvas', {
		isDrawingMode: false,
		skipTargetFind: true,
		selectable: false,
		selection: false,
		hasControls: false,
		containerClass: 'wtc-tools_content',
	});
	g_fabric_canvas.freeDrawingBrush.color = '#E34F51'; //设置自由绘颜色
	g_fabric_canvas.freeDrawingBrush.width = 2;
	handleMouseDown(g_fabric_canvas);
	handleMouseUp(g_fabric_canvas, drawing)
	handleMouseMove(g_fabric_canvas, drawing)
	handleSelectionCreated(g_fabric_canvas)
	handleSelectUpdate(g_fabric_canvas);
	handleSelectCleared(g_fabric_canvas);
	setTimeout(() => {
		$('.wtc-tools_content').attr({
			tabIndex: -1
		});
		handleRmoveByCode()
	}, 0)
}
function checkXY(mouseFrom, mouseTo) {
	if (mouseFrom && mouseTo) {
		return mouseFrom.x === mouseTo.x && mouseFrom.y === mouseTo.y;
	}
	return true;
}

function drawing(canvas) {
	if (g_fc_drawingObject) {
		canvas.remove(g_fc_drawingObject);
	}
	let canvasObject = null;
	if (DRAW_DATA[g_fc_drawType] && Object.keys(g_fc_mouseFrom).length && !checkXY(g_fc_mouseFrom, g_fc_mouseTo)) {
		canvasObject = DRAW_DATA[g_fc_drawType](g_fabric_canvas, g_fc_mouseFrom, g_fc_mouseTo, g_fc_color, g_fc_drawWidth)
	}
	if (canvasObject) {
		canvas.add(canvasObject);
		// 新建一个数据对象
		g_form_data_map[g_dom_id] = {
			domId: String(g_dom_id),
			parentId: '',
			style: '',
			className: '',
			rankNum: 0,
			afterContent: '',
			viewContent: '',
		}
		if (['arrow', 'rect'].indexOf(g_fc_drawType) !== -1) {
			g_fc_drawingObject = canvasObject;
		}
	}
}

function handleRmoveByCode() {
	$('.wtc-tools_content').bind('keyup', (event) => {
		if (event.keyCode == 8 && g_fc_currentSelectObject) {
			removeObject(g_fabric_canvas, g_fc_currentSelectObject);
			g_fc_currentSelectObject = null;
		}
	})
	// $('.screen-viewer__wrapper').unbind('keyup')
	// $('.screen-viewer').unbind('keydown')
	// $('.screen-viewer').bind('keyup', (e)=> {
	//   window.event? window.event.cancelBubble = true : e.stopPropagation();
	// })
	// $('.screen-viewer').css('display', 'none');
	// $(window).unbind('keyup')
	// window.removeEventListener('keydown');
	// function onDocumentKeydown() {};
	// document.removeEventListener('keydown', onDocumentKeydown);
}

function removeObject(canvas, e) {
	if (e.target._objects) {
		if (e.target.type === 'group') {
			e.target._restoreObjectsState();
		}
		//多选删除
		let etCount = e.target._objects.length;
		requestAnimationFrame(() => {
			for (let etindex = 0; etindex < etCount; etindex++) {
				delete g_form_data_map[e.target._objects[etindex].domId];
				canvas.remove(e.target._objects[etindex]);
			}
			canvas.remove(e.target);
		})
	} else {
		//单选删除
		delete g_form_data_map[e.target.domId];
		requestAnimationFrame(() => {
			canvas.remove(e.target);
		})
	}
	canvas.discardActiveObject().renderAll(); //清楚选中框
}