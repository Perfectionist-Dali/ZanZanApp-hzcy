// pages/login/login.js
const app = getApp()
import WxValidate from '../../utils/WxValidate.js'

Page({
  data: {
    userName: '',
    userPassword: '',
    userMobile:'',
    code:'',

    countryCodes: ["+86"],
    countryCodeIndex: 0,
  },

  formSubmit: function (e) {
    var that=this;
    console.log('form发生了submit事件，携带的数据为：', e.detail.value);
    const params = e.detail.value;
    //校验表单
    // if (!this.WxValidate.checkForm(params)) {
    //   const error = this.WxValidate.errorList[0]
    //   this.showModal(error)
    //   return false
    // }
    
    that.data.userMobile = e.detail.value.phone;
    if ("" == e.detail.value.phone || null == e.detail.value.phone || !(/^1[345789]\d{9}$/.test(e.detail.value.phone))) {
      wx.showToast({
        title: '请填写正确的手机号',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
    wx.request({
      url: app.server.hostUrl + '/userLogin/loginBySMSCode',//储信息并生成6位随机验证码
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {
        mobile: that.data.userMobile
      },
      success: function (resCodeData) {
        console.info(resCodeData);
        if (resCodeData.statusCode == 200 && resCodeData.data.status == "0") {
          wx.setStorageSync('LoginSessionKey', resCodeData.data.resData.loginCodeSessionKey);
          that.data.code = resCodeData.data.resData.code;
          //获取用户信息
          //userLoginInfo.getWXUserLoginInfo(1);
          wx.navigateTo({
            url: "/pages/loginForCode/loginForCode?userMobile="+that.data.userMobile+"&code="+resCodeData.data.resData.code
          })
        }else {
          wx.showModal({
            title: '登录',
            showCancel:false,
            content: '登录失败！'
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

  //加载完后，处理事件 
  // 如果有本地数据，则直接显示
  onLoad: function (options) {
    var that = this;
    //获取本地数据
    wx.getStorage({
      key: 'userName',
      success: function (res) {
        console.log(res.data);
        that.setData({ userName: res.data });
      }
    });
    wx.getStorage({
      key: 'userPassword',
      success: function (res) {
        console.log(res.data);
        that.setData({ userPassword: res.data });
      }
    });

    //this.initValidate();
    console.log(this.WxValidate);
  },

  /**
   * 验证
   * @param {手机号} phone 
   */
  initValidateForm:function(phone){
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请填写正确的手机号',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
  },


  // toSendSMSLoginCode: function (e) {
  //   wx.navigateTo({
  //     url: "/pages/loginForCode/loginForCode"
  //   })
  // },
  toLoginByAccount: function (e) {
    wx.navigateTo({
      url: "/pages/loginForAccount/loginForAccount"
    })
  },



  //报错 
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
  //验证函数
  initValidate() {
    const rules = {
      phone:{
        required:true,
        tel:true
      }
    }
    const messages = {
      phone:{
        required:'请填写手机号',
        tel:'请填写正确的手机号'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})