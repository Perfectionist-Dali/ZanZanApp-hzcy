const app = getApp()

var loginData = {
  /**
   * 获取用户信息
   * @param {number} flag - 登录失败时，是否提示
   */
  getWXUserLoginInfo: function (flag) {
    wx.getUserInfo({
      success: function (resUserInfo) {
        console.log("===resUserInfo==");
        console.log(resUserInfo);
        wx.request({
          url: app.server.hostUrl + '/userLogin/decodeUserInfo',
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          data: {
            apiName: 'WX_DECODE_USERINFO',
            encryptedData: resUserInfo.encryptedData,
            iv: resUserInfo.iv,
            sessionId: wx.getStorageSync('LoginSessionKey'),
          },
          success: function (resultUserInfo) {
            //解密后的数据
            console.log(resultUserInfo)
            if(resultUserInfo.data.status == "0" && resultUserInfo.data.message == "success"){
              if(null != resultUserInfo.data.resData.userId && "" != resultUserInfo.data.resData.userId){
                wx.setStorageSync('logonUserId', resultUserInfo.data.resData.userId);
              }
              //获取用户信息成功，允许登录
              if(flag == 2){
                wx.redirectTo({
                  url: "/pages/zanzan/zanzan"
                });
              }
              
            }else{
              if(flag == 1){
                wx.showModal({
                  title: '登录',
                  showCancel:false,
                  content: '登录失败！请稍后再试！'
                })
              }
            }
          },
        })
      }
    })
  }

}

module.exports = loginData;