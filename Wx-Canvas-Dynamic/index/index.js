// index.js
// 获取应用实例
const app = getApp()
import { ThumbsUpAni } from '../../utils/ThumbsUpAni'
Page({
  data: {
   
  },
  // 事件处理函数
  bindViewTap() {
    this.likeUpAni.start()
  },
  onLoad() {
   
  },
  onReady(){
    const query = wx.createSelectorQuery()
    query.select('#likeCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        this.likeUpAni =  new ThumbsUpAni(canvas, ctx)
      })
  },
  
})
