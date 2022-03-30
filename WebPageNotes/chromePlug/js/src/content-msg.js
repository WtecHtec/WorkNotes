chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
  const cmdVal = request.cmd
	if(cmdVal  === 'create') {
		renderNotes();
  } else if (cmdVal === 'login') {
	
		
	}
	// return true;
});

