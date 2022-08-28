// pages/driving/index.js
const diff_free = 0.7
function formatMoney(money) {
	return (money / 100).toFixed(2);
}
function padString(num) {
	return num < 10 ? `0${num}` : num;
}
function formatTime(sec) {
	const h = Math.floor(sec / 3600)
	sec = sec % 3600
	const m = Math.floor(sec / 60)
	sec = sec % 60
	const s = Math.floor(sec)
	return `${padString(h)}:${padString(m)}:${padString(s)}`
}
Page({
 timer: null,
  /**
   * 页面的初始数据
   */
  data: {
		latitude: 32.92,
		longitude: 116.46,
		scale: 18,
		showTime: "00:00:00",
		showMoney: "0.00",
		isEnd: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.onPostion()
		this.onCountFree()
  },
	onPostion() {
		wx.startLocationUpdate({ fail(err) {console.error(err)}})
		wx.onLocationChange((res)=> {
			this.setData({
				latitude: res.latitude,
				longitude: res.longitude,
			})
		 })
	},
	onHide() {
		this.timer && clearInterval(this.timer)
	},
	onEndDire() {
		this.timer && clearInterval(this.timer)
		this.setData({
			isEnd: true,
		})
	},
  onCountFree() {
		let sec = 0;
		let money = 0;
		this.timer = setInterval(()=> {
			sec = sec + 1;
			money = money + diff_free;
			this.setData({
				showTime: formatTime(sec),
				showMoney: formatMoney(money),
			})
		}, 1000)
	}
})