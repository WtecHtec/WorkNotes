// const unactives = ['close', 'save']
function initPopup() {
  $('#note-btn').on('click',  (event) => {
    console.log('======', event)
    if(event && event.target) {
      const targetEl = $(event.target)
      const typeVal = targetEl.data('type')
      if (!typeVal || typeVal === 'other') {
        if ( targetEl.data('opt') === 'login') {
          console.log('77777777777')
          $('#note-btn').hide()
          $('.form_div').show()
          // login();
        }
        return
      }  else {
        sendMessageToContentScript({ cmd: 'create',type: typeVal, userInfo: {
          account: getAccount('get'),
          token: getToken('get'),
          login: getLogin('get'),
        } }, function (response) {
          console.log('来自content的回复：' + response);
        });
      }
    }
  })

  $('#login_form').on('click',  (event) => {
    login()
  })
  if ( getLogin('get') === 'true') {
    $('#user_name').html(getAccount('get'))
    $('#login_txt').html('切换帐号')
  }
}
// 与 content-script 通信
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
					 
            if (callback) callback(response);
						// return true
        });
    });
}

async function login() {
  console.log('8888888888888')
  const code = form[0].value
  if (!code) return
  // const res = await requestApi('accountlogin', {accountAuthor: code})
  // console.log('requestApi===',res)
  // if(res && res.statusCode === 200) {
  //   getAccount('set', code)
  //   getToken('set',res.responseData.token)
  //   getLogin('set', 'true')
  //   console.log('登陆成功')
  //   $('#user_name').html(code)
  //   $('#login_txt').html('切换帐号')
  // } else {
  //   alert('校验码无效，请联系管理员！！保存本地')
  // }
  $('#note-btn').show()
  $('.form_div').hide()
}

initPopup()
