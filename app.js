var util = require('./utils/util.js');
App({
  globalData: {
    userInfo: null,
    hasLogin: false,
    openid: '', //用户openid
    userId: '', //用户编号
    updateUserFlag:"",//修改个人信息变量
    userWebSocketCode:""
  },

  server: {

    hostUrl:"https://server.zanzan100.com/zanzan",
    imageHost:"https://server.zanzan100.com",
    WS_URL:"wss://server.zanzan100.com/zanzan/websocket/"
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

    var timestamp = Date.parse(new Date());  
    timestamp = timestamp / 1000;
    console.log("WS"+timestamp+"_"+util.create_uuid());

    that.globalData.userWebSocketCode = "WS"+timestamp+"_"+util.create_uuid();
    console.log("======that.server.WS_URL+userWebSocketCode===="+that.server.WS_URL+that.globalData.userWebSocketCode);

    wx.connectSocket({
      url: that.server.WS_URL+that.globalData.userWebSocketCode,
      success:function(res){
        console.log(res);
        if (res.errMsg == "connectSocket:ok"){
          console.log("开始建立连接！");
        }else{
          console.log("建立连接失败！");
        } 
      },
      fail:function(res){
        console.log(res);
      }
    });
    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
      wx.connectSocket({
        url: that.server.WS_URL+that.globalData.userWebSocketCode,
      })
    });
    wx.onSocketOpen(function (res) {
      console.log('res=='+res)
      console.log('WebSocket连接已打开！')
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    console.log("-------------------------------------------------------");
  }

  
})