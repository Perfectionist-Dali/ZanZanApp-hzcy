// miniprogram/pages/userRegist/userRegist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showView: true,
    code:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  registFormSubmit: function(data) {
    console.log(data.detail.value);
    var mobile = data.detail.value.mobile;
    var code = data.detail.value.code;
    var password = data.detail.value.password;
    var nickName = data.detail.value.nickName;
  },
  
  onImageTap: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
        that.setData({
          imageSrc: tempFilePaths[0]
        })
      }
    })
  },

  getCode:function(){
    var that = this;
    wx.showModal({
      title:'验证码',
      content:'【赞赞】验证码：366246，您正在注册赞赞手机帐号（若非本人操作，请删除本短信）',
      showCancel: false,
      success:function(res) {
       if(res.confirm) {
        console.log('用户点击确定');
        that.setData({
          code:"366246"
        })
       }
      }
     })
  },

  toNextStep:function(){
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
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