initRenderOpt()
initForm()
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
	if (request.cmd == 'wtc_cmd') {
		$('.wtechtec-opt').css('display', 'flex');
	}
	sendResponse('yeah')
});

// console.log(html_beautify('<view class="a"><view class="d"></view></view>', { indent_size: 2, space_in_empty_paren: true }));
// console.log(css_beautify('.blue { color: blue;} ', { indent_size: 2, space_in_empty_paren: true }))