const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toView:"",//定位到页面某个位置
    imageHost:app.server.imageHost,//图片服务地址
    commentId:"",
    commentIndex:"",
    clickAgree:false,
    commentInfo:[],
    loadingmore:true,//正在加载更多图标
    agreeNum:0,//点赞数量
    replyNum:0,//回复数
    replyList:[] //回复列表数据

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    let commentId = options.commentId;
    let commentIndex = options.commentIndex;
    let clickAgree = options.clickAgree;
    console.log(clickAgree);
    console.log(commentId);
    try {
      self.setData({
        commentId:commentId
      })
      wx.request({
        url: app.server.hostUrl + '/dynamic/getCommentDetails',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey'),
          commentId: options.commentId
        },
        success: function (infoData) {
          //后台返回结果
          console.log("评论详情信息：");
          console.log(infoData);
          if(infoData.data.status == "1" && infoData.data.message == "success"){
            if(null != infoData.data.resData){
              self.setData({
                commentInfo:infoData.data.resData,
                agreeNum:infoData.data.resData.agreeNum,
                replyNum:infoData.data.resData.replyNum,
                clickAgree:clickAgree,
                commentIndex:commentIndex
              });
              
              // var query = wx.createSelectorQuery();
              // query.select('#commentTitle').boundingClientRect(function (res) {
              //     self.setData({
              //       commentListTop:res.top
              //     })
              // }).exec();
            }
          }else{
            console.log(infoData.data.messageInfo);
            if(infoData.data.status == "-2"){
              //wx.removeStorageSync('LoginSessionKey');
              wx.reLaunch({
                url: "../index/index"
              });
            }
          }
        },
        complete:function(res){
          //加载回复列表数据
          self.loadReplyList(options.commentId,'');
        },
        fail: function (failRes) {
          console.log("获取评论详情失败：");
          console.log(failRes);
          wx.showModal({
            title: '',
            showCancel:false,
            content: '获取评论详情失败'
          })
        }
      });
    } catch (e) {
      wx.showToast({
        title: "获取评论详情失败",
        image: "../../images/error.png"
      })
    };
  },

  /**
   * 点赞评论
   * @param {*} e 
   */
  onAgreeComment:function(e){
    var that = this;
    let commentId = e.currentTarget.dataset.commentid;
    let commentIndex = e.currentTarget.dataset.commentindex;
    let commentuserid = e.currentTarget.dataset.commentuserid;
    let clickAgree = e.currentTarget.dataset.clickagree;

    //true点赞，false取消点赞
    if(clickAgree == true || clickAgree == "true"){
      clickAgree = false;
    }else if(clickAgree == false || clickAgree == "false"){
      clickAgree = true;
    }

    //点赞评论
    wx.request({
      url: app.server.hostUrl + '/dynamic/agreeComment',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        commentId:commentId,
        commentUserId:commentuserid,//用来通知评论作者被点赞（功能保留）
        clickAgree:clickAgree,
        agreeType:"agreeComment",//dynamicAgree点赞动态,agreeComment点赞评论，reply点赞评论回复
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          //改变点赞图标、以及数量
          if(clickAgree == true){
            ++that.data.agreeNum;
            that.data.clickAgree = true;
          }else if(clickAgree == false){
            --that.data.agreeNum;
            that.data.clickAgree = false;
          }
          that.setData({
            agreeNum:that.data.agreeNum,
            clickAgree:that.data.clickAgree
          })
          //更新动态详情页评论点赞信息
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let prevPage = pages[pages.length-2];
          prevPage.data.dynamicCommentList[commentIndex].agreeNum = that.data.agreeNum;
          prevPage.data.dynamicCommentList[commentIndex].clickAgree = that.data.clickAgree;
          prevPage.setData({
            dynamicCommentList:prevPage.data.dynamicCommentList
          })


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
              content: '点赞失败'
            })
          }
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示信息',
          showCancel:false,
          content: '点赞失败'
        })
      }
    });
  },

  /**
   * 加载评论列表
   */
  loadReplyList: function (commentId,lastReplyTime) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadReplyList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        commentId: commentId,
        lastReplyTime:lastReplyTime
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载回复数据：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.replyList || self.data.replyList.length == 0 ){
              self.setData({
                replyList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.replyList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                replyList: tempArray
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
   * 加载更多评论
   */
  loadMoreReply:function(e){
    var self = this;
    self.setData({
      loadingmore:true
    })
    let lastReplyTime;
    if(null != self.data.replyList && self.data.replyList.length > 0){
      lastReplyTime=self.data.replyList.slice(-1)[0].commentTime;
    }
    console.log(lastReplyTime);
    self.loadReplyList(self.data.commentId,lastReplyTime);
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