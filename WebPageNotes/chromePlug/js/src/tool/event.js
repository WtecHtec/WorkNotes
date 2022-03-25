function initEvent() {
  $('#note-btn').on('click',  (event)=>{
    if(event && event.target) {
      const targetEl = $(event.target)
      const typeVal = targetEl.data('type')
      if (!typeVal || typeVal === 'other') {
        return
      } else {
        if (g_fabric_canvas && g_noteStatus) {
          if (g_unactives.indexOf(typeVal) === -1) {
            $('.hz-opt-img').removeClass('ht-active')
            $(`.hz-${typeVal}`).addClass('ht-active')
          }
          if (g_fc_textbox) {
            g_fc_textbox.exitEditing();
            g_fc_textbox = null;
          }
          handleOpt(typeVal)
        }
      }
    }
  })

  $('#hz-brush-color').on('change', function(){
    const color = $(this).val()
    setBrushColor( g_fabric_canvas, color)
    if (g_fc_textbox) {
      g_fc_textbox.setOptions({fill: color, editingBorderColor: color,borderColor: color,})
    }
  })

}