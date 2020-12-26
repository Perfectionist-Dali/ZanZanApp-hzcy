App({
  globalData: {
    userInfo: null,
    hasLogin: false,
    openid: '', //用户openid
    userId: '', //用户编号
    updateUserFlag:"",//修改个人信息变量
  },

  server: {
    //local
    hostUrl:"http://192.168.1.6:8888",
    imageHost:"http://192.168.1.6:8080",
    WS_URL:"ws://192.168.1.6:8888/websocket/"

    //pro
    // hostUrl:"http://123.57.212.164:8088/zanzan",
    // imageHost:"http://123.57.212.164:8081/",
    // WS_URL:"ws://123.57.212.164:8088/zanzan/websocket/"
  },

  onLaunch: function () {
    var that = this;
    console.log('App Launch');
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     traceUser: true,
    //   })
    // }
    this.globalData = {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    console.log("-------------------------------------------------------");
  }
})