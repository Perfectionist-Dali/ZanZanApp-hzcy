const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    imageHostURL:app.server.imageHost,
    searchResult:[],
    searchUserList:0,
    searchUserListNums:0,
    searchDynamicList:0,
    searchDynamicListNums:0
  },

  onChange(e) {
    console.log(e.detail);
    this.setData({
      value: e.detail,
    });
  },

  /**
   * 点击搜索按钮
   * @param {*} e 
   */
  onSearch(e) {
    console.log(e.detail);//搜索条件
    var self = this;
    self.setData({
      searchDynamicList:[],
      searchDynamicListNums:0,
      searchUserList:[],
      searchUserListNums:0
    })
    wx.request({
      url: app.server.hostUrl + '/dynamic/searchUsersOrDynamics',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        searchWords:e.detail,
        screenWidth:wx.getSystemInfoSync().windowWidth
      },
      success: function (infoData) {
        //后台返回结果
        console.log("搜索结果：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData.dynamicInfoListObj && typeof infoData.data.resData.dynamicInfoListObj != "undefined"){
            self.setData({
              searchDynamicList:infoData.data.resData.dynamicInfoListObj,
              searchDynamicListNums:infoData.data.resData.dynamicInfoListNums
            })
          }
          if(null != infoData.data.resData.userInfoArrObj && typeof infoData.data.resData.userInfoArrObj != "undefined"){
            self.setData({
              searchUserList:infoData.data.resData.userInfoArrObj,
              searchUserListNums:infoData.data.resData.userInfoArrObjNums
            })
          }
        }
      },
      fail: function (failRes) {
        console.log("搜索失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '搜索失败'
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
   * 动态详情
   * @param {} e 
   */
  showDynamicDetails: function (e) {
    let dynamicId =  e.currentTarget.dataset.dynamicid;
    wx.navigateTo({
      url: "../dynamicDetails/dynamicDetails?dynamicId="+dynamicId
    });
    wx.removeStorageSync('syncCommentContent');
  },

  onCancel() {
    console.log('取消搜索' + this.data.value);
    wx.navigateBack({
      delta: 1
    })
  },
  onClick() {
    console.log('搜索' + this.data.value);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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