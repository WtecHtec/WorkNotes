// ==UserScript==
// @name         抖音创作者中心 - 全场景剪贴板粘贴上传媒体素材
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  支持初次上传页（视频/图文TAB切换）及图文二级编辑页的直接 Ctrl+V 粘贴上传
// @author       YourName
// @match        https://creator.douyin.com/creator-micro/content/upload*
// @match        https://creator.douyin.com/creator-micro/content/post/image*
// @icon         https://www.douyin.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ================= 选择器配置 =================
  // 1. 初次上传页的选择器
  const PAGE1_INPUT_SELECTOR = '#root > div > div > div.semi-tabs.semi-tabs-top > div > div.semi-tabs-pane-active.semi-tabs-pane > div > div > div.container-drag-VAfIfu > input[type=file]';
  const TAB_CONTAINER_SELECTOR = '#root > div > div > div.tab-container-DjaX1b';

  // 2. 图文二级编辑页的选择器（添加图片按钮）
  const PAGE2_BTN_SELECTOR = '#DCPF > div > div.content-left-F3wKrk > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div.content-child-V0CB7w.content-limit-width-zybqBW > div > div.info-jvSF_5 > button';


  // ================= 核心逻辑：处理粘贴文件 =================
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

    // 如果没有检测到文件，不拦截，允许用户正常粘贴文本
    if (!fileToUpload) return;
    event.preventDefault();

    const currentUrl = window.location.href;

    // ---- 场景 A：图文二级编辑页面 ----
    if (currentUrl.includes('/content/post/image')) {
      const addBtn = document.querySelector(PAGE2_BTN_SELECTOR);
      if (!addBtn) {
        console.warn('[粘贴上传] 未找到二级页的“添加图片”按钮');
        return;
      }

      console.log(`[粘贴上传-二级页] 检测到图片: ${fileToUpload.name || 'image.png'}`);

      // 【核心黑科技】劫持系统原生的 document.createElement
      // 当点击按钮触发创建 input[type=file] 时，我们抓住它并注入文件
      const originalCreateElement = document.createElement;
      document.createElement = function (tagName, options) {
        const element = originalCreateElement.call(document, tagName, options);
        if (tagName.toLowerCase() === 'input' && element.type === 'file') {
          // 监听这个动态创建的 input 的 change 事件（可选，用于调试）
          element.addEventListener('change', () => {
            console.log('[粘贴上传-二级页] 动态注入的文件已被框架接收');
          });

          // 利用宏任务，在框架把 input 放入内存准备触发点击时，将我们的文件强行塞进去
          setTimeout(() => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fileToUpload);
            element.files = dataTransfer.files;
            // 触发 change 告诉 React
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }, 0);

          // 恢复原生的 createElement，避免污染后续的其他操作
          document.createElement = originalCreateElement;
        }
        return element;
      };

      // 模拟点击“添加图片”按钮，触发字节框架创建 input 的流程
      addBtn.click();

      // 安全兜底：如果500ms内没有触发重写（比如按钮逻辑变了），也恢复原生的方法
      setTimeout(() => { document.createElement = originalCreateElement; }, 500);
    }

    // ---- 场景 B：初次上传页面（视频/图文TAB） ----
    else if (currentUrl.includes('/content/upload')) {
      const fileInput = document.querySelector(PAGE1_INPUT_SELECTOR);
      if (!fileInput) {
        console.warn('[粘贴上传-初次页] 未找到上传 input 元素');
        return;
      }

      try {
        console.log(`[粘贴上传-初次页] 检测到媒体文件: ${fileToUpload.name || 'file'}`);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileToUpload);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (error) {
        console.error('[粘贴上传-初次页] 发生错误:', error);
      }
    }
  }

  // ================= 初始化与监听器挂载 =================
  function init() {
    // 全局绑定粘贴事件
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
    console.log('[粘贴上传] 全局粘贴监听器已挂载。');

    // 如果在初次上传页，额外监听 TAB 切换区域
    if (window.location.href.includes('/content/upload')) {
      const tabContainer = document.querySelector(TAB_CONTAINER_SELECTOR);
      if (tabContainer) {
        const observer = new MutationObserver(() => {
          console.log('[粘贴上传] 初次页检测到 TAB 切换，重刷监听器...');
          setTimeout(() => {
            document.removeEventListener('paste', handlePasteEvent);
            document.addEventListener('paste', handlePasteEvent);
          }, 100);
        });
        observer.observe(tabContainer, { attributes: true, childList: true, subtree: true });
      }
    }
  }

  // 考虑 SPA 应用的内部路由跳转（从初次上传页跳到二级页时，油猴脚本不会重新加载）
  // 采用每隔 2 秒检查并确保监听器存活的策略（防丢失死循环）
  setInterval(() => {
    // 确保全局始终挂载着我们的 paste 事件
    document.removeEventListener('paste', handlePasteEvent);
    document.addEventListener('paste', handlePasteEvent);
  }, 2000);

  // 首次进入延迟启动
  setTimeout(init, 1500);
})();