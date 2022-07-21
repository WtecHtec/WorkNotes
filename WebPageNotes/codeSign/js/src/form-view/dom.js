function initFormDom() {
	const parentDiv = createDiv('form-content', 'wtc_form_content');
	const formDom = $(FORM_TEMP.toString());
	parentDiv.append(formDom);
	const freameDiv = createFragment();
	const diaglogDom = $(CODE_TEMP.toString());
	freameDiv.append(parentDiv);
	freameDiv.append(diaglogDom);
	$('body').append(freameDiv);
  setTimeout(()=> {
    g_form_style_editor || (g_form_style_editor = CodeMirror.fromTextArea(document.getElementById("wtc_style_content"), {
      extraKeys: {"Ctrl": "autocomplete"}
    }));
    g_form_after_editor || (g_form_after_editor = CodeMirror.fromTextArea(document.getElementById("wtc_after_content"), {
      extraKeys: {"Ctrl": "autocomplete"}
    }));
  }, 0);
}