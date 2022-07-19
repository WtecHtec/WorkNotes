function initFormDom() {
	const parentDiv = createDiv('form-content', 'wtc_form_content');
	const formDom = $(FORM_TEMP.toString());
	parentDiv.append(formDom);
	const freameDiv = createFragment();
	const diaglogDom = $(CODE_TEMP.toString());
	freameDiv.append(parentDiv);
	freameDiv.append(diaglogDom);
	$('body').append(freameDiv);
}