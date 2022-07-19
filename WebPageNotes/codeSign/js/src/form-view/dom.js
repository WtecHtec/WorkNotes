function initFormDom() {
  const parentDiv = createDiv('form-content', 'wtc_form_content');
  const formDom = $(FORM_TEMP.toString());
  parentDiv.append(formDom);
  $('body').append(parentDiv);
}