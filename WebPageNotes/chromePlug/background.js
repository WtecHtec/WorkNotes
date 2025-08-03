console.log('background')// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  console.log('快捷键命令:', command);
  
  // 获取当前活动标签页
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // 发送消息到content script
      chrome.tabs.sendMessage(tabs[0].id, {
        cmd: 'hotkey',
        command: command
      });
    }
  });
});

// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  // 打开popup或直接创建笔记
  chrome.tabs.sendMessage(tab.id, {
    cmd: 'create',
    type: 'pen', // 默认使用画笔工具
    userInfo: {
      account: '',
      token: '',
      login: 'false'
    }
  });
});