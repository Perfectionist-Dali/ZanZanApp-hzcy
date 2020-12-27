// discountCounpon.js
const app = getApp();
var fakeData = require('../../common/zanDynamicInfoData.js');
var loginData = require('../../common/CheckUserLogin.js');
var util = require('../../utils/util.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({

  data: {
    showView: false,
    loginUserInfo:[],
    dynamicList:[],
    isShowIndexMes:true,
    search_item: {
      inputShowed: false,
      inputVal: "",
      searchBarTop: "10px",
      imageHostURL:"55555"
    },
    isShowLoadingBar:true,
    istrue: false,
    isPullDownRefreshComplete:"none",
    showSearchTool:"block",
    userName:"xxx",
    dataResWarning: "您暂时无动态",
    imageHost:app.server.imageHost,
    agreeNum:0,//首页列表
    commentsNum:0,
    showLeftPopup: false,
    showTopPopup: false,
    logonUserId:"",
    messageTotalNums:0,//总未读消息数
    messageNums:0,//我的动态未读消息数
    noticeNotReadNums:0,//通知未读数
    letterNotReadNums:0,//未读私信消息
    feedbackDynamicId:"",
    createUserId:"",
    userNickname:"",
    dynamicComplaintNums:0,
    seenDynamicTypeList: ['全部', '关注的人', '陌生人'],
    seenDynamicTypeIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
    that.appInitializeCheckUserLogon();
    var logonUserId = wx.getStorageSync('logonUserId');
    console.log("====logonUserId===="+logonUserId);
    that.setData({
      logonUserId:logonUserId
    });
    if(options.url){
      let url = decodeURIComponent(options.url);
      console.log(url);
      wx.navigateTo({
        url
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var logonUserId = wx.getStorageSync('logonUserId');
    this.onCountMsgNums(logonUserId);
    this.onWebSocket(logonUserId);
  },

  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop > 100) {//页面距离大于100px,则显示回到顶部控件
      this.setData({
        cangotop: true
      });
    } else {
      this.setData({
        cangotop: false
      });
    }
  },

  //回到顶部，内部调用系统API
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
 
//   //wx.pageScrollTo(OBJECT)
//   基础库 1.4.0 开始支持，低版本需做兼容处理
// 将页面滚动到目标位置。
//   OBJECT参数说明：
//   参数名	类型	必填	说明
// scrollTop	Number	是	滚动到页面的目标位置（单位px）
//   duration	Number	否	滚动动画的时长，默认300ms，单位 ms
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
      })
    }},
  /**
   * 列表筛选要看的动态
   */
  bindPickerDynamicTypeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail)
    this.setData({
      seenDynamicTypeIndex: e.detail.value,
      dynamicList:[]
    })
    var thisTime = util.formatTimeSub5Second(new Date());
    console.log(thisTime);
    this.onCloseTopPopup();
    this.goTop();
    this.loadZanZanDynamicInfoList("refresh",thisTime,e.detail.value);

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
      that.shareDynamic(dynamicId,dynamicuserid);
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
   * 获取未读信息数
   * @param {} e 
   */
  onCountMsgNums:function(logonUserId) {
    var that=this;
    try {
      var self = this;
      wx.request({
        url: app.server.hostUrl + '/dynamic/countMsgNums',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          logonUserId: logonUserId
        },
        success: function (infoData) {
          //后台返回结果
          console.log(infoData);
          if(infoData.data.status == "1" && infoData.data.message == "success"){
            if(null != infoData.data.resData){
              //未读动态消息
              if(null != infoData.data.resData.messageNums && "" != infoData.data.resData.messageNums){
                that.setData({
                  messageNums:infoData.data.resData.messageNums
                })
              }
              //未读通知消息
              if(null != infoData.data.resData.noticeNotReadNums && "" != infoData.data.resData.noticeNotReadNums){
                that.setData({
                  noticeNotReadNums:infoData.data.resData.noticeNotReadNums
                })
              }
              //未读私信消息
              if(null != infoData.data.resData.letterNotReadNums && "" != infoData.data.resData.letterNotReadNums){
                that.setData({
                  letterNotReadNums:infoData.data.resData.letterNotReadNums
                })
              }
              //总未读消息
              that.setData({
                messageTotalNums:that.data.messageNums+that.data.noticeNotReadNums+that.data.letterNotReadNums
              })
            }
          }else{
            console.log(infoData.data.messageInfo);
          }
        },
        complete:function(res){
        },
        fail: function (failRes) {
          console.log(failRes);
        }
      });
    } catch (e) {
      
    };
  },

  /**
   * 我关注的人
   * @param {} e 
   */
  showMyselfInterestSb:function(e){
    let userId = e.currentTarget.dataset.userid;
    let showType = e.currentTarget.dataset.type;
    let selfInterestNumType = 'self';
    wx.navigateTo({
      url: "../fansOrWatchSb/fansOrWatchSb?userId="+userId+"&showType="+showType+"&selfInterestNumType="+selfInterestNumType
    })
  },

  /**
   * 系统通知
   * @param {} e 
   */
  showSysNotice:function(e){
    let userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: "../sysNotice/sysNotice?userId="+userId
    })
  },

  /**
   * 我的私信
   * @param {} e 
   */
  myLetter:function(e){
    var self = this;
    let userId = e.currentTarget.dataset.userid;
    let logonUserNickname = self.data.loginUserInfo.nickName;
    let logonUserHeadImage = self.data.loginUserInfo.headImageUrl;
    wx.navigateTo({
      url: "../privateLetter/privateLetter?userId="+userId+"&letterNotReadNums="+self.data.letterNotReadNums+"&logonUserNickname="+logonUserNickname+"&logonUserHeadImage="+logonUserHeadImage
    })
  },

  /**
   * 创建WebSocket连接
   */
  onWebSocket: function (logonUserId) {
    var that = this;
    wx.connectSocket({
      url: app.server.WS_URL+logonUserId,
      success:function(res){
        console.log(res);
        if (res.errMsg == "connectSocket:ok"){
          console.log("开始建立连接！");
        }else{
          console.log("建立连接失败！");
        } 
      },
      fail:function(res){
        console.log(res);
      }
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })
    wx.onSocketMessage(function (res) {
      console.log("==messageNums=="+res.data);
      if(null != res.data && "" != res.data){
        var jsonObj = JSON.parse(res.data);
        if(null != jsonObj.messageNums && "" != jsonObj.messageNums){
          that.setData({
            messageNums:jsonObj.messageNums
          })
          //总未读消息
          that.setData({
            messageTotalNums:that.data.messageNums+that.data.noticeNotReadNums+that.data.letterNotReadNums
          })
        }
      }
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
    })
  },


  /**
   * 打开我的中心
   * @param {} e 
   */
  onShowLeftPopup(e) {
    this.setData({ showLeftPopup: true });
    //显示当前用户头像、昵称
    try {
      var self = this;
      wx.request({
        url: app.server.hostUrl + '/userInfo/getLoginUserInfo',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey')
        },
        success: function (infoData) {
          //后台返回结果
          console.log(infoData);
          if(infoData.data.status == "1" && infoData.data.message == "success"){
            if(null != infoData.data.resData){
              self.setData({
                loginUserInfo:infoData.data.resData
              });
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
          //加载动态、评论相关消息提示

        },
        fail: function (failRes) {
          console.log("获取登录信息失败：");
          console.log(failRes);
          wx.showModal({
            title: '',
            showCancel:false,
            content: '获取登录信息失败'
          })
        }
      });
    } catch (e) {
      wx.showToast({
        title: "获取登录信息失败",
        image: "../../images/error.png"
      })
    };
  },

  /**
   * 打开我的个人信息页面
   * @param {} e 
   */
  showMyselfInfo(e){
    wx.navigateTo({ 
      url: "../personalDetails/personalDetails"
    });
  },

  /**
   * 打开筛选层
   * @param {} e 
   */
  showTopPopup(e) {
    this.setData({ showTopPopup: true });
    
  
  },
  /**
   * 关闭我的中心
   * @param {} e 
   */
  onCloseLeftPopup(e) {
    this.setData({ showLeftPopup: false });
  },

  /**
   * 关闭选择框
   * @param {} e 
   */
  onCloseTopPopup(e) {
    this.setData({ showTopPopup: false });
  },

  /**
   * 验证用户是否登录
   */
  appInitializeCheckUserLogon: function () {
    var that = this;
    console.log(wx.getStorageSync('LoginSessionKey'));
    if(wx.getStorageSync('LoginSessionKey')){
      wx.request({
        url: app.server.hostUrl + '/userLogin/checkLogin',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey')
        },
        success: function (loginRes) {
          //解密后的数据
          console.log(loginRes)
          if(loginRes.data.status != "0" && loginRes.data.resData != "logon"){
            //获取用户登录信息失败
            wx.removeStorageSync('LoginSessionKey');
            wx.clearStorageSync();
            wx.reLaunch({
              url: "../index/index"
            });
          }else{
            console.log("用户已登录");
            var thisTime = util.formatTimeSub5Second(new Date());
            console.log(thisTime);
            that.loadZanZanDynamicInfoList("refresh",thisTime,"");
          }
        },
        fail: function () {
          wx.reLaunch({
            url: "../index/index"
          });
        }
      });
    }else{
      wx.reLaunch({
        url: "../index/index"
      });
    }
  },

  bottomBarBtnClick: function () {
    wx.navigateTo({
      url: '../couponCenter/couponCenter'
    })
  },

  // myCenterBtnClick: function () {
  //   wx.navigateTo({
  //     url: '../couponCenter/couponCenter'
  //   })
  // },

  releaseDynamicMes: function (e) {
    wx.navigateTo({ 
      url: "../releaseDynamicMes/releaseDynamicMes"
    })
  },

  /**
   * 查看我的消息
   */
  showMyMessageInfo: function (e) {
    let userId = e.currentTarget.dataset.userid;
    wx.navigateTo({ 
      url: "../messageInfo/messageInfo?userId="+userId
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
   * 动态详情
   * @param {} e 
   */
  showDynamicDetails: function (e) {
    let dynamicId =  e.currentTarget.dataset.dynamicid;
    let dynamicIndex = e.currentTarget.dataset.index;
    //let dynamicListParams = JSON.stringify(this.data.dynamicList)
    //console.log(dynamicListParams);
    wx.navigateTo({
      url: "../dynamicDetails/dynamicDetails?dynamicId="+dynamicId+"&dynamicIndex="+dynamicIndex
    });
    wx.removeStorageSync('syncCommentContent');
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
              that.data.dynamicList.splice(dynamicIndex,1);
              that.setData({
                dynamicList:that.data.dynamicList
              })
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
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
              var dynamicNewList = that.data.dynamicList;
              console.log(that.data.createUserId);
              for(let i=0;i<that.data.dynamicList.length;i++){
                console.log(that.data.dynamicList[i].userId);
                if(that.data.dynamicList[i].userId == that.data.createUserId){
                  dynamicNewList.splice(i,1);
                }
              }
              console.log(dynamicNewList);
              that.setData({
                dynamicList:dynamicNewList
              })
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 2000
               })
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
   * 我的动态
   * @param {} e 
   */
  showMyselfDynamic:function(e){
    let userId = e.currentTarget.dataset.userid;
    let messageNums = e.currentTarget.dataset.messagenums;
    wx.navigateTo({
      url: "../myselfDynamicList/myselfDynamicList?userId="+userId+"&messageNums="+messageNums
    })
  },

  /**
   * 我的动态
   * @param {} e 
   */
  onLogOut:function(e){
    Dialog.confirm({
      title: '提示',
      message: '确定退出当前账号？',
    })
      .then(() => {
        let logonUserId = wx.getStorageSync('logonUserId');
        console.log(logonUserId);
        //删除操作
        wx.request({
          url: app.server.hostUrl + '/userLogin/userLogout',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            logonUserId:logonUserId,
            sessionId: wx.getStorageSync('LoginSessionKey')
          },
          success: function (sucData) {
            //后台返回结果
            console.log(sucData)
            if(sucData.data.status == "1" && sucData.data.message == "success"){
              //wx.removeStorageSync('LoginSessionKey');
              wx.removeStorageSync('logonUserId');
              wx.showToast({
                title: '退出成功',
                icon: 'success',
                duration: 2000
              });
              wx.redirectTo({
                url: "../index/index"
              })

            }else{
              wx.showModal({
                title: '提示信息',
                showCancel:false,
                content: '退出账号失败'
              })
            }
          },
          fail: function (infoRes) {
            wx.showModal({
              title: '提示信息',
              showCancel:false,
              content: '退出账号失败'
            })
          }
        });
        
      })
      .catch(() => {
        // on cancel
      });
  },

  /**
   * 点赞动态
   * @param {} e 
   */
  agreeDynamic:function(e){
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
        agreeType:"dynamicAgree",//dynamicAgree点赞动态,comment点赞评论，reply点赞评论回复
        sessionId: wx.getStorageSync('LoginSessionKey')
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "1" && sucData.data.message == "success"){
          //改变点赞图标、以及数量
          for(let i=0;i<that.data.dynamicList.length;i++){
            if(that.data.dynamicList[i].dynamicId == dynamicId){
              console.log(that.data.dynamicList[i]);
              if(clickAgree == true){
                that.data.dynamicList[i].agreeNum = that.data.dynamicList[i].agreeNum + 1;
                that.data.dynamicList[i].dynamicAgree = true;
                that.setData({
                  dynamicList:that.data.dynamicList
                })
              }else if(clickAgree == false){
                that.data.dynamicList[i].agreeNum = that.data.dynamicList[i].agreeNum - 1;
                that.data.dynamicList[i].dynamicAgree = false;
                that.setData({
                  dynamicList:that.data.dynamicList
                })
              }
              break;
            }
          }
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
   * 转发动态
   * @param {} e 
   */
  shareDynamic:function(dynamicId,dynamicuserid){
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
          for(let i=0;i<that.data.dynamicList.length;i++){
            if(that.data.dynamicList[i].dynamicId == dynamicId){
              console.log(that.data.dynamicList[i]);
              that.data.dynamicList[i].sendOthersNum = that.data.dynamicList[i].sendOthersNum + 1;
              that.setData({
                dynamicList:that.data.dynamicList
              })
              break;
            }
          }
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


  //评论动态
  commentDynamic: function (e) {
    let dynamicId =  e.currentTarget.dataset.dynamicid;
    let dynamicIndex = e.currentTarget.dataset.index;
    let dynamicListParams = JSON.stringify(this.data.dynamicList)
    wx.navigateTo({
      url: "../dynamicDetails/dynamicDetails?showCommentText=1&dynamicId="+dynamicId+"&dynamicIndex="+dynamicIndex
    });
    wx.removeStorageSync('syncCommentContent');
  },
  
  // 下拉加载新动态
  onPullDownRefresh:function(e){
    //此处可实现下拉刷新数据，刷新完数据最好  wx.stopPullDownRefresh()；
    var self = this;
    // setTimeout(function(){
    //   console.log("下拉加载新动态");
    //   var thisTime = util.formatTimeSub5Second(new Date());
    //   self.loadZanZanDynamicInfoList("new",thisTime);
    // },300);
    console.log("下拉加载新动态");
    var thisTime = util.formatTimeSub5Second(new Date());
    self.loadZanZanDynamicInfoList("new",thisTime,self.data.seenDynamicTypeIndex);
    //wx.stopPullDownRefresh();
  },

  // 上拉加载旧动态
  onReachBottom: function(event) {
    console.log("上拉加载旧动态");
    var self = this;
    wx.showNavigationBarLoading();  //显示导航栏加载按钮
    //加载完记得  wx.hideNavigationBarLoading();
    setTimeout(function(){
      let lastDynamicCreateTime;
      if(null != self.data.dynamicList && self.data.dynamicList.length > 0){
        lastDynamicCreateTime=self.data.dynamicList.slice(-1)[0].dynamicCreateTime;
      }
      self.loadZanZanDynamicInfoList("old",lastDynamicCreateTime,self.data.seenDynamicTypeIndex);
    },300);
    wx.hideNavigationBarLoading();
  },

  previewImage: function(e){
    console.log(e);
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: e.currentTarget.dataset.urls // 需要预览的图片http链接列表
    })
  },

  /**
   * 加载动态列表数据
   */
  loadZanZanDynamicInfoList: function (dataFlag,dateTime,showDynamicCategory) {
    var self = this;
    //查询动态列表
    wx.request({
      url: app.server.hostUrl + '/dynamic/loadZanZanDynamicInfoList',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        dataFlag: dataFlag,
        refreshDataTime:dateTime,
        showDynamicCategory:showDynamicCategory
      },
      success: function (infoData) {
        //后台返回结果
        console.log("动态列表加载数据：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData.length > 0){
            if(null == self.data.dynamicList || self.data.dynamicList.length == 0 ){
              self.setData({
                dynamicList:infoData.data.resData
              });
            }else{
              var tempArray = [];
              if(dataFlag == "new" || dataFlag == "refresh"){
                tempArray = tempArray.concat(infoData.data.resData).concat(self.data.dynamicList);
              }
              if(dataFlag == "old"){
                tempArray = tempArray.concat(self.data.dynamicList).concat(infoData.data.resData);
              }
              console.log(tempArray);
              self.setData({
                dynamicList: tempArray
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
          isPullDownRefreshComplete:"block",
          showSearchTool:"none"
        });
        var timerName = setTimeout(function() {
          self.setData({
            isPullDownRefreshComplete:"none",
            showSearchTool:"block"
          });
        }, 2000);
        //clearTimeout(timerName);
      },
      fail: function (failRes) {
        console.log("加载动态失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '加载动态失败'
        })
      }
    });
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
    this.closeComplaintDialog();
  },


  // 截获竖向滑动
  catchTouchMove:function(res){
    return false
  },

  /**
   * 搜索
   */
  showInput: function () {
    wx.navigateTo({
      url: "../searchInfo/searchInfo"
    })

    // this.setData({
    //   isShowIndexMes: false,
    //   isShowLoadingBar:false,
    //   search_item: {
    //     inputShowed: true,
    //     inputVal: "",
    //     searchBarTop: "0px"
    //   },
    // });
  },
  hideInput: function () {
    this.setData({
      isShowIndexMes: true,
      isShowLoadingBar:true,
      search_item: {
        inputShowed: false,
        inputVal: "",
        searchBarTop: "10px"
      },
    });
  },
  clearInput: function () {
    console.log(3),
    this.setData({
      search_item: {
        inputShowed: true,
        inputVal: ""
      },
    });
  },
  inputTyping: function (e) {
    console.log(e.detail.value),
    this.setData({
      search_item: {
        inputShowed: true,
        inputVal: e.detail.value,
        imageHostURL:app.server.imageHost
      },
    });
  },

  /**
   * 打开投诉反馈
   */
  openComplaintDialog: function (e) {
    this.setData({
      istrue: true,
      feedbackDynamicId: e.currentTarget.dataset.dynamicid,
      createUserId:e.currentTarget.dataset.createuserid,
      userNickname:e.currentTarget.dataset.usernickname,
      dynamicComplaintNums:e.currentTarget.dataset.complaintnums,
    })
  },
  /**
   * 关闭投诉反馈
   */
  closeComplaintDialog: function () {
    this.setData({
      istrue: false
    })
  },
  
})













