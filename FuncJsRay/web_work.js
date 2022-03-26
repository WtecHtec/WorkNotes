(function(){
  importScripts("Rx.js");
  onmessage = function (evt){
    const msgData = evt.data;//通过evt.data获得发送来的数据
    console.time()
    const result = new Function('data', `${msgData.func ? '' :  msgData.func}`)(msgData.params ? msgData.params : {})
    console.log(result)
    console.timeEnd()
    postMessage(result);//将获取到的数据发送会主线程
  }
})()

