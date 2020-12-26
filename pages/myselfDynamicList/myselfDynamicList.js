const app = getApp();
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,//图片服务地址
    loadingmore:true,//正在加载更多用户
    userId:"",
    dynamicList:[], //动态列表数据
    pages:0,//页数
    dynamicNoticeNum:0,//动态的通知数量
    dynamicListMarginTop:20,
    logonUserId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let userId = options.userId;
    let messageNums = options.messageNums;
    var logonUserId = wx.getStorageSync('logonUserId');
    console.log(messageNums);
    self.setData({
      userId:userId,
      dynamicNoticeNum:messageNums,
      logonUserId:logonUserId
    });
    //查询新消息通知
    if(self.data.dynamicNoticeNum > 0){
      self.setData({
        dynamicListMarginTop:50
      });
    }

    //加载用户动态列表
    self.loadUserDynamicList(userId,logonUserId);
  },

    /**
   * 查看我的消息
   */
  showMyMessageInfo: function (e) {
    var that = this;
    let userId = e.currentTarget.dataset.userid;
    that.setData({
      //dynamicNoticeNum:0,
      dynamicListMarginTop:20
    });
    wx.navigateTo({ 
      url: "../messageInfo/messageInfo?userId="+userId
    })
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
  loadUserDynamicList: function (userId,logonUserId) {
    var self = this;
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
   * 删除我的动态
   * @param {} e 
   */
  deleteDynamic:function (e) {
    var that = this;
    let dynamicId =  e.currentTarget.dataset.dynamicid;
    let dynamicIndex = e.currentTarget.dataset.index;
    Dialog.confirm({
      title: '删除动态',
      message: '确定删除该条动态吗？',
    })
      .then(() => {
        // on confirm
        console.log(dynamicId);
        let logonUserId = wx.getStorageSync('logonUserId');

        //删除操作
        wx.request({
          url: app.server.hostUrl + '/dynamic/deleteDynamic',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            dynamicId:dynamicId,
            logonUserId:logonUserId,
            sessionId: wx.getStorageSync('LoginSessionKey')
          },
          success: function (sucData) {
            //后台返回结果
            console.log(sucData)
            if(sucData.data.status == "1" && sucData.data.message == "success"){
              //改变列表动态
              that.data.dynamicList.splice(dynamicIndex,1);
              that.setData({
                dynamicList:that.data.dynamicList
              })
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
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
                  content: '操作失败'
                })
              }
            }
          },
          fail: function (infoRes) {
            wx.showModal({
              title: '提示信息',
              showCancel:false,
              content: '操作失败'
            })
          }
        });

        
      })
      .catch(() => {
        // on cancel
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