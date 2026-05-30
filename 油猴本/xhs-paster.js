// ==UserScript==
// @name         小红书粘贴上传图片
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在小红书发布界面支持粘贴上传图片
// @author       You
// @match        https://creator.xiaohongshu.com/publish/publish*
// @match        https://creator.xiaohongshu.com/publish/note*
// @grant        none
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/joeseesun/qiaomu-userscripts/main/%E5%B0%8F%E7%BA%A2%E4%B9%A6%E7%B2%98%E8%B4%B4%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87/xiaohongshu_paste_upload.js
// @updateURL    https://raw.githubusercontent.com/joeseesun/qiaomu-userscripts/main/%E5%B0%8F%E7%BA%A2%E4%B9%A6%E7%B2%98%E8%B4%B4%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87/xiaohongshu_paste_upload.js
// @homepageURL  https://github.com/joeseesun/qiaomu-userscripts
// @supportURL   https://github.com/joeseesun/qiaomu-userscripts/issues
// ==/UserScript==

(function () {
  'use strict';

  console.log('[Xiaohongshu Paste Upload] loaded');

  function createToast(message, type = 'info') {
    const toast = document.createElement('div');
    const background = type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff';

    toast.textContent = message;
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${background};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            animation: xhsPasteSlideIn 0.3s ease-out;
            user-select: none;
            pointer-events: none;
        `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'xhsPasteSlideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  const style = document.createElement('style');
  style.textContent = `
        @keyframes xhsPasteSlideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes xhsPasteSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
  document.head.appendChild(style);

  function findFileInput() {
    const selectors = [
      'input[type="file"][accept*="image"]',
      'input[type="file"]',
      '.upload-input input[type="file"]',
      '[class*="upload"] input[type="file"]',
      '[class*="Upload"] input[type="file"]'
    ];

    for (const selector of selectors) {
      const inputs = Array.from(document.querySelectorAll(selector));
      const input = inputs.find(candidate => candidate && !candidate.disabled);
      if (input) {
        console.log('[Xiaohongshu Paste Upload] found file input:', selector, input);
        return input;
      }
    }

    return null;
  }

  function handlePaste(event) {
    const files = extractImageFiles(event);
    if (!files.length) return;

    event.preventDefault();
    uploadImages(files);
  }

  function extractImageFiles(event) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return [];

    const files = [];
    const items = Array.from(clipboardData.items || []);

    for (const item of items) {
      if (!item.type || !item.type.startsWith('image/')) continue;

      const file = item.getAsFile();
      if (file) {
        files.push(normalizeImageFile(file, files.length));
      }
    }

    if (!files.length && clipboardData.files && clipboardData.files.length) {
      for (const file of Array.from(clipboardData.files)) {
        if (file && file.type && file.type.startsWith('image/')) {
          files.push(normalizeImageFile(file, files.length));
        }
      }
    }

    return files;
  }

  function normalizeImageFile(file, index) {
    const type = file.type || 'image/png';
    const extension = mimeToExtension(type);
    const name = file.name && file.name.trim()
      ? file.name
      : `paste-image-${Date.now()}-${index + 1}.${extension}`;

    return new File([file], name, {
      type,
      lastModified: file.lastModified || Date.now(),
    });
  }

  function mimeToExtension(type) {
    const map = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg',
    };
    return map[type] || 'png';
  }

  function uploadImages(files) {
    const fileInput = findFileInput();

    if (!fileInput) {
      createToast('未找到上传组件，请刷新页面重试', 'error');
      console.error('[Xiaohongshu Paste Upload] file input not found');
      return;
    }

    try {
      const uploadFiles = fileInput.multiple ? files : [files[0]];
      const dataTransfer = new DataTransfer();

      uploadFiles.forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));

      createToast(`图片已粘贴上传：${uploadFiles.length} 张`, 'success');
      console.log('[Xiaohongshu Paste Upload] uploaded files:', uploadFiles);
    } catch (error) {
      createToast('上传失败，请手动上传', 'error');
      console.error('[Xiaohongshu Paste Upload] upload failed:', error);
    }
  }

  document.addEventListener('paste', handlePaste, true);

  setTimeout(() => {
    createToast('粘贴上传已启用', 'success');
  }, 1000);
})();