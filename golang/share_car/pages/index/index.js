// index.js
const setting = {
  skew: 0,
  rotate: 0,
  showLocation: false,
  showScale: false,
  subKey: '',
  layerStyle: 1,
  enableZoom: true,
  enableScroll: true,
  enableRotate: false,
  showCompass: false,
  enable3D: false,
  enableOverlooking: false,
  enableSatellite: false,
  enableTraffic: false,

}
Page({
	data: {
    avatarUrl: null,
    latitude:  22.55329,
    longitude: 113.88308,
		markers: [
			{
				id: 1,
				latitude: 22.55329,
				longitude: 113.88308,
				width: 16,
				height:16,
				iconPath: '/assets/images/maker-car.png',
			}
		]
	},
	onLoad() {
		this.onCurpostion('init');
    this.loadAvatarUrl();
    // this.updateMaker();
	},
  loadAvatarUrl( ) {
    wx.getUserInfo({
      success: (res) => {
        var userInfo = res.userInfo
        console.log(userInfo)
        this.setData({
          avatarUrl: userInfo.avatarUrl,
        })
      }
    })
  },
	onCurpostion(type) {
		wx.getLocation({
      type:'gcj02',
      success:res=>{
          this.setData({
            longitude: res.longitude,
            latitude: res.latitude
          })
      },
			fail: ()=> {
				this.setData({
					latitude: 39.92,
					longitude: 116.46,
				}, () => {
					type !== 'init' && wx.showToast(
						{
							title: '授权定位',
							icon: 'none',
						}
					)
				})
			}
    })
	},
	onScanUse() {
		wx.scanCode({
			complete () {
				// wx.navigateTo({
				// 	url: '/pages/register/index',})
					wx.navigateTo({
						url: '/pages/unlock/index',})
			}
		})
	},
  updateMaker() {
    const mapContext = wx.createMapContext('map')
    let { longitude, latitude} = this.data;
    console.log(longitude, latitude)
    const update = () => {
      longitude =  longitude + 1
      latitude = latitude + 1
      mapContext.translateMarker({
        markerId: 1,
        destination: {
          longitude,
          latitude,
        },
        duration: 2000,
        animationEnd: ()=> {

          update()
        }
      })
    }
    update()
  }
})
