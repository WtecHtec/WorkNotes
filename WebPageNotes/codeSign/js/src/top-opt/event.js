function initOptEvent() {
	$('#wtechtec_opt').on("click", (e) => {
		const targetDom = $(e.target);
		const id = targetDom.attr('id');
		if (id === 'wtc_save') {

			return;
		}
		$('.wtechtec-opt-item.active').removeClass('active');
		$('#hz_loading').show();
		if (id === 'wtc_make') {
			g_fc_drawType = 'rect';
			g_fc_doDrawing = true
			if (g_fabric_canvas) {
				g_fc_mouseFrom = {};
				g_making = !g_making;
				targetDom.text(g_making ? '暂停制作' : '开始制作');
				g_making ? $('.wtc-tools_content').show() : $('.wtc-tools_content').hide();
				g_fabric_canvas.selection = false;
				g_fabric_canvas.skipTargetFind = true;
				g_fabric_canvas.selectable = false;
				console.log(g_fabric_canvas)
				g_fabric_canvas.discardActiveObject().renderAll(); //清楚选中框
			} else {
				g_making = true;
				targetDom.text('暂停制作');
				initFabricCanvas();
			}
		} else if (id === 'wtc_select') {
			g_select_status = true;
			g_making = false;
			g_fc_drawType = null;
			$('#wtc_make').text('开始制作');
			g_fabric_canvas.selection = true;
			g_fabric_canvas.skipTargetFind = false;
			g_fabric_canvas.selectable = true;
		}
		requestAnimationFrame(() => {
			targetDom.addClass('active');
			$('#hz_loading').hide();
		})
	});
}