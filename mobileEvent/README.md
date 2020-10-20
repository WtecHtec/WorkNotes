EventUtilSlider.js　(前端js 实现移动端点击长按上下左右滑事件)
使用:


  
     
    
       //获取dom
     let domContent = document.querySelector('#main');
      //定义各类事件，为了可以解除事件绑定，事件回调不使用匿名函数
     function handleClick() {
       alert('点击事件');
     }
      //绑定点击事件
     EventUtil.bindEvent(domContent, 'click', handleClick);
 附录：
 swipeleft是左滑事件，swiperight是右滑事件，slideup是上滑事件，slidedown下滑事件，click点击事件，longpress长按点击事件