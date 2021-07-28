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
    imgH: 240,
    imgW: 320,
    contentH: '100%',
    contentW: '100%',
    isScale: false,
    scaleNum: 4,
    imgs: IMG_ULRS,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      const res = wx.getSystemInfoSync()
      console.log(res.windowWidth - 240)
      console.log(res.windowHeight - 320)
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
    let {scaleNum, imgH, imgW, contentH, contentW, height, width} = this.data;
    let tMatrix = Array(6).fill(0)
    tMatrix[0] = scaleNum;
    tMatrix[3] = scaleNum;
    var temp = tMatrix.join(",");
    this.setData({
      isScale: true,
      matrix: temp,
      contentH: imgH * scaleNum +  width - imgW,
      contentW: imgW * scaleNum +  width - imgW,
    });
    console.log('bindTap', temp)
  }



  
})