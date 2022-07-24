function initFormData() {
	if (!g_fc_currentSelectObject) return;
	const domId = g_fc_currentSelectObject.target.domId;
	let formData = g_form_data_map[domId];
	if (formData) {
		$('#wtc_dom_id').val(formData.domId);
		$('#wtc_parent_id').val(formData.parentId);
		$('#wtc_class_name').val(formData.className);
		// $('#wtc_style_content').val(formData.style);
		$('#wtc_rank_num').val(formData.rankNum);
		// $('#wtc_after_content').val(formData.afterContent);
		g_form_style_editor && g_form_style_editor.setValue(formData.style);
		g_form_after_editor && g_form_after_editor.setValue(formData.afterContent);
		$('#wtc_view_content').val(formData.viewContent);
	}
}
function initFormEvent() {
	$('#wtc_save_form_btn').on('click', () => {
		$('#hz_loading').show();
		const domId = $('#wtc_dom_id').val();
		const formData = g_form_data_map[domId];
		if (formData) {
			formData.parentId = $('#wtc_parent_id').val();
			formData.className = $('#wtc_class_name').val();
			formData.rankNum = $('#wtc_rank_num').val();
			// formData.style = $('#wtc_style_content').val();
			// formData.afterContent = $('#wtc_after_content').val();
			g_form_style_editor.save();
			g_form_after_editor.save();
			g_form_style_editor && (formData.style = g_form_style_editor.getValue());
			g_form_after_editor && (formData.afterContent = g_form_after_editor.getValue());
			// console.log(g_form_style_editor.getValue())
			// console.log(g_form_after_editor.getValue())
			formData.viewContent = $('#wtc_view_content').val();
		}
		setTimeout(() => {
			$('#hz_loading').hide();
		}, 200);
	})
	$('#wtc_close_btn').on('click', () => {
		$('.wtc_diaglog').hide();
	})
}