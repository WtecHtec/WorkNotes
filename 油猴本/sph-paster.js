// ==UserScript==
// @name         微信视频号 - 剪贴板粘贴上传媒体素材 (视频/图文双通用版)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  同时支持微信视频号视频发布页与图文发布页，直接 Ctrl+V 粘贴剪贴板中的视频或图片文件进行静默上传
// @author       YourName
// @match        https://channels.weixin.qq.com/platform/post/create*
// @match        https://channels.weixin.qq.com/platform/post/finderNewLifeCreate*
// @icon         https://channels.weixin.qq.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 视频和图文通用的元素选择器
  const FULL_INPUT_SELECTOR = '#container-wrap > div.container-center > div > div > div.main-body-wrap.post-create > div.main-body > div > div.post-edit-wrap.material-edit-wrap > div.material > div > div > div > span > div > span > input[type=file]';
  const FULL_CLICK_ZONE_SELECTOR = '#container-wrap > div.container-center > div > div > div.main-body-wrap.post-create > div.main-body > div > div.post-edit-wrap.material-edit-wrap > div.material > div > div > div > span > div > span > div';

  // 深度穿透查找器（主页 -> ShadowDOM -> 所有Iframe）
  function findElementOmni(selector) {
    let el = document.querySelector(selector);
    if (el) return el;

    const wujieApp = document.querySelector('wujie-app');
    if (wujieApp && wujieApp.shadowRoot) {
      el = wujieApp.shadowRoot.querySelector(selector);
      if (el) return el;
    }

    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      try {
        const iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
        if (iframeDoc) {
          el = iframeDoc.querySelector(selector);
          if (el) return el;
        }
      } catch (e) { }
    }

    // 弹性降级盲搜选择器
    const shortSelector = selector.includes('input') ?
      'div.main-body-wrap.post-create div.material input[type=file]' :
      'div.main-body-wrap.post-create div.material div.post-edit-wrap.material-edit-wrap > div.material > div > div > div > span > div > span > div';

    el = document.querySelector(shortSelector);
    if (el) return el;

    for (let i = 0; i < iframes.length; i++) {
      try {
        const iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
        if (iframeDoc) {
          el = iframeDoc.querySelector(shortSelector);
          if (el) return el;
        }
      } catch (e) { }
    }
    return null;
  }

  // 用于临时拦截弹窗的紧箍咒函数
  function preventDefaultClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 核心粘贴处理函数
  async function handlePasteEvent(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    if (!items || items.length === 0) return;

    let fileToUpload = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) { fileToUpload = file; break; }
      }
    }

    // 如果剪贴板里不是文件，不拦截，放行正常的文字粘贴
    if (!fileToUpload) return;
    event.preventDefault();

    const wxInput = findElementOmni(FULL_INPUT_SELECTOR);
    const clickZone = findElementOmni(FULL_CLICK_ZONE_SELECTOR);

    if (!wxInput || !clickZone) {
      console.error('[粘贴上传-视频号] 未检测到上传元素，请确保页面已完全加载！');
      return;
    }

    try {
      console.log(`[粘贴上传-视频号] 正在注入文件: ${fileToUpload.name}, 大小: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);

      // 1. 挂载拦截器，阻止系统弹窗
      wxInput.addEventListener('click', preventDefaultClick, { capture: true });

      // 2. 模拟点击激活组件状态
      clickZone.click();

      // 3. 压入文件流
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(fileToUpload);
      wxInput.files = dataTransfer.files;

      // 4. 延迟通知框架更新
      setTimeout(() => {
        const changeEvent = new Event('change', { bubbles: true });
        wxInput.dispatchEvent(changeEvent);

        // 5. 卸载拦截器，恢复人工点击弹窗功能
        wxInput.removeEventListener('click', preventDefaultClick, { capture: true });
        console.log('[粘贴上传-视频号] 媒体文件已静默秒传成功！');
      }, 50);

    } catch (error) {
      console.error('[粘贴上传-视频号] 发生错误:', error);
      if (wxInput) wxInput.removeEventListener('click', preventDefaultClick, { capture: true });
    }
  }

  // 初始化挂载
  function init() {
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
    console.log('%c[粘贴上传-视频号] 双场景通用静默版已就绪。', 'color: #2ed573; font-weight: bold;');
  }

  // 守护进程：防止 SPA 局部刷新或组件销毁后事件丢失
  setInterval(() => {
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
  }, 3000);

  init();
})();