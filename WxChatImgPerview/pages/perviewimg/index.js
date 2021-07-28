// pages/perviewimg/index.js
import { IMG_ULRS } from './config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    matrix: '',
    height: 500,
    width: 375,
    startLeft: 0,
    endLeft: 0,
    scrollLeft: 0,
    imgs: IMG_ULRS,
    datas: [ {
      v: 'A',
      c: 'red',
      d: '萨达萨达萨达倒萨倒萨大大'
    },
    {
      v: 'B',
      c: 'gree',
      d: '萨达萨达萨达倒萨asdasdsd  撒旦撒旦倒萨大大'
    },
    {
      v: 'C',
      c: 'blue',
      d: '萨达萨达萨达adasdas撒旦撒旦倒萨倒萨大大'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      const res = wx.getSystemInfoSync()
      // console.log(res.windowWidth)
      // console.log(res.windowHeight)
      this.setData({
        height: res.windowHeight,
        width: res.windowWidth,
      })
    } catch (e) {
      // Do something when catch error
    }
  },
  bindScroll(event){
    console.log(event.detail )
  },
  bindDragStart(event){
    console.log('bindDragStart',event.detail )
    this.data.startLeft = event.detail.scrollLeft 
  },
  bindDragEnd(event){
    console.log('bindDragEnd',event.detail )
    this.data.endLeft = event.detail.scrollLeft 
    let { startLeft, scrollLeft, width } = this.data
    if(startLeft < 0) return
    // if (startLeft > this.data.endLeft && startLeft - this.data.endLeft >= width/2 ) {
    //   // 左
    //   scrollLeft -= width
    //   console.log('scrollLeft 左', scrollLeft)
    // } else if (startLeft < this.data.endLeft  && this.data.endLeft - startLeft >= width/2) {
    //   // 右
    //   scrollLeft += width
    //   console.log('scrollLeft 右', scrollLeft)
    // } 
  
    // this.setData({
    //   scrollLeft,
    // });
  },
  onScale(){

  },
  bindTap(e){
    let tMatrix = Array(6).fill(0)
    tMatrix[0] = 4;
    tMatrix[3] = 4;
    var temp = tMatrix.join(",");
    this.setData({
      matrix: temp,
    });
    console.log('bindTap', temp)
  }



  
})