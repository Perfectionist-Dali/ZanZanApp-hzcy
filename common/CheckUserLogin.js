const app = getApp()

var loginData = {
  /**
   * 验证用户是否登录
   */
  checkUserLogon: function () {
    console.log(wx.getStorageSync('LoginSessionKey'));
    if(wx.getStorageSync('LoginSessionKey')){
      wx.request({
        url: app.server.hostUrl + '/userLogin/checkLogin',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey'),
          logonUserId:wx.getStorageSync('logonUserId')
        },
        success: function (loginRes) {
          //解密后的数据
          console.log(loginRes)
          if(loginRes.data.status != "0" && loginRes.data.resData.logonStatus != "logon"){
            //获取用户登录信息失败
            wx.removeStorageSync('LoginSessionKey');
            wx.reLaunch({
              url: "../index/index"
            });
          }else{
            console.log("用户已登录");
            if(typeof loginRes.data.resData.logonUserNickname == "undefined" || loginRes.data.resData.logonUserNickname == ""){
              wx.reLaunch({
                url: "../userInfoSupply/userInfoSupply"
              });
            }
          }
        },
        fail: function () {
          wx.removeStorageSync('LoginSessionKey');
          wx.reLaunch({
            url: "../index/index"
          });
        }
      });
    }else{
      wx.removeStorageSync('LoginSessionKey');
      wx.reLaunch({
        url: "../index/index"
      });
    }
  }


}

module.exports = loginData;