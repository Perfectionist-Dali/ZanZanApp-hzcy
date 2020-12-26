const app = getApp();
var loginData = require('../../common/CheckUserLogin.js');
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,
    dynamicListParams:[],//首页动态列表
    dynamicIndex:0,//动态在列表中的坐标
    dynamicId:"",//动态ID
    commentId:"",//评论ID
    message:"",
    focusInput: false,
    height: '',
    isInput: false,

    bottom:"0",
    msgContent:"",
    isWrite:false,
    isShowCommentText:false,
    placeholderWarning:"",//placeholder提示
    dynamicInfo:[],
    remainLen: 0,
    
    feedbackDynamicId:"",
    istrue: false,

    toView:'',  //显示区域
    isCommentListTop:false,
    commentListTop:0,
    dynamicCommentList:[], //评论列表
    loadingmore:true,//正在加载更多图标
    agreeNum:0,//点赞数量
    commentsNum:0,//评论数
    successComment:false,//评论未成功，输入框内容才放入缓存
    dynamicComplaintNums:0,
    logonUserId:"",
    createUserId:"",
    userNickname:"",

  },

  //详情页滑动事件
  scrollViewPage:function(e){
    if(e.detail.scrollTop >= this.data.commentListTop){
      this.setData({
        isCommentListTop:true
      })
    }else{
      this.setData({
        isCommentListTop:false
      })
    }
  },
  
  //评论
  showPopup(){
    this.setData({
      commentId:"",//评论动态，回复的评论ID置空
      isWrite:true,
      isShowCommentText:true
    });
  },
  toReply(e){
    let commentid =  e.currentTarget.dataset.commentid;
    console.log(commentid);
    wx.removeStorageSync('syncCommentContent');
    this.setData({
      commentId:commentid,
      isWrite:true,
      isShowCommentText:true
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    loginData.checkUserLogon();
    console.log(options.dynamicId);
    console.log(options.dynamicIndex);
    
    var logonUserId = wx.getStorageSync('logonUserId');
    that.setData({
      logonUserId:logonUserId
    })
    try {
      var self = this;
      let dynamicListParams = [];
      // if(null != options.dynamicListParams && "" != options.dynamicListParams){
      //   dynamicListParams = JSON.parse(options.dynamicListParams);
      // }
      self.setData({
        dynamicId:options.dynamicId,
        //dynamicListParams:dynamicListParams,
        dynamicIndex:options.dynamicIndex,
      })
      wx.request({
        url: app.server.hostUrl + '/dynamic/getDynamicInfoDetails',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey'),
          dynamicId: options.dynamicId
        },
        success: function (infoData) {
          //后台返回结果
          console.log("动态详情信息：");
          console.log(infoData);
          if(infoData.data.status == "1" && infoData.data.message == "success"){
            if(null != infoData.data.resData){
              self.setData({
                dynamicInfo:infoData.data.resData,
                agreeNum:infoData.data.resData.agreeNum,
                commentsNum:infoData.data.resData.commentNum
              });
              var query = wx.createSelectorQuery();
              query.select('#commentTitle').boundingClientRect(function (res) {
                  //console.log(res);
                  self.setData({
                    commentListTop:res.top
                  })
              }).exec();
            }
          }else{
            console.log(infoData.data.messageInfo);
            if(infoData.data.status == "-2"){
              wx.removeStorageSync('LoginSessionKey');
              wx.reLaunch({
                url: "../index/index"
              });
            }
          }
        },
        complete:function(res){
          console.log(options.showCommentText);
          //从首页列表直接点评论
          if(options.showCommentText == 1){
            console.log(res);
            self.setData({
              isWrite:true,
              isShowCommentText:true,//显示评论框
            });
          };
          //加载评论
          self.loadDynamicCommentList(options.dynamicId,'');
        },
        fail: function (failRes) {
          console.log("获取动态详情失败：");
          console.log(failRes);
          wx.showModal({
            title: '',
            showCancel:false,
            content: '获取动态详情失败'
          })
        }
      });
    } catch (e) {
      console.log(e);
      wx.showToast({
        title: "获取动态详情失败",
        image: "../../images/error.png"
      })
    };
  },

  /**
   * 加载评论列表
   */
  loadDynamicCommentList: function (dynamicId,lastCommentTime) {
    var self = this;
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadDynamicCommentList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        dynamicId: dynamicId,
        lastCommentTime:lastCommentTime
      },
      success: function (infoData) {
        //后台返回结果
        console.log("加载评论数据：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.dynamicCommentList || self.data.dynamicCommentList.length == 0 ){
              self.setData({
                dynamicCommentList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              tempArray = tempArray.concat(self.data.dynamicCommentList).concat(infoData.data.resData);
              console.log(tempArray);
              self.setData({
                dynamicCommentList: tempArray
              })
            }
          }
        }else{
          console.log(infoData.data.messageInfo);
          self.setData({
            dataResWarning:infoData.data.messageInfo
          });
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
        console.log("加载评论失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载评论失败'
        })
      }
    });
  },

  /**
   * 加载更多评论
   */
  loadMoreComments:function(e){
    var self = this;
    self.setData({
      loadingmore:true
    })
    let lastCommentTime;
    if(null != self.data.dynamicCommentList && self.data.dynamicCommentList.length > 0){
      lastCommentTime=self.data.dynamicCommentList.slice(-1)[0].commentTime;
    }
    console.log(lastCommentTime);
    self.loadDynamicCommentList(self.data.dynamicId,lastCommentTime);
  },

  /**
   * 删除动态
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
              let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              let prevPage = pages[pages.length-2];
              prevPage.data.dynamicList.splice(dynamicIndex,1);
              prevPage.setData({
                dynamicList:prevPage.data.dynamicList
              })
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              //跳转到列表
              wx.navigateBack({
                delta: 1
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    var that = this;
    console.log(options);

    if(options.from == 'button'){
      let dynamicId = options.target.dataset.dynamicid;
      let dynamicIndex = options.target.dataset.dynamicindex;
      let username = options.target.dataset.username;
      let dynamicuserid = options.target.dataset.dynamicuserid;
      let url = encodeURIComponent("../dynamicDetails/dynamicDetails?dynamicId="+dynamicId+"&dynamicIndex="+dynamicIndex);
      console.log(url);
      that.shareDynamic(dynamicId,dynamicuserid,dynamicIndex);
      return {
        title: username+"的动态分享",
        path:`/pages/zanzan/zanzan?url=${url}`,
        success: function(res){
            console.log("onShareAppMessage-success");
            console.log(res);
  　　　　　　// 转发成功之后的回调
  　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
              Toast("转发成功");
              
  　　　　　　}
  　　　　},
  　　　　fail: function(res){
            console.log(res);
  　　　　　　// 转发失败之后的回调
  　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
  　　　　　　　　// 用户取消转发
                Toast("取消转发");
  　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
  　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
                Toast("转发失败");
  　　　　　　}
  　　　　},
  　　　　complete: function(res){
            console.log(res);
  　　　　　　// 转发结束之后的回调（转发成不成功都会执行）
  　　　　},
      }
      
    }else{
      return {
        title: "分享赞赞动态",
        path:`/pages/zanzan/zanzan`,
        success: function(res){
            console.log("topShareAppMessage-success");
            console.log(res);
  　　　　　　// 转发成功之后的回调
  　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
              Toast("转发成功");
  　　　　　　}
  　　　　},
  　　　　fail: function(){
  　　　　　　// 转发失败之后的回调
  　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
  　　　　　　　　// 用户取消转发
                Toast("取消转发");
  　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
  　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
                Toast("转发失败");
  　　　　　　}
  　　　　},
  　　　　complete: function(){
  　　　　　　// 转发结束之后的回调（转发成不成功都会执行）
  　　　　},
      }
    }
  },

  /**
   * 转发动态
   * @param {} e 
   */
  shareDynamic:function(dynamicId,dynamicuserid,dynamicIndex){
    var that = this;
    //点赞动态
    wx.request({
      url: app.server.hostUrl + '/dynamic/shareInfoDynamic',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dynamicId:dynamicId,
        dynamicUserId:dynamicuserid,
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          //改变转发数量显示
          ++that.data.dynamicInfo.sendOthersNum;
          that.setData({
            dynamicInfo:that.data.dynamicInfo
          })

          //变更列表分享数
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let prevPage = pages[pages.length-2];
          ++prevPage.data.dynamicList[dynamicIndex].sendOthersNum;
          prevPage.setData({
            dynamicList:prevPage.data.dynamicList
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
              content: '转发失败'
            })
          }
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示信息',
          showCancel:false,
          content: '转发失败'
        })
      }
    });
  },

  /**
   * 查看点赞用户列表
   */
  agreeUserList:function(e){
    var that = this;
    let dynamicId = e.currentTarget.dataset.dynamicid;
    console.log(dynamicId);
    wx.navigateTo({
      url: "../dynamicAgreeUsers/dynamicAgreeUsers?dynamicId="+dynamicId+"&operateType=1"
    })
  },

  /**
   * 查看分享的用户列表
   */
  shareUserList:function(e){
    var that = this;
    let dynamicId = e.currentTarget.dataset.dynamicid;
    console.log(dynamicId);
    wx.navigateTo({
      url: "../dynamicAgreeUsers/dynamicAgreeUsers?dynamicId="+dynamicId+"&operateType=2"
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
   * 查看评论下的所有回复
   * @param {} e 
   */
  showReplyList:function(e){
    let commentId =  e.currentTarget.dataset.commentid;
    let commentIndex =  e.currentTarget.dataset.commentindex;
    let clickAgree = e.currentTarget.dataset.clickagree;
    wx.navigateTo({
      url: "../commentReply/commentReply?commentId="+commentId+"&commentIndex="+commentIndex+"&clickAgree="+clickAgree
    })
  },

  //浏览图片
  previewImage: function(e){
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: e.currentTarget.dataset.urls // 需要预览的图片http链接列表
    })
  },

  //输入聚焦
  foucus: function (e){
    console.log("得到焦点");
    var that = this;
    that.setData({
      bottom: e.detail.height,
      placeholderWarning:"我来评论一下...",
      successComment:false
    });
    let syncCommentContent = wx.getStorageSync('syncCommentContent');
    if(null != syncCommentContent && "" != syncCommentContent){
      if(syncCommentContent.substr(syncCommentContent.length-1,1) == " "){
        that.setData({
          msgContent:syncCommentContent
        });
      }else{
        that.setData({
          msgContent:syncCommentContent+" "
        });
      }
      wx.removeStorageSync('syncCommentContent');
    }
  },

  //失去聚焦
  blur:function(e){
    console.log("失去焦点");
    var that = this;
    //只有未评论成功才放缓存
    if(!that.data.successComment){
      wx.setStorageSync('syncCommentContent', e.detail.value);
    }
    
    that.setData({
      placeholderWarning:"",
      isWrite: false,
      msgContent:"",
      bottom: 0
    })
  },

  /**
   * 显示可输入字数
   */
  inputCommentWordChange: function (e) {
    const t = e.detail.value
    const len = e.detail.value.length
    this.setData({
      msgContent: e.detail.value,
      remainLen: len
    });
  },

  //提交评论信息
  submitComment: function (e) {
    var that = this;
    this.setData({
      remainLen: 0,
    });
    let dynamicid = e.currentTarget.dataset.dynamicid;
    let dynamicUserId = e.currentTarget.dataset.dynamicuserid;
    console.log('dynamicid：', dynamicid);
    console.log('输入评论：', that.data.msgContent);

    //保存评论信息
    wx.request({
      url: app.server.hostUrl + '/dynamic/saveCommentInfo',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dynamicid:dynamicid,
        dynamicUserId:dynamicUserId,
        commentId:that.data.commentId,
        commentContent:that.data.msgContent,
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          wx.removeStorageSync('syncCommentContent');
          wx.showToast({
            title:"评论成功",
            icon: 'success',
            duration: 2000,
            success:function(){
              that.setData({
                isWrite: false,
                successComment:true,//评论成功，输入框内容不再放入缓存
                placeholderWarning:"",
                msgContent:""
              });
            },
            fail:function(){},
            complete:function(){
              if(null != sucData.data.resData && sucData.data.resData.length > 0){
                console.log(sucData.data.resData[0]);
                //评论
                if(null == sucData.data.resData[0].replyInfo || "" == sucData.data.resData[0].replyInfo){
                  var tempArray = [];
                  tempArray = tempArray.concat(sucData.data.resData).concat(that.data.dynamicCommentList);
                  console.log(tempArray);
                  that.setData({
                    dynamicCommentList: tempArray,
                    commentsNum:that.data.commentsNum+1,
                    toView:"commentTitle",//页面定位到刚发的评论位置
                  });
                  //that.data.dynamicListParams[that.data.dynamicIndex].commentNum = that.data.commentsNum;
                  
                  let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                  let prevPage = pages[pages.length-2];
                  console.log(that.data.dynamicIndex);
                  prevPage.data.dynamicList[that.data.dynamicIndex].commentNum = that.data.commentsNum;
                  prevPage.setData({
                    dynamicList:prevPage.data.dynamicList
                  })
                }else{
                  //评论回复
                  for(let i=0;i<that.data.dynamicCommentList.length;i++){
                    if(that.data.dynamicCommentList[i].id == sucData.data.resData[0].id){
                      console.log(sucData.data.resData[0]);
                      that.data.dynamicCommentList[i] = sucData.data.resData[0];
                      console.log(that.data.commentId+"reply");
                      that.setData({
                        dynamicCommentList:that.data.dynamicCommentList,
                        toView:that.data.commentId+"comment",//页面定位到刚发的回复位置
                      });
                      break;
                    }
                  }
                }
                
              }
            }
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
            var messageInfo = "评论失败；";
            messageInfo = messageInfo + sucData.data.messageInfo;
            wx.showModal({
              title: '提示信息',
              showCancel:false,
              content: messageInfo
            });
          }
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示信息',
          showCancel:false,
          content: '评论失败'
        })
      }
    });
  },

  /**
   * 点赞动态
   * @param {} e 
   */
  clickAgree:function(e){
    var that = this;
    let dynamicId = e.currentTarget.dataset.dynamicid;
    let dynamicuserid = e.currentTarget.dataset.dynamicuserid;
    let clickAgree = e.currentTarget.dataset.clickagree;
    clickAgree = !clickAgree;//true点赞，false取消点赞
    console.log(dynamicId);

    //点赞动态
    wx.request({
      url: app.server.hostUrl + '/dynamic/agreeDynamic',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dynamicId:dynamicId,
        dynamicUserId:dynamicuserid,
        clickAgree:clickAgree,
        agreeType:"dynamicAgree",//dynamicAgree点赞动态,agreeComment点赞评论，reply点赞评论回复
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          //改变点赞图标、以及数量
          if(clickAgree == true){
            that.data.agreeNum = that.data.agreeNum + 1;
            that.data.dynamicInfo.dynamicAgree = true;
            that.setData({
              agreeNum:that.data.agreeNum,
              dynamicInfo:that.data.dynamicInfo
            })
          }else if(clickAgree == false){
            that.data.agreeNum = that.data.agreeNum - 1;
            that.data.dynamicInfo.dynamicAgree = false;
            that.setData({
              agreeNum:that.data.agreeNum,
              dynamicInfo:that.data.dynamicInfo
            });
          }
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let prevPage = pages[pages.length-2];
          console.log(that.data.dynamicIndex);
          prevPage.data.dynamicList[that.data.dynamicIndex].agreeNum = that.data.agreeNum;
          prevPage.data.dynamicList[that.data.dynamicIndex].dynamicAgree = that.data.dynamicInfo.dynamicAgree;
          prevPage.setData({
            dynamicList:prevPage.data.dynamicList
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
   * 点赞评论
   * @param {*} e 
   */
  onAgreeComment:function(e){
    var that = this;
    let commentId = e.currentTarget.dataset.commentid;
    let commentIndex = e.currentTarget.dataset.commentindex;
    let commentuserid = e.currentTarget.dataset.commentuserid;
    let clickAgree = e.currentTarget.dataset.clickagree;
    clickAgree = !clickAgree;//true点赞，false取消点赞

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
            ++that.data.dynamicCommentList[commentIndex].agreeNum;
            that.data.dynamicCommentList[commentIndex].clickAgree = true;
          }else if(clickAgree == false){
            --that.data.dynamicCommentList[commentIndex].agreeNum;
            that.data.dynamicCommentList[commentIndex].clickAgree = false;
          }
          that.setData({
            dynamicCommentList:that.data.dynamicCommentList
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

  closeComplaintDialog: function () {
    this.setData({
      isWrite: false
    })
  },

  openComplaintDialog: function (e) {
    this.setData({
      istrue: true,
      feedbackDynamicId: e.currentTarget.dataset.dynamicid,
      createUserId:e.currentTarget.dataset.createuserid,
      userNickname:e.currentTarget.dataset.usernickname,
      dynamicComplaintNums:e.currentTarget.dataset.complaintnums,
    })
  },
  closeFeedbackComplaintDialog: function () {
    this.setData({
      istrue: false
    })
  },

    /**
   * 跳转到反馈举报页
   */
  onFeedback:function(e){
    let dynamicId = e.currentTarget.dataset.dynamicid;
    let complaintNums = e.currentTarget.dataset.complaintnums;
    wx.navigateTo({
      url: "../feedback/feedback?dynamicId="+dynamicId+"&complaintNums="+complaintNums
    })
    this.closeFeedbackComplaintDialog();
  },

  /**
   * 拉入黑名单
   * @param {} e 
   */
  onIntoBlacklist:function (e) {
    var that = this;
    that.setData({
      istrue: false
    })
    let createUserId =  e.currentTarget.dataset.createuserid;
    let userNickname = e.currentTarget.dataset.usernickname;
    Dialog.confirm({
      title: '提示',
      message: '确定不再看'+userNickname+'的动态了吗？',
    })
      .then(() => {
        let logonUserId = wx.getStorageSync('logonUserId');
        //删除操作
        wx.request({
          url: app.server.hostUrl + '/userInfo/intoBlacklist',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            createUserId:createUserId,
            logonUserId:logonUserId,
            sessionId: wx.getStorageSync('LoginSessionKey')
          },
          success: function (sucData) {
            //后台返回结果
            console.log(sucData)
            if(sucData.data.status == "1" && sucData.data.message == "success"){
              //改变列表动态
              let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              let prevPage = pages[pages.length-2];
              var dynamicNewList = prevPage.data.dynamicList;
              for(let i=0;i<prevPage.data.dynamicList.length;i++){
                if(prevPage.data.dynamicList[i].userId == that.data.createUserId){
                  dynamicNewList.splice(i,1);
                }
              }
              prevPage.setData({
                dynamicList:dynamicNewList
              })

              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 3000,
                success:function(){
                  wx.navigateBack({
                    delta: 1
                  })
                },
                fail:function(){},
                complete:function(){}
              });
            }else{
              if(sucData.data.status == "-2" && sucData.data.messageInfo == "登录已超时，请重新登录"){
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
    console.log("生命周期函数--监听页面初次渲染完成");
    // var query = wx.createSelectorQuery();
    // query.select('#commentTitle').boundingClientRect(function (res) {
    //     console.log(res);
    // }).exec();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("生命周期函数--监听页面显示");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("生命周期函数--监听页面隐藏");
    this.setData({
      isShowCommentText:false
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      isShowCommentText:false
    });
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

  touchStartTime: 0,   // 触摸开始时间
  touchEndTime: 0,     // 触摸结束时间
  lastTapTime: 0,  // 最后一次单击事件点击发生时间
  lastTapTimeoutFunc: null, // 单击事件点击后要触发的函数

  // 触摸开始
  touchStart: function(e){
    this.touchStartTime = e.timeStamp //时间点
  },

  // 触摸结束
  touchEnd: function (e) {
    //注意:触摸结束没有坐标监听事件,故读不到坐标点
    this.touchEndTime = e.timeStamp //时间点
  },

  //单击tap或双击tap
  multipleTap: function(e){
    var that = this;
    let diffTouch = this.touchEndTime - this.touchStartTime;
    let curTime = e.timeStamp;
    let lastTime = this.lastTapDiffTime;
    this.lastTapDiffTime = curTime;
    
      //两次点击间隔小于300ms, 认为是双击
      let diff = curTime - lastTime;
      if (diff < 300) {
        clearTimeout(this.lastTapTimeoutFunc); // 成功触发双击事件时，取消单击事件的执行
        that.setData({
          isWrite: false
        });
        
      }else {
        // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
        this.lastTapTimeoutFunc = setTimeout(function () {
          console.log("single tap")
        }, 300);
      }
  },



})