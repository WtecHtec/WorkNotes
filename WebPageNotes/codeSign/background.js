console.log(chrome)
chrome.action.onClicked.addListener(function(tab) {
  sendMessageToContentScript({cmd:'wtc_cmd', value: 'yeah'}, function(response){
	  console.log('来自content的回复：'+response);
  });
});

function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}
