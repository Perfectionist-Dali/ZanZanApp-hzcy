const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多
    noticeList:[], //通知
    pages:0,//页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let userId = options.userId;
    console.log(userId);
    //加载通知列表数据
    self.loadNoticeList(userId,'');
  },

  /**
   * 加载通知列表
   */
  loadNoticeList: function (userId) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/userInfo/querySysNotice',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        userId: userId,
        pages:self.data.pages,
        screenWidth:wx.getSystemInfoSync().windowWidth
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载通知列表：");
        console.log(infoData);
        self.data.pages = ++self.data.pages;
        self.setData({
          pages:self.data.pages
        });
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.noticeList || self.data.noticeList.length == 0 ){
              self.setData({
                noticeList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.noticeList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                noticeList: tempArray
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
        console.log("加载通知失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载通知失败'
        })
      }
    });
  },

  /**
   * 通知详情
   * @param {} e 
   */
  showNotice: function (e) {
    let noticeIndex = e.currentTarget.dataset.index;
    let noticeDetailsParams = JSON.stringify(this.data.noticeList[noticeIndex]);
    wx.navigateTo({
      url: "../sysNoticeDetails/sysNoticeDetails?noticeDetails="+noticeDetailsParams+"&noticeIndex="+noticeIndex
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