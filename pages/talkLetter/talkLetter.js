const app = getApp();
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    userList:[], //用户列表数据
    initiatId:"",//会话ID
    talkUserId:"",//对话对象ID
    logonUserId:"",
    logonUserNickname:"",
    logonUserHeadImage:"",
    headimageurl:"",//对话对象头像
    nickname:"",//对话对象昵称
    notreadnums:0,//未读消息数量
    letterindex:"",//某通私信对话坐标
    toShowMessageView:'',//显示位置
    lettersList:[],//私信聊天列表
    letterContent:"",//发送的私信内容
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
    let notreadnums = options.notreadnums;
    let letterindex = options.letterindex;
    let logonUserId = wx.getStorageSync('logonUserId');
    let logonUserNickname = options.logonUserNickname;
    let logonUserHeadImage = options.logonUserHeadImage;

    self.setData({
      initiatId:initiatId,
      talkUserId:talkUserId,
      logonUserId:logonUserId,
      logonUserNickname:logonUserNickname,
      logonUserHeadImage:logonUserHeadImage,
      headimageurl:headimageurl,
      nickname:nickname,
      notreadnums:notreadnums,
      letterindex:letterindex,
    })
    wx.setNavigationBarTitle({
      title: nickname
    })

    //未读消息置为已读
    if(notreadnums > 0){
      self.messageIsRead(initiatId,logonUserId);
    }

    //加载私信对话记录
    self.loadMoreHistoryLetter(initiatId);
  },

    /**
   * 创建WebSocket连接
   */
  onWebSocket: function (logonUserId) {
    var that = this;
    // wx.connectSocket({
    //   url: app.server.WS_URL+logonUserId,
    //   success:function(res){
    //     console.log(res);
    //     if (res.errMsg == "connectSocket:ok"){
    //       console.log("开始建立连接！");
    //     }else{
    //       console.log("建立连接失败！");
    //     } 
    //   },
    //   fail:function(res){
    //     console.log(res);
    //   }
    // })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })
    wx.onSocketMessage(function (res) {
      console.log("==websocketReceiveLetter=="+res.data);
      if(null != res.data && "" != res.data){
        var jsonObj = JSON.parse(res.data);
        
      }
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
    })
  },

  /**
   * 输入私信内容
   * @param {*} event 
   */
  onChangeLetterContent(event) {
    // event.detail 为当前输入的值
    var that = this;
    that.setData({
      letterContent:event.detail
    })
  },

  /**
   * 发送私信
   * @param {*} e 
   */
  onSendLetter: function (e) {
    var that = this;
    console.log('私信内容：', that.data.letterContent);
    if("" == that.data.letterContent){
      Toast("请输入要发的内容");
      return false;
    }
    if(that.data.letterContent.length > 300){
      Toast("一次发的内容不能超过300字");
      return false;
    }
    wx.request({
      url: app.server.hostUrl + '/letter/sendLetter',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        initiatId:that.data.initiatId,
        sendUserId:that.data.logonUserId,
        receiveUserId:that.data.talkUserId,
        letterContent:that.data.letterContent,
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          that.setData({
            letterContent:"",
          })
          wx.showToast({
            title:"已发送",
            icon: 'success',
            duration: 2000,
            success:function(){
            },
            fail:function(){},
            complete:function(){
              that.data.lettersList.push(sucData.data.resData);
              that.setData({
                lettersList:that.data.lettersList,
              })
            }
          });
          that.setData({
            toShowMessageView:"LetterContent"
          })
        }else{
          var messageInfo = "发送失败；";
            messageInfo = messageInfo + sucData.data.messageInfo;
            wx.showModal({
              title: '提示信息',
              showCancel:false,
              content: messageInfo
            });
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示信息',
          showCancel:false,
          content: '发送失败'
        })
      }
    });
  },

  /**
   * 未读消息置为已读
   * @param {会话ID} initiatId 
   */
  messageIsRead:function(initiatId,logonUserId){
    var that = this;
    //删除操作
    wx.request({
      url: app.server.hostUrl + '/letter/messageIsRead',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        initiatId:initiatId,
        logonUserId:that.data.logonUserId
      },
      success: function (sucData) {
        //已读
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let prevPage = pages[pages.length-2];
          prevPage.data.letterNotReadNums = prevPage.data.letterNotReadNums - that.data.notreadnums;
          if(prevPage.data.letterNotReadNums >= 0){
            prevPage.setData({
              letterNotReadNums:prevPage.data.letterNotReadNums
            })
          }
          prevPage.data.letterInitiatList[that.data.letterindex].notReadNums = 0;
          prevPage.setData({
            letterInitiatList:prevPage.data.letterInitiatList
          })

          //改变列表未读消息数
          let rePrevPage = pages[pages.length-3];
          if(rePrevPage.data.letterNotReadNums > 0){
            rePrevPage.data.letterNotReadNums = rePrevPage.data.letterNotReadNums - that.data.notreadnums;
            rePrevPage.setData({
              letterNotReadNums:rePrevPage.data.letterNotReadNums,
              messageTotalNums:rePrevPage.data.messageNums+rePrevPage.data.noticeNotReadNums+rePrevPage.data.letterNotReadNums
            })
          }
        }
      }
    });
  },

  /**
   * 加载历史聊天
   */
  loadMoreHistoryLetter:function(e){
    var self = this;
    self.setData({
      loadingmore:true
    })
    let lastLetterSendTime = "";
    if(null != self.data.lettersList && self.data.lettersList.length > 0){
      lastLetterSendTime=self.data.lettersList.slice(0,1)[0].sendTime;
    }
    let initiatId = self.data.initiatId;
    console.log("lastLetterSendTime=="+lastLetterSendTime);
    self.loadLetters(initiatId,lastLetterSendTime);
  },

  /**
   * 加载私信记录
   */
  loadLetters: function (initiatId,lastLetterSendTime) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/letter/loadLetterContents',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        initiatId: initiatId,
        lastLetterSendTime:lastLetterSendTime
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载私信记录：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.lettersList || self.data.lettersList.length == 0 ){
              self.setData({
                lettersList:infoData.data.resData
              });

              if(self.data.toShowMessageView == ""){
                self.setData({
                  toShowMessageView:"LetterContent"+infoData.data.resData.slice(-1)[0].id
                })
              }

            }else{
              var tempArray = [];
              tempArray = tempArray.concat(infoData.data.resData).concat(self.data.lettersList);
              console.log(tempArray);
              self.setData({
                lettersList: tempArray
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
        console.log("加载私信记录失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载私信记录失败'
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
    var self = this;
    var logonUserId = wx.getStorageSync('logonUserId');
    this.onWebSocket(logonUserId);
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