// pages/register/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		licImage: null,
		status: 'NONE'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
	onChooseLic() {
		wx.chooseMedia({
			count: 1,
			mediaType: ['image',],
			sourceType: ['album', 'camera'],
			maxDuration: 30,
			camera: 'back',
			success: (res) => {
				console.log(res.tempFiles)
				this.setData({
					licImage: res.tempFiles[0].tempFilePath,
				})
			}
		})
	},
	onSubit() {
		wx.showLoading({
			mark: true,
			title: '上传中'
		})
		setTimeout( ()=> {
			wx.hideLoading()
			this.setData({
				status: 'PENDING'
			})
		}, 2000)
	}
})