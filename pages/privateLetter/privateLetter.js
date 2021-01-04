const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    letterInitiatList:[],//私信列表
    letterNotReadNums:0,
    logonUserNickname:"",
    logonUserHeadImage:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let letterNotReadNums = options.letterNotReadNums;
    let logonUserNickname = options.logonUserNickname;
    let logonUserHeadImage = options.logonUserHeadImage;
    console.log("===logonUserNickname==="+logonUserNickname);
    console.log("===logonUserHeadImage==="+logonUserHeadImage);
    self.setData({
      letterNotReadNums:letterNotReadNums,
      logonUserNickname:logonUserNickname,
      logonUserHeadImage:logonUserHeadImage
    })
    //加载私信列表数据
    self.onLetterInitiatList();
  },

  /**
   * 加载私信列表数据
   */
  onLetterInitiatList: function (e) {
    var self = this;
    var pages = 0;
    var limit = 10;
    wx.request({
      url: app.server.hostUrl + '/letter/queryLetterInitiatList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        logonUserId:wx.getStorageSync('logonUserId'),
        pages:pages
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载私信列表数据：");
        console.log(infoData);
        pages++;
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.letterInitiatList || self.data.letterInitiatList.length == 0 ){
              self.setData({
                letterInitiatList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.letterInitiatList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                letterInitiatList: tempArray
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
        console.log("加载私信列表失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载私信列表失败'
        })
      }
    });
  },

  /**
   * 回复私信
   * @param {} e 
   */
  onTalkLetter:function(e){
    var that = this;
    let initiatId = e.currentTarget.dataset.initiatid;
    let talkUserId = e.currentTarget.dataset.talkuserid;
    let headimageurl = e.currentTarget.dataset.headimageurl;
    let nickname = e.currentTarget.dataset.nickname;
    let notreadnums = e.currentTarget.dataset.notreadnums;
    let letterindex = e.currentTarget.dataset.letterindex;
    console.log(that.data.logonUserNickname);
    console.log(that.data.logonUserHeadImage);
    wx.navigateTo({
      url: "../talkLetter/talkLetter?initiatId="+initiatId+"&talkUserId="+talkUserId+"&headimageurl="+headimageurl+"&nickname="+nickname+"&notreadnums="+notreadnums+"&letterindex="+letterindex+"&logonUserNickname="+that.data.logonUserNickname+"&logonUserHeadImage="+that.data.logonUserHeadImage
    })
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
    var that=this;
    wx.onSocketMessage(function (res) {
      console.log("==talkContent=="+res.data);
      if(null != res.data && "" != res.data){
        var justTalkObj = JSON.parse(res.data);
        console.log(justTalkObj);
        if(null != that.data.letterInitiatList && that.data.letterInitiatList.length > 0){
          for(let i=0;i<that.data.letterInitiatList.length;i++){
            if(that.data.letterInitiatList[i].talkUserId == justTalkObj[0].sendUserId){
              ++that.data.letterInitiatList[i].notReadNums;
              if(justTalkObj[0].content.length > 10){
                that.data.letterInitiatList[i].lastTalkContent=justTalkObj[0].content.substring(0, 10)+"...";
              }
              that.data.letterInitiatList[i].lastTalkTime=justTalkObj[0].sendTimeFormat;
              that.setData({
                letterInitiatList:that.data.letterInitiatList
              });

              let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              //改变列表未读消息数
              let rePrevPage = pages[pages.length-2];
              ++rePrevPage.data.letterNotReadNums;
              rePrevPage.setData({
                letterNotReadNums:rePrevPage.data.letterNotReadNums,
                messageTotalNums:rePrevPage.data.messageNums+rePrevPage.data.noticeNotReadNums+rePrevPage.data.letterNotReadNums
              })
              break;
            }
          }
        }
      }
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
    })
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