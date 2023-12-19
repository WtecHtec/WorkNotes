console.log('测试例子')

const html = document.querySelector('html');
const body = document.querySelector('body');

/** 最大 zindex  */
const maxZIndex = getMaxZIndex() + 1

// 是否圈选
let optStatus = 'pause'
// 事件类型
let optEvent = 'mousemove'

// 操作maker(html 元素)
let optOverlay = createElement('div', {
  id: 'dom-inspector-root',
  style: `z-index: ${maxZIndex};`,
});

// 创建辅助元素，用于判断圈选器元素是否被缩放
let assistEle = createElement('div', {
  style: `pointer-events: none;
  visibility: hidden;
  width: 100px;
  height: 100px;
  position: absolute;
  top: -100px;`
});



// 当前操作 元素
let currentTarget = null

// 缓存 操作元素
let _cachedTarget = null

// 当前元素 xpath
let currentXpath = ''


const _throttleOnMove = throttle(_onMove, 100);

// 在 html 中加入而非 body，从而消除对 dom 的影响 及 mutationObserver 的频繁触发
html && html.appendChild(optOverlay);
html && html.appendChild(assistEle);


function enable() {
  optStatus = 'enable'
  body && body.addEventListener(optEvent, _throttleOnMove, {
    capture: true,
    passive: true,
  });
}



function pause() {
  optStatus = 'pause'
  body && body.removeEventListener(optEvent, _throttleOnMove, {
    capture: true,
    passive: true,
  });
}

    /** 移除圈选蒙层 */
function _remove() {
  optOverlay.innerHTML = '';
}

/** 鼠标滑动 圈选逻辑  */
function _onMove(e) {
  console.log('_onMove', e)
  const target = getTouchMouseTargetElement(e)
  if (target && optOverlay && optOverlay.contains(target)) return;
  currentTarget = target;
  if (currentTarget === _cachedTarget) return null;
  _remove()
  _cachedTarget = currentTarget
  currentXpath = getXpath(target, true)
  addOverlay({
    target: target,
    root: optOverlay,
    assistEle: assistEle,
  });
}

function _addBodyClick() {
  // 捕获阶段监听body点击事件
  body.addEventListener(
      'click',
      (e) => {
        console.log(e)
          if (optStatus === 'enable') {
              // 禁用默认行为
              e.preventDefault();
              // 停止事件传播
              e.stopPropagation();
              console.log('currentTarget---', currentTarget)
              console.log('currentXpath----', currentXpath)
              // this.onDidSelect(this.target);
              pause()
          }
      },
      true
  );
}

_addBodyClick()