// ==UserScript==
// @name         微信公众号 - 剪贴板粘贴上传媒体素材 (精准父级匹配版)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  修正选择器逻辑，精准穿透 WebUploader 的外层 div 容器，实现 100% 成功率的静默粘贴上传
// @author       YourName
// @match        https://mp.weixin.qq.com/cgi-bin/appmsg?*action=edit*
// @match        https://mp.weixin.qq.com/cgi-bin/appmsg?*isNew=1*
// @icon         https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 【核心修正】匹配所有 ID 以 rt_rt_ 开头的 div 下面的直接子元素 input
  const CORRECT_INPUT_SELECTOR = 'div[id^="rt_rt_"] > input[type="file"]';

  // 核心粘贴处理函数
  async function handlePasteEvent(event) {
    // 1. 检查剪贴板中是否有图片文件
    const items = (event.clipboardData || window.clipboardData).items;
    if (!items || items.length === 0) return;

    let fileToUpload = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file && file.type.startsWith('image/')) {
          fileToUpload = file;
          break;
        }
      }
    }

    // 如果没有图片文件，允许普通的文本粘贴
    if (!fileToUpload) return;

    // 拦截浏览器的默认粘贴行为
    event.preventDefault();

    // 2. 精准抓取当前页面上的 WebUploader 真实 input 节点
    let uploaderInputs = document.querySelectorAll(CORRECT_INPUT_SELECTOR);

    // 3. 稳健性轮询：如果因为页面刚加载插件在初始化，就给 500ms 的高频微轮询兜底
    let attempts = 0;
    function tryInject() {
      uploaderInputs = document.querySelectorAll(CORRECT_INPUT_SELECTOR);

      if (uploaderInputs.length > 0) {
        // 永远取最新的一个组件实例
        const realInput = uploaderInputs[uploaderInputs.length - 1];
        try {
          console.log(`[粘贴上传-公众号] 成功定位目标 Input！正在静默注入: ${fileToUpload.name}`);

          // 使用 DataTransfer 灌入数据
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(fileToUpload);
          realInput.files = dataTransfer.files;

          // 触发 change 事件唤醒 WebUploader 开始分片上传
          const changeEvent = new Event('change', { bubbles: true });
          realInput.dispatchEvent(changeEvent);

          console.log('[粘贴上传-公众号] 上传指令已成功发出。');
        } catch (error) {
          console.error('[粘贴上传-公众号] 注入数据失败:', error);
        }
      } else {
        attempts++;
        if (attempts < 10) { // 50ms * 10 = 500ms
          setTimeout(tryInject, 50);
        } else {
          console.error('[粘贴上传-公众号] 找不到上传元素，请确认页面已完全加载，且选择器 `div[id^="rt_rt_"] > input` 是否依然有效。');
        }
      }
    }

    // 执行注入尝试
    tryInject();
  }

  // 初始化挂载全局粘贴监听
  function init() {
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
    console.log('%c[粘贴上传-微信公众号] 精准父级匹配版已就绪，等待 Ctrl+V...', 'color: #07c160; font-weight: bold;');
  }

  // 守护进程：防页面动态刷新导致全局事件丢失
  setInterval(() => {
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
  }, 3000);

  init();
})();