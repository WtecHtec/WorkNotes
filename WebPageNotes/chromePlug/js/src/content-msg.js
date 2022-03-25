chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  const cmdVal = request.cmd
	if(cmdVal  === 'create') {
    $('body').addClass('hz-body')
    g_loadingel.show()
    setTimeout(()=> {
      g_noteStatus = true
      if (!g_fabric_canvas) { 
        createCanvas()
      } else {
        $('.hz-tools_content').show()
        $('.herz-m-from').show()
      }
      requestAnimationFrame(()=> {
        $('.hz-opt-img').removeClass('ht-active')
        $('.hz-pen').addClass('ht-active')
        handleOpt('pen')
        g_loadingel.hide()
      })
    }, g_fabric_canvas ? 1000 : 2000)
  }
});

