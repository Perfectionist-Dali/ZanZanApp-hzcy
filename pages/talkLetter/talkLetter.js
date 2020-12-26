const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    value: '',
    userList:[], //用户列表数据
    initiatId:"",//会话ID
    talkUserId:"",//对话对象ID
    headimageurl:"",//对话对象头像
    nickname:"",//对话对象昵称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let initiatId = options.initiatId;
    let talkUserId = options.talkUserId;
    let headimageurl = options.headimageurl;
    let nickname = options.nickname;
    let logonUserId = wx.getStorageSync('logonUserId');

    console.log("initiatId=="+initiatId);
    console.log("talkUserId=="+talkUserId);
    console.log("headimageurl=="+headimageurl);
    console.log("logonUserId=="+logonUserId);

    self.setData({
      initiatId:initiatId,
      talkUserId:talkUserId,
      headimageurl:headimageurl,
      nickname:nickname
    })
    wx.setNavigationBarTitle({
      title: nickname
    })
    //加载私信对话记录，并置为已读
    self.loadUserList(talkUserId,selfInterestNumType);
  },

  onChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
  },


  /**
   * 加载点赞用户列表
   */
  loadUserList: function (userId,selfInterestNumType) {
    var self = this;
    var pages = 0;
    var limit = 10;
    wx.request({
      url: app.server.hostUrl + '/userInfo/showFansOrWatchSbUserList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        userId:userId,
        selfInterestNumType:selfInterestNumType,
        pages:pages
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载会员粉丝、关注的人：");
        console.log(infoData);
        pages++;
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.userList || self.data.userList.length == 0 ){
              self.setData({
                userList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.userList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                userList: tempArray
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