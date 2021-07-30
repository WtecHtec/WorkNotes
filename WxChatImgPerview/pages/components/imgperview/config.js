export const IMG_ULRS = [
  {
    src: 'https://kf.qq.com/xv-test/fsna/kf-file/lx_pic/20210726/LXPIC_lxjihoa6g7_LXIMAGE_2016defa8ae541979ead8aee4a7575d5.jpg?s1=1627456888&s2=WB9VEbNtAYeUr5xdherzshen&s3=36000&s4=a13cb5c450163e7c5db752bc64608544e312af64',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'absolute绝对定位元素，如果含有overflow不为visible的父级元素，同时，该父级元素以及到该绝对定位元素之间任何嵌套元素都没有position为非static属性的声明，则overflow对该absolute元素不起作用。'
  },
  {
    src: 'https://kf.qq.com/xv-test/fsna/kf-file/lx_pic/20210726/LXPIC_lxjiunrthq_LXIMAGE_1df7f01ad448496084e00c3a61d91d4c.jpg?s1=1627456888&s2=smZnkNwkhcsQgpRGherzshen&s3=36000&s4=192e32e679bcb9aca7fcd998324c6c1acaa71eb7',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'absolute绝对定位元素，如果含有overflow不为visible的父级元素，同时，该父级元素以及到该绝对定位元素之间任何嵌套元素都没有position为非static属性的声明，则overflow对该absolute元素不起作用。'
  },
  {
    src: 'https://kf.qq.com/xv-test/fsnb/kf-file/lx_pic/20210726/LXPIC_lx6pberiqr_LXIMAGE_78a1c0373f06472b9e0b19941967c748.jpg?s1=1627456888&s2=sEdXpmj0bd0Bm81Zherzshen&s3=36000&s4=8440193940d90bcef71afff6f00ecd1aa18a4abd',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'absolute绝对定位元素，如果含有overflow不为visible的父级元素，同时，该父级元素以及到该绝对定位元素之间任何嵌套元素都没有position为非static属性的声明，则overflow对该absolute元素不起作用。'
  },
  {
    src: 'https://kf.qq.com/xv-test/fsna/kf-file/lx_pic/20210726/LXPIC_lx96tblhbv_LXIMAGE_76edc3ca23454a8a85c6df96e465f1f1.jpg?s1=1627456888&s2=WCatdUxSihjPydlsherzshen&s3=36000&s4=73eb8d4602dedb07bcc6d8727b1cadc5f066e1cd',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'asdd'
  },
  {
    src: 'https://kf.qq.com/xv-test/fsnb/kf-file/lx_pic/20210726/LXPIC_lxl36e3quo_LXIMAGE_83a665d71b3143cb8312aab66ca625fb.jpg?s1=1627456888&s2=q9me16dljbYaVdPTherzshen&s3=36000&s4=d2b0fb73e120baf0661d7237830dc4962d69a170',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'asdd'
  },
  {
    src: 'https://kf.qq.com/xv-test/fsna/kf-file/lx_pic/20210726/LXPIC_lxkis75kva_LXIMAGE_d32692e14ae34b67a70492bf84c17102.jpg?s1=1627456888&s2=ePB4VWVShwhIvUEqherzshen&s3=36000&s4=cdce2343e16475d393cef363087553918e84d6c0',
    matrix: '(1,0,0,1,0,0)',
    origin: "0 0",
    desc: 'asdadasdsadd'
  }
  
]

class ClickEvent{
  constructor(){
    // 触摸开始时间
    this.touchStartTime = 0
    // 触摸结束时间
    this.touchEndTime = 0  
    // 最后一次单击事件点击发生时间
    this.lastTapTime = 0 
    // 单击事件点击后要触发的函数
    this.lastTapTimeoutFunc = null 
  }
  bindEvent(e, fn) {
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (this.touchEndTime - this.touchStartTime < 350) {
      // 当前点击的时间
      var currentTime = e.timeStamp
      var lastTapTime = this.lastTapTime
      // 更新最后一次点击时间
      this.lastTapTime = currentTime
      // 如果两次点击时间在300毫秒内，则认为是双击事件
      if (currentTime - lastTapTime < 300) {
        // console.log("double tap")
        // 成功触发双击事件时，取消单击事件的执行
        clearTimeout(this.lastTapTimeoutFunc);
        fn('double_tap', e)
      } else {
        // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
        this.lastTapTimeoutFunc = setTimeout(function () {
          console.log("tap")
          fn('tap', e)
        }, 300);
      }
    }
  }

}

export {
  ClickEvent,
}