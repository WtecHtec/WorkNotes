// pages/unlock/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

	onUnlock() {


		wx.getLocation({
      type:'gcj02',
      success:res=>{
          // this.setData({
          //   longitude: res.longitude,
          //   latitude: res.latitude
          // })
				wx.showLoading({
					mark: true,
					title: '开锁中'
				})
				setTimeout(() => {
					wx.redirectTo({
						url: '/pages/driving/index',})
						wx.hideLoading()
				}, 2000)
      },
			fail: ()=> {
				wx.showToast(
					{
						title: '授权定位',
						icon: 'none',
					}
				)
			}
    })


	}
})