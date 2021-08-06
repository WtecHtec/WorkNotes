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
        this.myCanvas = canvas
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

  setRotateImage: function(filePath) {
    // 这里就用到了tmp_board 即将转换后的图片画回到画布中 只是在页面中无感知而已
    let tmpCtx = wx.createCanvasContext('tmp_board', this)
    // 设置基准点 因为要转-90度 所以要将基准点设置为左下角
    tmpCtx.translate(10, this.deviceInfo.windowHeight + 10)
    tmpCtx.rotate(-90 * Math.PI / 180)
    // drawImage时 因为长宽不一 需要按原始图片的宽高比例设置来填充下面的后两个参数 如原始图片 300 * 600 则转过来时需要保持宽比高短 如下面的180 * 360
    tmpCtx.drawImage(filePath, 0, 0, this.deviceInfo.windowWidth + 10 , this.deviceInfo.windowHeight + 10)
    tmpCtx.draw(false, ()=> {
      this.uploadCanvasImg('tmp_board', 1)
    })
  },

  //上传
  uploadCanvasImg: function(canvasId, quality) {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      fileType: 'png',
      quality: quality, //图片质量
      success: (res) => {
      
        let filePath = res.tempFilePath
        console.log('uploadCanvasImg', filePath)

        wx.getFileSystemManager().readFile({
          filePath: filePath,
          encoding: "base64",
          success: function (data) {
            console.log(data.data)//返回base64编码结果，但是图片的话没有data:image/png，但好像png是万能的 
            getWord(AT, data.data)
          }
        })

        // 可做上传操作
      }
    })
  },
  bindUpload(){

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.deviceInfo.windowWidth,
      height:  this.deviceInfo.windowHeight,
      canvas: this.myCanvas,
      success:(res)=> {
        this.setRotateImage(res.tempFilePath)
      }
    })
  
  
  }

})