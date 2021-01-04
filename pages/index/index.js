// miniprogram/pages/index/index.js
const app = getApp()
// wx.cloud.init();
// const db = wx.cloud.database();
var userLoginInfo = require('../../common/WXUserLoginInfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageHost:app.server.imageHost,
    inputValue: "input",
    userDetail: undefined,
    userInfo: undefined,
    hasUserInfo:false,
    isHide: false,  //用户登录过期，可以用来显示登录层
    agreeTermsAgreement:true,
    loginSessionId:wx.getStorageSync('LoginSessionKey'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    console.log('index Launch');
    var that = this;
    wx.removeStorageSync('LoginSessionKey');
    wx.clearStorageSync();
    console.log(wx.getStorageSync('LoginSessionKey'));
    if(null == wx.getStorageSync('LoginSessionKey') || "" == wx.getStorageSync('LoginSessionKey')){
      that.wxlogin();
    }
    // 查看是否授权
    // wx.getSetting({
    //     success: function(res) {
    //       console.log("用户已授权");
    //       console.log(res);
    //       console.log(that.data.loginSessionId);
    //       if(null == that.data.loginSessionId || "" == that.data.loginSessionId){
    //         that.wxlogin();
    //       }

    //       // if(wx.getStorageSync('LoginSessionKey')){
    //       //   //获取用户信息，并登录
    //       //   userLoginInfo.getWXUserLoginInfo(0);
    //       // }else{
    //       //   that.wxlogin();
    //       // }
          
    //     },
    //     fail: function () {
    //       console.log('用户未授权，请授权登录');
    //       wx.showModal({
    //         title: '登录',
    //         showCancel:false,
    //         content: '未授权，请授权登录！'
    //       })
    //     }
    // });
  },

  /**
   * 微信授权登录
   * @param {*} e 
   */
  getPhoneNumberLogin: function(e) { 
    console.log(e.detail.errMsg) 
    console.log(e.detail.iv) 
    console.log(e.detail.encryptedData)

    var that = this;
    wx.checkSession({
      success: function(res){
        var ency = e.detail.encryptedData;
        var iv = e.detail.iv;
        console.log("=====SessionId====="+wx.getStorageSync('LoginSessionKey'));
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
          //不同意授权
          console.log("选择了不同意授权");
        } else {//同意授权
          wx.request({
            method: "GET",
            url: app.server.hostUrl + '/userLogin/decipherUserTelephone',
            data:{
              encryptedData: ency,
              ivData: iv,
              sessionKey: wx.getStorageSync('LoginSessionKey')
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (resultUserInfo) {
              //解密后的数据
              console.log(resultUserInfo);
              if(resultUserInfo.data.status == "0" && resultUserInfo.data.message == "success"){
                console.log("解密成功~~~~~~~~~~~~~");
                //后台返回客户信息是否有头像、昵称等信息，如果有直到动态浏览页面，如果没有，则跳转到用户选择信息页面（是否使用微信头像、昵称等信息；修改补充个人信息；）
                //如果使用微信头像，则直接跳转到动态浏览页面；
                //修改补充个人信息，则跳转到个人修改信息页面
                wx.setStorageSync('logonUserId', resultUserInfo.data.resData.userId);
                that.setData({
                  loginSessionId:""
                })
                if(resultUserInfo.data.resData.hadUserInfo == "Y"){
                  wx.redirectTo({
                    url: "/pages/zanzan/zanzan"
                  });
                }else if(resultUserInfo.data.resData.hadUserInfo == "N"){
                  wx.redirectTo({
                    url: "/pages/userInfoSupply/userInfoSupply"
                  });
                }
              }else if(resultUserInfo.data.status < 0 && resultUserInfo.data.message == "failed"){
                if(null != that.data.loginSessionId && "" != that.data.loginSessionId){
                  wx.removeStorageSync('LoginSessionKey');
                  that.wxlogin();
                }
              }else{
                wx.showModal({
                  title: '提示',
                  showCancel:false,
                  content: '授权无效，请重新授权登录！'
                })
              }
            }, 
            fail: function (res) {
              console.log("解密失败~~~~~~~~~~~~~");
              console.log(res);
            }
          });
        }
      },
      fail: function (err) {
          console.log("session_key 已经失效，需要重新执行登录流程");
          that.wxlogin(); //重新登录
      }
    });


  },

  //默认授权
  wxlogin: function () {//获取用户的openID和sessionKey
    var that = this;
    wx.login({
      //获取code 使用wx.login得到的登陆凭证，用于换取openid
      success: (res) => {
        console.log(res);
        wx.request({
          method: "GET",
          url: app.server.hostUrl + '/userLogin/getOpenId',
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (resSessionData) => {
            console.log(resSessionData);
            if (resSessionData.data.message == "success" && resSessionData.data.status == "0"){
              wx.setStorageSync('LoginSessionKey', resSessionData.data.resData.loginSessionKey);
              //userLoginInfo.getWXUserLoginInfo(1);
            }
          }
        });
      },
      fail: function () {
        wx.showModal({
          title: '登录',
          showCancel:false,
          content: '系统错误！请稍后再试！'
        })
      }
    });
  },


  /**
   * 微信点击按钮授权
   * @param {}} e 
   */
  bindLogin: function (e) {
    console.log(e) 
    console.log(e.detail.iv) 
    console.log(e.detail.encryptedData)
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
          isHide: false
      });

      var that = this;
      wx.login({
        success: function (res) {
          var code = res.code;
          console.log(code);

          //插入登录的用户的相关信息到数据库
          wx.request({
            url: app.server.hostUrl + '/userLogin/getOpenId',//自己的服务接口地址,这里是去拿到code去后台进行业务处理，调用微信接口拿到用户openid和凭证，在解密拿到用户数据
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            data: {
              code: code
            },
            success: function (resSessionData) {
              console.info(resSessionData);
              if (resSessionData.statusCode == 200 && resSessionData.data.status == "0") {
                wx.setStorageSync('LoginSessionKey', resSessionData.data.resData.loginSessionKey);
                //获取用户信息
                userLoginInfo.getWXUserLoginInfo(1);
              }else {
                wx.showModal({
                  title: '登录',
                  showCancel:false,
                  content: '登录失败！请稍后再试！'
                })
              }
            },
            fail: function () {
              wx.showModal({
                title: '登录',
                showCancel:false,
                content: '系统错误！请稍后再试！'
              })
            }
          });
        },
        fail:function(){
          wx.showModal({
            title: '登录',
            showCancel:false,
            content: '登录网络超时！'
          })
        },
        complete:function(){

        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '登录',
        content: '请授权之后登录',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
            // 用户没有授权成功，不需要改变 isHide 的值
            if (res.confirm) {
                console.log('用户点击了“返回授权”');
            }
        }
      });
      this.openSetting();
    }
  },

  //获取用户信息接口
  queryUsreInfo: function (e) {
    wx.request({
        url: app.globalData.urlPath + 'user/userInfo',
        data: {
            openid: app.globalData.openid
        },
        header: {
            'content-type': 'application/json'
        },
        success: function (res) {
            console.log(res.data);
            getApp().globalData.userInfo = res.data;
        }
    })
  },

  //跳转设置页面授权
  openSetting: function () {
    var that = this
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          console.log(9);
          //尝试再次登录
          that.login()
        }
      })
    } else {
      console.log(10);
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
      })
    }
  },

  toAccountLogin: function (e) {
      wx.navigateTo({
        url: "/pages/userLogin/userLogin"
      })
  },

  toBusinessLogin: function (e) {
    wx.navigateTo({
      url: "/pages/businessLogin/businessLogin"
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    // console.log(that.data.loginSessionId);
    // if(null == that.data.loginSessionId || "" == that.data.loginSessionId){
    //   that.wxlogin();
    // }
  },

  /**
   * 已阅读并同意隐私条款协议
   * @param {*} event 
   */
  onChangeTermsAgreement(event) {
    this.setData({
      agreeTermsAgreement: event.detail,
    });
  },

  /**
   * 查看用户协议
   * @param {*} e 
   */
  readUserAgreement:function(e){
    wx.navigateTo({
      url: "/pages/userAgreement/userAgreement"
    })
  },

  /**
   * 阅读隐私条款
   * @param {} e 
   */
  readUserPrivacyClause:function(e){
    wx.navigateTo({
      url: "/pages/userPrivacyClause/userPrivacyClause"
    })
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