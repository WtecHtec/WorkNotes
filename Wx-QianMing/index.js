// pages/qianming/index.js
import { Draw } from './draw'
import { getWord, AT } from './wordUtils'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cW: 300,
    cH: 300,
    scope: [
      {
        value: 0,
        title: '正常',
      },
      {
        value: 90,
        title: '顺时针旋转90°',
      },
      {
        value: 180,
        title: '顺时针旋转180°',
      },
      {
        value: -90,
        title: '逆时针旋转90°',
      },
    ],

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // getToken()
    try {   
      const res = wx.getSystemInfoSync()
      this.deviceInfo = res
      this.setData({
        cW:  this.deviceInfo.windowWidth,
        cH:  this.deviceInfo.windowHeight
      })
    } catch (e) {
      // Do something when catch error
    }

    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true, rect: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = wx.createCanvasContext('myCanvas')
        this.draw =  new Draw('my-Canvas', canvas, this.deviceInfo.windowWidth, this.deviceInfo.windowHeight,this.deviceInfo.pixelRatio)
        // console.log('draw', draw)
      })
  },

  touchStart(event) {
    console.log('touchStart', event)
    this.draw.start(event.touches[0])
  },
  touchMove(event) {
    this.draw.move(event.touches[0])
  },
  bindClear(){
    this.draw.clear()
  },
  bindUpload(){
    let baseRes = this.draw.createBase64()
    let hd = 'data:image/png;base64'
    getWord(AT, (baseRes.split(hd)[1]) );
  
  }

})