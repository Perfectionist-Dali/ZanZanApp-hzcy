const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    userId:"",
    showTitle:"",
    dynamicList:[], //动态列表数据
    userImageUrl:"",//会员头像
    pages:0,//页数
    titleFontSize:17
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let userId = options.userId;
    let userNickName = options.userNickName;
    let dynamicCount = options.dynamicCount;
    let userImageUrl = options.userImageUrl;

    let screenWidth = wx.getSystemInfoSync().windowWidth;
    if(screenWidth < 350){
      self.setData({
        titleFontSize:15
      })
    }
    self.setData({
      showTitle:userNickName+" 发布了"+dynamicCount+"个动态",
      userImageUrl:userImageUrl,
      userId:userId
    });
    //加载用户动态列表
    self.loadUserDynamicList(userId);
  },

    /**
   * 加载更多评论
   */
  loadMoreDynamicList:function(e){
    var self = this;
    self.setData({
      loadingmore:true
    })
    let lastDynamicTime;
    if(null != self.data.dynamicList && self.data.dynamicList.length > 0){
      lastDynamicTime=self.data.dynamicList.slice(-1)[0].dynamicCreateTime;
    }
    console.log(lastDynamicTime);
    self.loadUserDynamicList(self.data.userId,lastDynamicTime);
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

  /**
   * 加载用户动态列表
   */
  loadUserDynamicList: function (userId) {
    var self = this;
    var logonUserId = wx.getStorageSync('logonUserId');
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadUserDynamicList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        userId:userId,
        logonUserId:logonUserId,
        pages:self.data.pages,
        screenWidth:wx.getSystemInfoSync().windowWidth
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载用户动态列表：");
        console.log(infoData);
        self.data.pages = ++self.data.pages;
        self.setData({
          pages:self.data.pages
        });
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.dynamicList || self.data.dynamicList.length == 0 ){
              self.setData({
                dynamicList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.dynamicList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                dynamicList: tempArray
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