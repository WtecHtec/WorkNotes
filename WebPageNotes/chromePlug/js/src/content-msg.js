chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
  const cmdVal = request.cmd
  console.log('收到消息:', request);
  
  if (request.cmd === 'hotkey') {
    handleHotkeyCommand(request.command);
    sendResponse({ success: true });
  } else if(cmdVal  === 'create') {
    console.log('userInfo===', )
    const userInfo = request.userInfo
    getAccount('set', userInfo.account)
    getToken('set',userInfo.token)
    getLogin('set', userInfo.login)
		// renderNotes();
    renderHasData();
  } else if (cmdVal === 'login') {
	
		
	}
	return true;
});


// 处理快捷键命令
function handleHotkeyCommand(command) {
  console.log('处理快捷键命令:', command);
  
  switch (command) {
    case 'create_pen':
      createNoteTool('pen');
      break;
    case 'create_select':
      createNoteTool('select');
      break;
    case 'create_arrow':
      createNoteTool('arrow');
      break;
    case 'create_text':
      createNoteTool('text');
      break;
    case 'create_serial':
      createNoteTool('serial');
      break;
    case 'create_remove':
      createNoteTool('remove');
      break;
    case 'toggle_notes':
      toggleNotesDisplay();
      break;
    default:
      console.log('未知的快捷键命令:', command);
  }
}


// 创建笔记工具
function createNoteTool(type) {
  console.log('创建笔记工具:', type);
  
  // 如果笔记功能未激活，先激活
  if (!g_noteStatus) {
    renderNotes();
  }
  
  // 等待笔记功能初始化完成后切换工具
  setTimeout(() => {
    if (g_fabric_canvas && g_noteStatus) {
      // 更新UI状态
      $('.hz-opt-img').removeClass('ht-active');
      $(`.hz-${type}`).addClass('ht-active');
      
      // 执行工具切换
      handleOpt(type);
      
    
    }
  }, 100);
}

// 切换笔记显示/隐藏
function toggleNotesDisplay() {
  if (g_noteStatus) {
    // 如果笔记已显示，则隐藏
    handleClose();

  } else {
    // 如果笔记未显示，则显示
    renderNotes();

  }
}

// 处理创建命令
function handleCreateCommand(message) {
  console.log('处理创建命令:', message);
  
  // 如果笔记功能未激活，先激活
  if (!g_noteStatus) {
    renderNotes();
  }
  
  // 等待笔记功能初始化完成后切换工具
  setTimeout(() => {
    if (g_fabric_canvas && g_noteStatus) {
      const type = message.type || 'pen';
      
      // 更新UI状态
      $('.hz-opt-img').removeClass('ht-active');
      $(`.hz-${type}`).addClass('ht-active');
      
      // 执行工具切换
      handleOpt(type);
      
     
    }
  }, 100);
}