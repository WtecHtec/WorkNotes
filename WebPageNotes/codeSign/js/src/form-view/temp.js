const FORM_TEMP = '<div class="basic-grey">'
	+ '<form action="" method="/" class="STYLE-NAME">'
	+ '<h1>属性值'
	+ '<span></span>'
	+ ' </h1>'
	+ '<label>'
	+ '<span>dom_id :</span>'
	+ '<input id="wtc_dom_id" readonly type="text" placeholder="dom_id" />'
	+ '</label>'
	+ '<label>'
	+ '<span title="填写父级ID,层级关系">parent_id :</span>'
	+ '<input id="wtc_parent_id" type="text" placeholder="父级id" />'
	+ '</label>'
	+ '<label>'
	+ '<span title="显示内容">内容 :</span>'
	+ '<textarea id="wtc_view_content"  placeholder="节点显示内容" />'
	+ '</label>'
	+ '<label>'
	+ '<label>'
	+ '<span title="模块排列顺序">sort :</span>'
	+ '<input id="wtc_rank_num" type="text" placeholder="排列顺序" />'
	+ '</label>'
	+ '<label>'
	+ '<span title="类名">class_name :</span>'
	+ '<input id="wtc_class_name" type="text" placeholder="类名" />'
	+ '</label>'
	+ '<label style="margin-bottom: 24px;">'
	+ '<span title="样式(分号;隔开)">style :</span>'
	+ '<textarea id="wtc_style_content" placeholder="示例： display:none;"></textarea>'
	+ '</label>'
	+ '<label >'
	+ '<span title="伪类after 样式(分号;隔开)(类名class_name必填)">伪类after :</span>'
	+ '<textarea id="wtc_after_content" placeholder="示例： display:none;"></textarea>'
	+ '</label>'
	+ '<label>'
	+ '<span title="函数使用及说明">函数使用说明'
	+ '</span>'
	+ '<div style="margin-bottom: 12px;word-break: break-all;">'
	+ '@retina_one_px_border: direction = (all\top\bottom\right\left),color =(颜色值) (//1px 边框);'
	+ '@ellipsis_lines: lines = (数值); (// 超出多少行显示...)'
	+ ' </div>'
	+ '</label>'
	+ '<label style="display: none;">'
	+ '<span>Subject :</span>'
	+ '<select name="selection">'
	+ '<option value="Job Inquiry">Job Inquiry</option>'
	+ '<option value="General Question">General Question</option>'
	+ '</select>'
	+ '</label>'
	+ '<label>'
	+ '<span>&nbsp;</span>'
	+ '<input id="wtc_save_form_btn" type="button" class="button" value="保存" />'
	+ '</label>'
	+ '</form>'
	+ '</div>';

const CODE_TEMP = '<div class="wtc_diaglog"> '
	+ '<div class="btn_close" id="wtc_close_btn" >关闭</div>'
	+ ' <div> '
	+ '<div class="desc">wxml:</div>'
	+ ' <pre><code id="html_code" class="language-html"></code></pre>'
	+ '</div>'
	+ ' <div> '
	+ '<div class="desc">wxss:</div>'
	+ ' <pre><code id="css_code" class="language-css"></code></pre>'
	+ '</div>'
	+ '</div>';

