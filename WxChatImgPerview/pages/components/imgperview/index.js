// components/picviewbox/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgsrc:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    dataimg: '',//图片地址
    distance: 0,//手指移动的距离
    scale: 1,//图片的比例
    baseWidth: null,//图片真实宽度
    baseHeight: null,//图片真实高度
    scaleWidth: '',//图片设显示宽度
    scaleHeight: '',//图片设显示高度
    clientWidth: 0, //容器宽度
    clientHeight: 0, //容器高度
    rotateClass: 'img-normal',
    scrollleft:0,
  },

  lifetimes: {
    ready: function(){
      var that = this;
      wx.createSelectorQuery().in(this).select(".images").boundingClientRect(
        function (rect) {
          console.log(rect)
          that.data.clientWidth = rect.width
          that.data.clientHeight = rect.height
          that.setData({
            dataimg: that.properties.imgsrc//'/static/pics/001.jpg',
          })
        }
      ).exec()
      
      wx.startDeviceMotionListening({
        interval:'normal',
        success:(res)=>{
          console.log('success')
          wx.onDeviceMotionChange((res)=>{
            //console.log(res.gamma)
            if (res.gamma>50){
              that.setData({
                rotateClass:"img-rotate"
              })
            }else{
              that.setData({
                rotateClass: "img-normal"
              })
            }
          })
        },
        fail:()=>{
          console.log('fail')
        }
      })

      wx.createSelectorQuery().in(this).select(".images").scrollOffset(function (res) {
        console.log(res)
        that.data.scrollleft= res.scrollWidth / 2
      }).exec()

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 监听图片加载成功时触发
    */
    imgload: function (e) {
      console.log(e)
      let height = this.data.clientWidth / e.detail.width * e.detail.height
      this.setData({
        'scale': this.data.clientWidth/e.detail.width,
        'baseWidth': e.detail.width, //获取图片真实宽度
        'baseHeight': e.detail.height, //获取图片真实高度
        'scaleWidth': this.data.clientWidth+'px',// e.detail.width+'px',//'100%', //给图片设置宽度
        'scaleHeight': height+'px'
        //'scaleHeight': '500px'//e.detail.height+'px', //'100%' //给图片设置高度
      })
      // this.setData({
      //   scrollleft: this.data.scrollleft
      // })
     
    },
    /**
    * 双手指触发开始 计算开始触发两个手指坐标的距离
    */
    touchstartCallback: function (e) {
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
    touchmoveCallback: function (e) {
      // 单手指缩放不做任何操作
      if (e.touches.length == 1) return;
      //双手指运动 x移动后的坐标和y移动后的坐标
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      //双手指运动新的 ditance
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      //计算移动的过程中实际移动了多少的距离
      let distanceDiff = distance - this.data.distance;
      let newScale = this.data.scale + 0.005 * distanceDiff
      
      let scaleWidth = newScale * this.data.baseWidth
      let scaleHeight = newScale * this.data.baseHeight
      if (scaleWidth<=this.data.clientWidth){
        // scaleWidth = this.data.clientWidth
        // scaleHeight = scaleWidth / this.data.baseWidth * this.data.baseHeight 
        return
      }
      if (scaleWidth >= (this.data.baseWidth*1.5)){
        // scaleWidth = this.data.baseWidth * 1.5
        // sc
        return
      }
        this.setData({
          'distance': distance,
          'scale': newScale,
          'scaleWidth': scaleWidth +  'px',
          'scaleHeight': scaleHeight + 'px',
          'diff': distanceDiff
        })
      // 为了防止缩放得太大，所以scale需要限制，同理最小值也是
      // if (newScale >= 1) {
      //   newScale = 1
      //   let scaleWidth = newScale * this.data.baseWidth + 'px'
      //   let scaleHeight = newScale * this.data.baseHeight + 'px'
      //   this.setData({
      //     'distance': distance,
      //     'scale': newScale,
      //     'scaleWidth': scaleWidth,
      //     'scaleHeight': scaleHeight,
      //     'diff': distanceDiff
      //   })
      // }
      // //为了防止缩放得太小，所以scale需要限制
      // if (newScale <= 0.3) {
      //   newScale = 0.3
      //   this.setData({
      //     'distance': distance,
      //     'scale': newScale,
      //     'scaleWidth': '100%',
      //     'scaleHeight': '100%',
      //     'diff': distanceDiff
      //   })
      // }

      
    }
  //method end
  }
})