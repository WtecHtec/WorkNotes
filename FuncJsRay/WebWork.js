
class WebWork {
  /**
   * @param {*} workPath  web work js 路径
   * @param {*} timeOut  运行时长，超出结束进程
   */
  constructor(workPath, timeOut) {
    this.status = false
    this.timeOut = timeOut ? timeOut : 10
    this.onMsg = null
    if (window.Worker) {
      this.worker = new Worker( workPath ? workPath : 'web_work.js');
      this.worker.onmessage =  (event) => {
        this.worker.terminate();
        this.status = true
        if (typeof(this.onMsg) === 'function') {
          this.onMsg({code: '200', result: event })
        }
      }
      this.worker.onerror = (event) => {
        this.worker.terminate();
        this.status = true
        if (typeof(this.onMsg) === 'function') {
          this.onMsg({code: '202', result: event })
        }
      };
    } else {
      console.log('Your browser doesn\'t support web workers.')
    }
  }
  /**
   * 运行时间限制
   * @param {*} nowTime 
   * @param {*} timeOut 
   */
  thanRunTime(nowTime, timeOut) {
    if ((new Date().getTime() - nowTime) / 1000 < timeOut && !this.status) {
      requestAnimationFrame(()=> {
        this.thanRunTime(nowTime, timeOut)
      })
    } else {
      this.status = false
      this.worker.terminate();
      if (typeof(this.onMsg) === 'function' && (new Date().getTime() - nowTime) / 1000 > timeOut) {
        console.error('run timeout！！', this.worker)
        this.onMsg({code: '201', result: { msg: 'run timeout！！'} }) 
      }
    }
  }
  sendMessage(msg, callBack){
    const runTimes = new Date().getTime()
    this.worker.postMessage( {data: Object.assign({}, msg), times: runTimes });
    this.thanRunTime(runTimes, this.timeOut)
    if (typeof(callBack) === 'function') {
      this.onMsg = callBack
    }
  }
}