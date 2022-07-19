
function createLoadingEl() {
	const loadingEl = createDiv('loading');
	for (let i = 0; i < 5; i++) {
		loadingEl.append($('<span></span>'))
	}
	const loadingContent = createDiv('hz-loading_content', 'hz_loading')
	loadingContent.append(loadingEl)
	return loadingContent;
}

function createCanvas() {
	const canvasEl = $('<canvas></canvas>')
	const bodyEl = $('html')
	canvasEl.attr({
		id: 'wtc_canvas',
		width: bodyEl.width() + 'px',
		height: bodyEl.height() + 'px',
    tabIndex: -1
	})
  canvasEl.css({
    display: 'none',
  });
	return canvasEl;
}

function renderOptDom() {
	const parentDom = createDiv('wtechtec-opt', 'wtechtec_opt');
  OPT_DATAS.forEach(item => {
    const itemDiv = createDiv(item.className, item.id)
    itemDiv.text(item.label);
    parentDom.append(itemDiv);
  })
	const loadingEl = createLoadingEl();
	const fargment = createFragment();
  const canvasDiv = createCanvas();
	fargment.append(parentDom);
	fargment.append(loadingEl);
	fargment.append(canvasDiv);
	$('body').append(fargment);
}