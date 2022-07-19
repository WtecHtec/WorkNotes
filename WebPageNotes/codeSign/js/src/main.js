initRenderOpt()
initForm()
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	// console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
	if(request.cmd == 'wtc_cmd') {
    $('.wtechtec-opt').css('display', 'flex');
  }
  sendResponse('yeah')
});
