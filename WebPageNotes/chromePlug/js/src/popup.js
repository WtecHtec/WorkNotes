// const unactives = ['close', 'save']
function initPopup() {
  $('#note-btn').on('click',  (event) => {
    console.log('======', event)
    if(event && event.target) {
      const targetEl = $(event.target)
      const typeVal = targetEl.data('type')
      if (!typeVal || typeVal === 'other') {
        return
      }  else {
        sendMessageToContentScript({ cmd: 'create',type: typeVal }, function (response) {
          console.log('来自content的回复：' + response);
        });
      }
    }
  })
  $('#brush-color').on('change', function(event){
    const color = $(this).val()
    sendMessageToContentScript({ cmd: 'setting', type:'color', value: color }, function (response) {
      console.log('来自content的回复：' + response);
    });
  })
}
// 与 content-script 通信
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}
initPopup()