const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多
    msgList:[] //消息列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let userId = options.userId;
    console.log(userId);
    //加载消息列表数据
    self.loadMsgList(userId,'');
  },

  /**
   * 加载消息列表
   */
  loadMsgList: function (userId,lastMsgTime) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadMsgList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        userId: userId,
        lastMsgTime:lastMsgTime
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载消息数据：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.msgList || self.data.msgList.length == 0 ){
              self.setData({
                msgList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.msgList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                msgList: tempArray
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
   * 动态信息详情
   * @param {} e 
   */
  showDynamicDetails: function (e) {
    var that = this;
    let dynamicId =  e.currentTarget.dataset.dynamicid;
    let msgnum = e.currentTarget.dataset.msgnum;
    let msgtype = e.currentTarget.dataset.msgtype;
    let msgIndex = e.currentTarget.dataset.index;
    //修改消息已读状态
    wx.request({
      url: app.server.hostUrl + '/dynamic/updateMsgRead',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dynamicId:dynamicId,
        msgType:msgtype,
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          that.data.msgList.splice(msgIndex, 1);
          that.setData({
            msgList:that.data.msgList
          })
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let prevPage = pages[pages.length-2];
          prevPage.data.dynamicNoticeNum = prevPage.data.dynamicNoticeNum - msgnum;
          prevPage.setData({
            dynamicNoticeNum:prevPage.data.dynamicNoticeNum
          });

          let dynamic_pages = getCurrentPages();
          let selfDynamicPage = dynamic_pages[dynamic_pages.length-3];
          if(typeof(selfDynamicPage.data.messageNums) != "undefined"){
            selfDynamicPage.data.messageNums = selfDynamicPage.data.messageNums - msgnum;
            selfDynamicPage.setData({
              messageNums:selfDynamicPage.data.messageNums,
              messageTotalNums:selfDynamicPage.data.messageNums+selfDynamicPage.data.noticeNotReadNums+selfDynamicPage.data.letterNotReadNums
            });
          }
          
          wx.navigateTo({
            url: "../dynamicDetails/dynamicDetails?dynamicId="+dynamicId
          });
          wx.removeStorageSync('syncCommentContent');
        }else{
          if(sucData.data.status == "-1" && sucData.data.messageInfo == "登录已超时，请重新登录"){
            wx.showModal({
              title:'提示信息',
              content:infoRes.data.messageInfo,
              showCancel: false,
              success:function(res) {
                if(res.confirm) {
                  wx.reLaunch({
                    url: "/pages/index/index"
                  });
                }
              }
            },2000);
          }else{
            wx.showModal({
              title: '提示信息',
              showCancel:false,
              content: '读取消息失败'
            })
          }
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示信息',
          showCancel:false,
          content: '读取消息失败'
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