const getToken = function() {
  let client_id = ''
  let client_secret = ''
  let url =`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
  wx.request({
    url: url, //仅为示例，并非真实的接口地址
    method: 'POST',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success (res) {
      console.log(res.data)
    }
  })
}

const AT = ''

const getWord = function(AT, images) {
  let url = `https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token=${AT}`
  return new Promise((resolve, reject)=>{
    wx.request({
      url: url, //仅为示例，并非真实的接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        image: images
      },
      success (res) {
        console.log(res.data)
        resolve(res)
      }
    })

  })
}
export {
  getToken,
  AT,
  getWord,
}