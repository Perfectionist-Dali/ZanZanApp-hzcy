const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    agreeNum:0,//点赞数量
    agreeUserList:[], //回复列表数据
    operateLabel:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let dynamicId = options.dynamicId;
    let operateType = options.operateType;
    if(operateType == 1){
      self.setData({
        operateLabel:"赞过"
      })
    }else if(operateType == 2){
      self.setData({
        operateLabel:"分享过"
      })
    }
    console.log(dynamicId);
    //加载点赞用户列表数据
    self.loadAgreeUserList(dynamicId,'',operateType);
  },

  /**
   * 加载点赞用户列表
   */
  loadAgreeUserList: function (dynamicId,lastAgreeTime,operateType) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadAgreeUserList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        dynamicId: dynamicId,
        operateType:operateType,
        lastAgreeTime:lastAgreeTime
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载点赞用户数据：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.agreeUserList || self.data.agreeUserList.length == 0 ){
              self.setData({
                agreeUserList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.agreeUserList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                agreeUserList: tempArray
              })
            }
          }
        }else{
          if(infoData.data.status == "-2"){
            wx.removeStorageSync('LoginSessionKey');
            wx.reLaunch({
              url: "../index/index"
            });
          }
        }
      },
      complete:function(res){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        self.setData({
          loadingmore:false
        })
      },
      fail: function (failRes) {
        console.log("加载回复失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载回复失败'
        })
      }
    });
  },

  /**
   * 查看会员主页信息
  */
  showUserInfo:function (e) {
    let userId = e.currentTarget.dataset.userid;
    console.log(userId);
    wx.navigateTo({ 
      url: "../userInfoCenter/userInfoCenter?userId="+userId
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