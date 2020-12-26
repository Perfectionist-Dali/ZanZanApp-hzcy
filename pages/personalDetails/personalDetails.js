const app = getApp();
var util = require('../../utils/util.js');

const citys = {
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州']
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    src: '',
    updateHeadImageUrl:'',
    imageHost:app.server.imageHost,
    showInfo:true,//是否修改信息
    disabledBtn:true,//保存按钮是否可点击
    gender: '',//性别
    logonUserId:"",
    nickname:"",//昵称
    wechatCode:"",//微信号
    columns: [
      {
        values: Object.keys(citys),
        className: 'column1'
      },
      {
        values: citys['福建'],
        className: 'column2',
        defaultIndex: 2
      }
    ],
    prefecture:{province: '', city: '' },//地区
    birthday:"",//生日
    showRegionPopup: false,//打开选择地区窗
    showDatePopup:false,//打开选择日期窗
    currentDate: "",//生日默认日期
    minDate: "",//日期选择框最小日期
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    signature:"",//签名
    nicknameFocus:false,
    wechatCodeFocus:false,
    signatureFocus:false,
    showChooseCity:true,
    showChooseBirthday:true,
    loginUserInfo:[],
    updateUserInfoFlag:""
  },

    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var self = this;
    //加载用户信息
    try {
      console.log(option);
      var updateInfoFlag = option.updateInfoFlag;
      console.log("===updateInfoFlag=="+updateInfoFlag);
      if(updateInfoFlag == "regist"){
        self.setData({
          showInfo:false
        })
      }
      self.setData({
        updateUserInfoFlag:updateInfoFlag
      })

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
              self.data.fileList[0] = infoData.data.resData.headImageUrl;
              self.data.prefecture.province = infoData.data.resData.province;
              self.data.prefecture.city = infoData.data.resData.city;
              if(null != self.data.prefecture.province && "" != self.data.prefecture.province){
                self.setData({
                  showChooseCity:false
                })
              }
              if(null != self.data.prefecture.city && "" != self.data.prefecture.city){
                self.setData({
                  showChooseCity:false
                })
              }
              if(null != infoData.data.resData.birthday && "" != infoData.data.resData.birthday){
                console.log("======showChooseBirthday"+infoData.data.resData.birthday);
                self.setData({
                  showChooseBirthday:false
                })
              }
              self.setData({
                loginUserInfo:infoData.data.resData,
                logonUserId:infoData.data.userId,
                fileList:self.data.fileList,
                src: infoData.data.resData.headImageUrl,
                gender:infoData.data.resData.gender,
                nickname:infoData.data.resData.nickName,
                wechatCode:infoData.data.resData.wechatCode,
                prefecture:self.data.prefecture,
                birthday:infoData.data.resData.birthday,
                signature:infoData.data.resData.signature
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
          let {avatar} = option
          if (avatar) {
            self.data.fileList[0] = avatar;
            self.setData({
              fileList:self.data.fileList,
              src: avatar,
              updateHeadImageUrl:avatar,
              showInfo:false,
              disabledBtn:false
            })
          }
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
   * 提交保存用户修改信息
   * @param {*} e 
   */
  submitMyselfInfo:function(e){
    console.log(e);
    let userId = e.currentTarget.dataset.userid;
    var that = this;
    console.log(that.data.updateHeadImageUrl);
    wx.showLoading({
      title: "保存中..",
      mask: true
    });
    if(null == that.data.gender || "" == that.data.gender){
      wx.hideLoading();
      wx.showModal({
        title: '提示信息',
        showCancel:false,
        content: "请选择性别"
      });
      return false;
    }
    if(null != that.data.updateHeadImageUrl && "" != that.data.updateHeadImageUrl){
      wx.uploadFile({
        url: app.server.hostUrl + '/userInfo/submitUpdateMyselfInfo',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        filePath: that.data.updateHeadImageUrl,
        name: 'file',
        formData: {
          'isUpdateHeadImage':'Y',
          'sessionId': wx.getStorageSync('LoginSessionKey'),
          'userId':userId,
          'gender': that.data.gender,
          'nickname':that.data.nickname,
          'wechatCode':that.data.wechatCode,
          'province':that.data.prefecture.province,
          'city':that.data.prefecture.city,
          'birthday':that.data.birthday,
          'signature':that.data.signature
        },
        success (res){
          console.log(res);
          var resData = JSON.parse(res.data);
          if(res.statusCode == 200 && resData.status == 1){
            if(that.data.updateUserInfoFlag == "update"){
              wx.hideLoading();
              wx.showToast({
                title:"修改成功",
                icon: 'success',
                duration: 2000,
                success:function(){
                  that.setData({
                    showInfo:true
                  })
                },
                fail:function(){},
                complete:function(){
                },
              })
            }else if(that.data.updateUserInfoFlag == "regist"){
              wx.showToast({
                title:"修改成功",
                icon: 'success',
                duration: 2000
              })
              wx.redirectTo({
                url: "/pages/perfectSelfInfoSuc/perfectSelfInfoSuc"
              });
            }
          }else{
            wx.hideLoading({
              success: (res) => {},
            })
            var messageInfo = "提交失败；";
            messageInfo = messageInfo + resData.messageInfo;
              wx.showModal({
                title: '提示信息',
                showCancel:false,
                content: messageInfo
              });
          }
        }
      })
    }else{
      wx.request({
        url: app.server.hostUrl + '/userInfo/submitUpdateMyselfInfoNoImage',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'sessionId': wx.getStorageSync('LoginSessionKey'),
          'userId':userId,
          'gender': that.data.gender,
          'nickname':that.data.nickname,
          'wechatCode':that.data.wechatCode,
          'province':that.data.prefecture.province,
          'city':that.data.prefecture.city,
          'birthday':that.data.birthday,
          'signature':that.data.signature
        },
        success (res){
          console.log(res);
          //var resData = JSON.parse(res.data);
          if(res.statusCode == 200 && res.data.resData == 1){
            if(that.data.updateUserInfoFlag == "update"){
              wx.hideLoading();
              wx.showToast({
                title:"修改成功",
                icon: 'success',
                duration: 2000,
                success:function(){
                  that.setData({
                    showInfo:true
                  })
                },
                fail:function(){},
                complete:function(){
                },
              })
            }else if(that.data.updateUserInfoFlag == "regist"){
              wx.showToast({
                title:"修改成功",
                icon: 'success',
                duration: 2000
              })
              wx.redirectTo({
                url: "/pages/perfectSelfInfoSuc/perfectSelfInfoSuc"
              });
            }
          }else{
            wx.hideLoading({
              success: (res) => {},
            })
            var messageInfo = "提交失败；";
            messageInfo = messageInfo + resData.messageInfo;
              wx.showModal({
                title: '提示信息',
                showCancel:false,
                content: messageInfo
              });
          }
        },
        complete:function(res){
        },
        fail: function (failRes) {
          console.log("修改个人信息失败：");
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: '修改信息失败'
          })
        }
      });
    }
    
  },

  /**
   * 昵称获取焦点
   * @param {*} e 
   */
  getNicknameFocus: function(e){
    this.setData({
      nicknameFocus:true
    })
  },
  /**
   * 微信号获取焦点
   * @param {*} e 
   */
  getWechatCodeFocus: function(e){
    this.setData({
      wechatCodeFocus:true
    })
  },
  /**
   * 签名获取焦点
   * @param {*} e 
   */
  getSignatureFocus: function(e){
    this.setData({
      signatureFocus:true
    })
  },

  /**
   * 选择生日
   * @param {*} event 
   */
  onInputBirthday(event) {
    this.setData({
      currentDate: event.detail,
      //birthday:util.formatTimeDatetime(event.detail,'Y-M-D'),
      disabledBtn:false
    });
  },

  /**
   * 确定选择生日
   * @param {*} event 
   */
  onConfirmBirthday(event){
    console.log(event);
    console.log(util.formatTimeDatetime(event.detail,'Y-M-D'));
    this.setData({
      currentDate: event.detail,
      birthday:util.formatTimeDatetime(event.detail,'Y-M-D'),
      showChooseBirthday:false,
      disabledBtn:false
    });
    this.onCloseDatePopup();
  },

  /**
   * 取消选择生日
   * @param {*} event 
   */
  onCancelBirthday(){
    //需要重置一下生日
    this.onCloseDatePopup();
  },

  /**
   * 选择地区
   * @param {} event 
   */
  onChangePrefecture(event) {
    const { picker, value, index } = event.detail;
    console.log(event.detail);
    picker.setColumnValues(1, citys[value[0]]);
    this.data.prefecture.province = event.detail.value[0];
    this.data.prefecture.city = event.detail.value[1];
    this.setData({ 
      prefecture:this.data.prefecture,
      disabledBtn:false
    });
  },
  /**
   * 确定选择地区
   * @param {} event 
   */
  onConfirmPrefecture(event) {
    const {value, index } = event.detail;
    console.log(event.detail);
    this.data.prefecture.province = event.detail.value[0];
    this.data.prefecture.city = event.detail.value[1];
    this.setData({ 
      prefecture:this.data.prefecture,
      showChooseCity:false,
      disabledBtn:false
    });
    this.onCloseRegionPopup();
  },
  /**
   * 取消选择地区
   * @param {} event 
   */
  onCancelPrefecture(e) {
    //需要重置一下地区
    this.onCloseRegionPopup();
  },
  //打开选择地区框
  onShowRegionPopup() {
    this.setData({ showRegionPopup: true });
  },
  //关闭选择地区框
  onCloseRegionPopup() {
    this.setData({ showRegionPopup: false });
  },
  //打开选择日期框
  onShowDatePopup(e){
    if(this.data.birthday == null || this.data.birthday == ""){
      this.data.birthday = util.formatDate(new Date);
    }
    this.setData({
      currentDate: util.stringToDate(this.data.birthday).getTime(),
      minDate: util.stringToDate("1930-12-31").getTime(),//日期选择框最小日期
      showDatePopup: true
    });
  },
  //关闭选择日期框
  onCloseDatePopup() {
    this.setData({ showDatePopup: false });
  },

  /**
   * 性别选择
   * @param {*} event 
   */
  onChangeGender(event) {
    console.log(event);
    this.setData({
      gender: event.detail,
      disabledBtn:false
    });
  },

  /**
   * 昵称输入
   * @param {*} event 
   */
  onChangeNickname(event) {
    console.log(event);
    this.setData({
      nickname: event.detail,
      disabledBtn:false
    });
  },

  /**
   * 个性签名输入
   * @param {*} event 
   */
  onChangeSignature(event){
    console.log(event);
    this.setData({
      signature: event.detail,
      disabledBtn:false
    });
  },
  /**
   * 微信号数入
   * @param {*} event 
   */
  onChangeWechatCode(event){
    console.log(event);
    this.setData({
      wechatCode: event.detail,
      disabledBtn:false
    });
  },

  /**
   * 选择头像
   */
  uploadHeadImage(e) {
    var that=this;
    console.log(that.data.updateUserInfoFlag);
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        wx.redirectTo({
          url: '../uploadPortrait/uploadPortrait?src=' + src +'&updateInfoFlag='+that.data.updateUserInfoFlag
        })
      }
    })
  },
  /**
   * 预览头像
   * @param {} e 
   */
  previewImage: function(e){
    console.log(e);
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: e.currentTarget.dataset.urls// 需要预览的图片http链接列表
    })
  },

  //调用上传方法，并上传后台
  afterRead(event) {
    var that = this;
    console.log(event);
    const { file } = event.detail;
    var images = [{ url: '', name: '' }];
    images[0].url=event.detail.file.path;
    that.setData({
      fileList:images
    })
  },

  /**
   * 修改个人信息
   * @param {*} e 
   */
  updateMyselfInfo:function(e){
    var that = this;
    this.setData({
      showInfo:false,
      updateUserInfoFlag:"update"
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