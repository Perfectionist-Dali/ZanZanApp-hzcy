const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedbackReason: '',
    remainLen: 0,
    reasonRemarks: "",
    fileList: [],
    feedImageUrl:[],
    dynamicId:"",//动态ID
    complaintNums:0
  },

    /**
   * 提交投诉信息
   * @param {*} e 
   */
  onSaveFeedback:function(e){
    var self = this;
    console.log(self.data.dynamicId);
    console.log(self.data.feedbackReason);
    console.log(self.data.reasonRemarks);
    var feedbackImage = "";
    if(null != self.data.fileList && typeof self.data.fileList[0] != "undefined"){
      feedbackImage = self.data.fileList[0].path;
      console.log(self.data.fileList[0].path);
    }
    var dynamicId = self.data.dynamicId;
    var feedbackReason = self.data.feedbackReason;
    var reasonRemarks = self.data.reasonRemarks;
    
    if("" == feedbackReason){
      Toast("请选择反馈/举报原因");
      return false;
    }
    if("" != reasonRemarks && reasonRemarks.length > 200){
      Toast("举证补充说明不能超过200字");
      return false;
    }
    // wx.showLoading({
    //   title: "反馈中..",
    //   mask: true
    // })
    if(null != self.data.feedImageUrl && self.data.feedImageUrl.length > 0){
      //上传图片
      console.log(self.data.feedImageUrl[0]);
      wx.uploadFile({
        url: app.server.hostUrl + '/dynamic/uploadDynamicImages',
        method: 'POST',
        filePath: self.data.feedImageUrl[0],
        name: 'file',
        formData: {
          'imageType': 'feedback'
        },
        success: function (imageRes) {
          console.log(imageRes);
          var uploadImagesSrc = "";
          var imageResJson = JSON.parse(imageRes.data);
          if(imageRes.statusCode == 200 && imageResJson.status == 1){
            uploadImagesSrc = imageResJson.resData;
            console.log(uploadImagesSrc);
            self.submitDynamicFeedback(dynamicId,feedbackReason,reasonRemarks,uploadImagesSrc,wx.getStorageSync('logonUserId'));
          }
        },
        fail: (resFail) => {
          wx.hideLoading();
          var imageResFailJson = JSON.parse(resFail.data);
          wx.showModal({
            title: "错误",
            content: "照片上传失败！"+imageResFailJson.messageInfo,
            showCancel: false,
            confirmText: "好的"
          })
          return
        },
        complete: (res) => {
          wx.hideLoading();
        }
      })
    }else{
      this.submitDynamicFeedback(dynamicId,feedbackReason,reasonRemarks,"",wx.getStorageSync('logonUserId'));
    }
  },

  /**
   * 提交反馈信息
   * @param {t} dynamicId 
   * @param {*} feedbackReason 
   * @param {*} reasonRemarks 
   * @param {*} feedbackImage 
   * @param {*} logonUserId 
   */
  submitDynamicFeedback: function(dynamicId,feedbackReason,reasonRemarks,feedbackImage,logonUserId){
    var self = this;
    //提交反馈举报
    wx.request({
      url: app.server.hostUrl + '/dynamic/submitDynamicFeedback',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dynamicId:dynamicId,
        feedbackReasonCode:feedbackReason,
        reasonRemarks:reasonRemarks,
        feedbackImage:feedbackImage,
        logonUserId:logonUserId,
        complaintNums:self.data.complaintNums
      },
      success: function (sucData) {
        //后台返回结果
        console.log(sucData)
        if(sucData.data.status == "-1" && sucData.data.message == "failed"){
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: sucData.data.messageInfo
          })
        }else if(sucData.data.status == "1" && sucData.data.message == "success"){
          wx.showToast({
            title: '反馈成功',
            icon: 'success',
            duration: 5000,
            success:function(){
            },
            fail:function(){
            },
            complete:function(){
              console.log("反馈成功-======");
              wx.navigateBack({
                delta: 1
              })
            }
           })
          
        }else{
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: '反馈失败'
          })
        }
      },
      fail: function (infoRes) {
        wx.showModal({
          title: '提示',
          showCancel:false,
          content: '反馈失败'
        })
      }
    });
  },

  //选中的原因
  onChooseFeedbackChange(event) {
    this.setData({
      feedbackReason: event.detail,
    });
  },

  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      feedbackType: name,
    });
  },

  bindTextInput: function (e) {
    const t = e.detail.value
    const len = e.detail.value.length
    this.setData({
      reasonRemarks: e.detail.value,
      remainLen: len
    });
    if(len >= 200){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '文字说明不能超过200字',
      })
    }
  },

  afterRead(event) {
    var self = this;
    const { file } = event.detail;
    console.log(file.path);
    const { fileList = [] } = this.data;
    fileList.push({ ...file, url: file.path });
    this.setData({ fileList });
    self.setData({
      feedImageUrl:self.data.feedImageUrl.concat(file.path)
    })

    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    // wx.uploadFile({
    //   url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
    //   filePath: file.path,
    //   name: 'file',
    //   formData: { user: 'test' },
    //   success(res) {
    //     // 上传完成需要更新 fileList
    //     const { fileList = [] } = this.data;
    //     fileList.push({ ...file, url: res.data });
    //     this.setData({ fileList });
    //   },
    // });
  },
  daleteImage(event){
    console.log(event.detail.index);
    this.setData({
      fileList:[]
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.dynamicId);
    console.log(options.complaintNums);
    var self = this;
    self.setData({
      dynamicId:options.dynamicId,
      complaintNums:options.complaintNums
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