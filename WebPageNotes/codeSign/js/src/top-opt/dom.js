
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
		'id': 'hz-note_canvas',
		'width': bodyEl.width() + 'px',
		'height': bodyEl.height() + 'px',
	})
	return canvasEl;
}

function renderOptDom() {
	const parentDom = createDiv('wtechtec-opt', 'wtechtec_opt');
	parentDom.append('<div>制作</div>')
	const loadingEl = createLoadingEl();
	const fargment = createFragment();
	fargment.append(parentDom);
	fargment.append(loadingEl);
	fargment.append(createCanvas());
	$('body').append(fargment);
}