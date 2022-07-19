function initFormData() {
  if (!g_fc_currentSelectObject) return;
  const domId = g_fc_currentSelectObject.target.domId;
  let formData = g_form_data_map[domId];
  if (formData) {
    $('#wtc_dom_id').val(formData.domId);
    $('#wtc_parent_id').val(formData.parentId);
    $('#wtc_class_name').val(formData.className);
    $('#wtc_style_content').val(formData.style);
    $('#wtc_rank_num').val(formData.rankNum);
  }
}
function initFormEvent() {
  $('#wtc_save_form_btn').on('click', () => {
    const domId =  $('#wtc_dom_id').val();
    const formData = g_form_data_map[domId];
    if (formData) {
      formData.parentId = $('#wtc_parent_id').val();
      formData.style = $('#wtc_style_content').val();
      formData.className = $('#wtc_class_name').val();
      formData.rankNum = $('#wtc_rank_num').val();
    }
  })
}