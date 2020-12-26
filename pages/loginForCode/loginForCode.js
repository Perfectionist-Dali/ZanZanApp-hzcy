// miniprogram/pages/loginForCode.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMobile:"",
    code:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      userMobile:options.userMobile,
      code:options.code
    });

    /** 
     * TODO
     * 后台服务随机生成6位的短信验证码，并存到Redis中，有效期3分钟；
     */
    wx.showModal({
      title:'验证码',
      content:'【赞赞】验证码：'+options.code+'，您正在注册赞赞手机帐号（若非本人操作，请删除本短信）',
      showCancel: false,
      success:function(res) {
       if(res.confirm) {
        console.log('用户点击确定');
        that.setData({
          code:options.code
        })
       }
      }
    },2000);
  },

  /**
   * 提交表单
   * @param {} e 
   */
  formSubmit: function (e) {
    var that=this;
    console.log('验证码登录表单信息：', e);
    console.log('获取验证码的手机号：', that.data.userMobile);
    console.log('输入的验证码：', e.detail.value.smsCode);

    //验证验证码
    wx.request({
      url: app.server.hostUrl + '/userLogin/checkLoginBySMSCode',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        userMobile:that.data.userMobile,
        code: e.detail.value.smsCode,
        loginCodeSessionId:wx.getStorageSync('LoginSessionKey')
      },
      success: function (loginRes) {
        console.info(loginRes);
        if(loginRes.data.status == "0" && loginRes.data.message == "success"){
          if(null != loginRes.data.resData.userId && "" != loginRes.data.resData.userId){
            wx.setStorageSync('logonUserId', loginRes.data.resData.userId);
          }
          //验证码验证成功，允许登录
          wx.reLaunch({
            url: "/pages/zanzan/zanzan"
          });
        }else{
          console.log(loginRes.data.messageInfo);
          wx.showModal({
            title: '登录',
            showCancel:false,
            content: loginRes.data.messageInfo
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '登录',
          showCancel:false,
          content: '系统错误！请稍后再试！'
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})