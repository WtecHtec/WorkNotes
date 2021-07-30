// components/picviewbox/index.js
import { IMG_ULRS, ClickEvent } from './config'
const EventObj = new ClickEvent();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    previewData: {
      type: Array,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: 500,
    width: 375,
    imgH: 240,
    imgW: 320,
    contentH: '100%',
    contentW: '100%',
    isScale: false,
    scaleNum: 3,
    // perviewTop: 0,
    perviewLeft: 0,
    marginTop: 0,
   
    scrollLeft: 0,
    scaleIndex: -1,

    // previewData: IMG_ULRS,
    timeer: null,
    scrollIng: false,
    startScorllLeft: 0,
    endScorllLeft: 0,
    isScorll: true,

    distance: 0,//手指移动的距离

    currentIndex: 1,
    showData: [],
  },



  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      try {
        const res = wx.getSystemInfoSync()
        // console.log(res.windowWidth - 240)
        // console.log(res.windowHeight - 320)
        let { previewData } = this.data;
        this.setData({
          height: res.windowHeight,
          width: res.windowWidth,
          showData: previewData.length < -1 ? previewData.slice(0,4) : previewData,
        })
      } catch (e) {
        // Do something when catch error
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    bindClose(e){
      this.triggerEvent('pvclose',e )
    },
    bindDescMore(e){
      let { index, item } = e.currentTarget.dataset
      let imgItem = `showData[${index}]`
      item.more = !item.more
      this.setData({ [imgItem]: item, })
      console.log('bindDescMore', item)
    },

    handleDayClick(e){
      // let {offsetLeft,offsetTop } = e.currentTarget
      let {x} = e.detail;
      let { index, item } = e.currentTarget.dataset
      let {previewData, scaleNum,imgH, imgW, width, height, contentH, contentW, isScale, marginTop} = this.data
      let imgItem = `showData[${index}]`
      let tMatrix = Array(6).fill(0)
      if (!item) return 
      EventObj.bindEvent(e, (type, event)=>{
        // console.log(type, e)
        tMatrix[0] = scaleNum;
        tMatrix[3] = scaleNum;
        if (type === 'double_tap' ) {
          if (item.isScale) {
            this._initScale(item, index, previewData)
            return
          }
          this.data.scaleIndex = index
          // previewData[index].matrix = tMatrix
          // previewData[index].isScale = true
          item.matrix = tMatrix
          item.isScale = true
          contentH =  imgH * scaleNum > height ?  imgH * scaleNum : height
          contentW =  imgW * scaleNum
          // if (contentH > height) {
          //   marginTop = (contentH - height) / 2 + 'Px';
          //   previewData[index].marginTop = marginTop
          // } 
          this.setData({
            contentH,
            contentW,
            marginTop,
            [imgItem]: item,
            isScorll: false,
         
            // scaleIndex: index,
          },()=>{
            // setTimeout(() => {
            //   this.setData({
            //     isScorll: false,
            //   })
            // }, 200);
            
          })
        } else if (type === 'tap') {
          // console.log('sss')
          this._initScale(item, index, previewData)
        }
  
      })
    },
    _initScale(item, index, previewData){
      let imgItem = `showData[${index}]`
      let tMatrix = Array(6).fill(0)
      if (item.isScale) {
        tMatrix[0] = 1;
        tMatrix[3] = 1;
        // previewData[index].matrix = tMatrix
        // previewData[index].isScale = false
        // previewData[index].marginTop = 0
        item.matrix = tMatrix
        item.isScale = false
        item.marginTop = 0
        this.data.scaleIndex = -1
        this.setData({
          isScorll: true,
          // scaleIndex: -1,
          [imgItem]:item,
        })
      }
  
    },
    bindScrollViewToupper(e){
  
      // console.log('bindScrollViewToupper',e)
    },
    bindScrollViewTolower(e){
      // console.log('bindScrollViewTolower',e)
    },
  
    bindScroll(e){
  
      if ( this.data.timeer) clearTimeout( this.data.timeer)
      this.data.timeer = setTimeout(() => {
        let { width, scaleIndex, previewData} = this.data
     
        this.createSelectorQuery()
          .select('.scroll-img-main')
          .scrollOffset()
          .exec((res) => {
           
            console.log('bindTouchEnd===',res)
            let scrollView = res[0];
            // console.log('bindTouchEnd===', scrollView.scrollLeft)
            console.log('_initScale====', scrollView.scrollLeft,  parseInt(scrollView.scrollLeft/width), scaleIndex)
   
            
  
            let currentIndex = parseInt(scrollView.scrollLeft/width) + 1;
           

            this.setData({  currentIndex,  });

            // let { showData, previewData } = this.data;
            // if (currentIndex === showData.length - 2  && !showData[showData.length] && showData.length <= previewData.length) {
            //   // console.log('1111')
            //   let showItem = `showData[${showData.length}]`
            //   this.setData({  
            //     currentIndex, 
            //     [showItem]: previewData[showData.length],
            //   },()=>{
            //     // console.log('showData', showData)
            //   });
            // } else {
            //   this.setData({  currentIndex, });
            // }
            
  
            // if ( parseInt(scrollView.scrollLeft/width) !== scaleIndex && scaleIndex !== -1) {
            //   this.setData({
            //     isScorll: false,
            //     currentIndex: parseInt(scrollView.scrollLeft/width) 
            //   });
            //   this._initScale(previewData[scaleIndex], scaleIndex, previewData)
            // }
          })
      }, 100);
    },
    bindTouchEnd(){
     
    },
    /**
     * 双手指触发开始 计算开始触发两个手指坐标的距离
     */
    touchstartCallback: function(e) {
      return
      // 单手指缩放开始，不做任何处理
      if (e.touches.length == 1) return;
      // 当两根手指放上去的时候，将距离(distance)初始化。
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      //计算开始触发两个手指坐标的距离
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setData({
        'distance': distance,
      })
    },
  
    /**
     * 双手指移动   计算两个手指坐标和距离
     */
    touchmoveCallback: function(e) {
      return
      // 单手指缩放不做任何操作
      if (e.touches.length == 1) return;
      //双手指运动 x移动后的坐标和y移动后的坐标
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      //双手指运动新的 ditance
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      //计算移动的过程中实际移动了多少的距离
      let distanceDiff = distance - this.data.distance;
      let newScale = this.data.scaleNum + 0.005 * distanceDiff
      newScale = newScale < 1 ?  1 : newScale
      console.log('newScale', newScale)
      // 为了防止缩放得太大，所以scale需要限制，同理最小值也是
    
      let { index } = e.currentTarget.dataset
      let {previewData, imgH, imgW, height, contentH, contentW, marginTop} = this.data
      let imgItem = `previewData[${index}]`
      let tMatrix = Array(6).fill(0)
      tMatrix[0] = newScale;
      tMatrix[3] = newScale;
      // console.log(type, e)
      this.data.scaleIndex = index
      previewData[index].matrix = tMatrix
      previewData[index].isScale = true
      contentH =  imgH * newScale
      contentW =  imgW * newScale
      this.setData({
        contentH,
        contentW,
        marginTop,
        [imgItem]: previewData[index],
        isScorll: false,
        // scaleIndex: index,
      })
    },
  
  }
})