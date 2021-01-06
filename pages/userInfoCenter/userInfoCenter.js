
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userImageUrl:"",
    fileList:[""],
    imageHost:app.server.imageHost,
    userInfo:[],
    userInfoViewHeight:0,
    userInfoViewOpacityHeight:0,
    disabledBtn:false,//关注按钮禁用
    logonUserNickName:"",
    logonUserHeadImageUrl:"",
    initiatId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      var self = this;
      wx.request({
        url: app.server.hostUrl + '/userInfo/getUserCenterInfoDetails',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          sessionId: wx.getStorageSync('LoginSessionKey'),
          userId: options.userId
        },
        success: function (infoData) {
          //后台返回结果
          console.log("会员个人信息：");
          console.log(infoData);
          if(infoData.data.status == "1" && infoData.data.message == "success"){
            if(null != infoData.data.resData){
              self.data.fileList[0]= infoData.data.resData.headImageUrl;
              self.setData({
                userInfo:infoData.data.resData,
                userImageUrl:infoData.data.resData.headImageUrl,
                fileList:self.data.fileList,
                logonUserNickName:infoData.data.resData.logonUserNickName,
                logonUserHeadImageUrl:infoData.data.resData.logonHeadImageUrl,
                initiatId:infoData.data.resData.initiatId
              });
              let userNickName = infoData.data.resData.nickName;
              wx.setNavigationBarTitle({
                title: userNickName+'的主页' 
              })
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
          var query = wx.createSelectorQuery();
          query.select('#dynamicNumsView').boundingClientRect(function (res) {
              console.log(res);
              self.setData({
                userInfoViewHeight:res.top-15,
                userInfoViewOpacityHeight:res.top-5
              })
          }).exec();
        },
        fail: function (failRes) {
          console.log("获取会员个人信息失败：");
          console.log(failRes);
          wx.showModal({
            title: '',
            showCancel:false,
            content: '获取会员个人信息失败'
          })
        }
      });
    } catch (e) {
      wx.showToast({
        title: "获取会员个人信息失败",
        image: "../../images/error.png"
      })
    };
  },

  /**
   * 私信
   * @param {} e 
   */
  onTalkLetter:function(e){
    var that = this;
    let initiatId = that.data.initiatId;
    console.log(that.data.logonUserHeadImageUrl);
    let talkUserId = e.currentTarget.dataset.talkuserid;
    let headimageurl = e.currentTarget.dataset.headimageurl;
    let nickname = e.currentTarget.dataset.nickname;
    let notreadnums = e.currentTarget.dataset.notreadnums;
    
    wx.navigateTo({
      url: "../talkLetter/talkLetter?initiatId="+initiatId+"&talkUserId="+talkUserId+"&headimageurl="+headimageurl+"&nickname="+nickname+"&notreadnums="+notreadnums+"&logonUserNickname="+that.data.logonUserNickName+"&logonUserHeadImage="+that.data.logonUserHeadImageUrl
    })
  },

  /**
   * 查看会员粉丝/关注的人
   * @param {} e 
   */
  showFansOrWatchSb:function(e){
    let userId = e.currentTarget.dataset.userid;
    let showType = e.currentTarget.dataset.type;
    let nums = e.currentTarget.dataset.nums;
    wx.navigateTo({
      url: "../fansOrWatchSb/fansOrWatchSb?userId="+userId+"&showType="+showType+"&userNickName="+this.data.userInfo.nickName+"&nums="+nums
    })
  },

  /**
   * 查看会员动态列表
   * @param {*} e 
   */
  showUserDynamicList:function(e){
    let userId = e.currentTarget.dataset.userid;
    let dynamicCount = e.currentTarget.dataset.dynamiccount;
    let userImageUrl = e.currentTarget.dataset.userimageurl;
    wx.navigateTo({
      url: "../userDynamicList/userDynamicList?userId="+userId+"&userNickName="+this.data.userInfo.nickName+"&dynamicCount="+dynamicCount+"&userImageUrl="+userImageUrl
    })
  },

  /**
   * 关注会员/取消关注
   * @param {*} e 
   */
  opereatInterestUser:function(e){
    var self=this;
    self.setData({
      disabledBtn:true
    })
    let userId = e.currentTarget.dataset.userid;
    let operateType = e.currentTarget.dataset.operatetype;
    console.log(userId);

    wx.request({
      url: app.server.hostUrl + '/userInfo/operateInterestUser',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionId: wx.getStorageSync('LoginSessionKey'),
        userId: userId,
        operateType:operateType
      },
      success: function (infoData) {
        //后台返回结果
        console.log("关注会员/取消关注：");
        console.log(infoData);
        if(infoData.data.status == "1" && infoData.data.message == "success"){
          if(null != infoData.data.resData && infoData.data.resData == 1){
            if(operateType == "cancelInterest"){
              self.data.userInfo.interestUser = false;
              --self.data.userInfo.fansNum
            }else if(operateType == "interest"){
              self.data.userInfo.interestUser = true;
              ++self.data.userInfo.fansNum
            }
            self.setData({
              userInfo:self.data.userInfo
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
        self.setData({
          disabledBtn:false
        })
      },
      fail: function (failRes){
        console.log("操作失败：");
        console.log(failRes);
        wx.showModal({
          title: '',
          showCancel:false,
          content: '操作失败'
        })
      }
    });
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

  //点击一键复制
  onCopyZanCode: function (e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据内容
      data: that.data.userInfo.zanCode,
      success: function (res) {
        wx.showToast({
          title: '已复制赞赞号',
        });
      }
    });
  },

  //点击一键复制
  onCopyWechatCode: function (e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据内容
      data: that.data.userInfo.wechatCode,
      success: function (res) {
        wx.showToast({
          title: '已复制微信号',
        });
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