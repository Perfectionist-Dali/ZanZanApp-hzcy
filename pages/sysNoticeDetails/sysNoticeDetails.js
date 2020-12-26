const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeInfo:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var noticeIndex = options.noticeIndex;
    console.log(JSON.parse(options.noticeDetails));
    that.setData({
      noticeInfo:JSON.parse(options.noticeDetails)
    });
    console.log(that.data.noticeInfo.id);
    if(that.data.noticeInfo.readTime == 'no-read'){
      that.onReadNoticeInfo(that.data.noticeInfo.id);
    }

    //改变通知列表已读状态
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length-2];
    prevPage.data.noticeList[noticeIndex].readTime = "";
    prevPage.setData({
      noticeList:prevPage.data.noticeList
    })

    //改变列表未读消息数
    let rePrevPage = pages[pages.length-3];
    if(rePrevPage.data.noticeNotReadNums > 0){
      --rePrevPage.data.noticeNotReadNums;
      rePrevPage.setData({
        noticeNotReadNums:rePrevPage.data.noticeNotReadNums,
        messageTotalNums:rePrevPage.data.messageNums+rePrevPage.data.noticeNotReadNums
      })
    }
  },

  /**
   * 读取通知信息
   * @param {} e 
   */
  onReadNoticeInfo:function (noticeId) {
    var that = this;
    let logonUserId = wx.getStorageSync('logonUserId');
    //删除操作
    wx.request({
      url: app.server.hostUrl + '/userInfo/readNoticeInfo',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        noticeId:noticeId,
        logonUserId:logonUserId,
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          console.log("已读取通知");
        }
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