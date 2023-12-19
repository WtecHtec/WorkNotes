function throttle(func, wait = 100) {
  let timeout = null;
  let elapsed;
  let lastRunTime = Date.now(); // 上次运行时间
  return function none(content, ...args) {
      const _this = content;
      
      if (typeof timeout === 'number') {
          window.clearTimeout(timeout);
      }

      elapsed = Date.now() - lastRunTime;

      function later() {
          lastRunTime = Date.now();
          timeout = null;
          console.log('content---', _this)
          func.call(_this, _this);
      }

      if (elapsed > wait) {
          later();
      } else {
          timeout = window.setTimeout(later, wait - elapsed);
      }
  };
}