chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
  const cmdVal = request.cmd
	if(cmdVal  === 'create') {
    console.log('userInfo===', )
    const userInfo = request.userInfo
    getAccount('set', userInfo.account)
    getToken('set',userInfo.token)
    getLogin('set', userInfo.login)
		// renderNotes();
    renderHasData();
  } else if (cmdVal === 'login') {
	
		
	}
	// return true;
});

