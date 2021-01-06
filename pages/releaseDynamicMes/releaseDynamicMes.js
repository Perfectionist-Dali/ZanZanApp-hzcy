// wx.cloud.init()
const app = getApp()
// const db = wx.cloud.database()
var loginData = require('../../common/CheckUserLogin.js');
var pages = getCurrentPages();
var currPage = pages[pages.length - 1];   //当前页面
var prevPage = pages[pages.length - 2];  //上一个页面

Page({
  /**
   * Page initial data
   */
  data: {
    imageHost:app.server.imageHost,
    userId: undefined,
    files: [],
    filesNums:0,
    content: "",
    remainLen: 0,
    imageSrc: "",
    clickable: true,
    visiblePersonTypeList: ['公开', '我关注的人', '关注我的人','陌生人','仅自己'],
    visiblePersonTypeIndex: 0,
  },

  toCancelReleaseMes: function (e) {
    console.log(pages);
    wx.navigateBack({
      delta: 1
    })
    // wx.redirectTo({
    //   url: "../zanzan/zanzan"
    // })
    
  },

  /**
   * 发布动态
   * @param {} e 
   */
  releaseDynamicDetails: function (e) {
    var that = this;
    console.log(that.data.filesNums);
    if (that.data.content === "" && that.data.filesNums < 1) {
      wx.showModal({
        title: "错误",
        content: "请写点什么再发布",
        showCancel: false,
        confirmText: "好的",
        clickable:false
      })
      return
    }
    wx.showLoading({
      title: "发送中..",
      mask: true
    })
    console.log(that.data.files);
    var uploadImagesSrc = "";
    if(null != that.data.files && that.data.files.length > 0){
      //var imgArr = that.data.filesNums - 1;
      //上传图片
      for (var index in that.data.files) {
        console.log(that.data.files[index]);
        wx.uploadFile({
          url: app.server.hostUrl + '/dynamic/uploadDynamicImages',
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          filePath: that.data.files[index],
          name: 'file',
          formData: {},
          success: function (imageRes) {
            console.log(imageRes);
            var imageResJson = JSON.parse(imageRes.data);
            if(imageRes.statusCode == 200 && imageResJson.status == 1){
              uploadImagesSrc = uploadImagesSrc+imageResJson.resData+",";
              //var imageIndex = index;
              if((uploadImagesSrc.split(",").length-1) == that.data.filesNums){
                uploadImagesSrc = uploadImagesSrc.substring(0,uploadImagesSrc.length-1);
                //保存发布的动态
                wx.request({
                  url: app.server.hostUrl + '/dynamic/releaseDynamicInfo',
                  method: 'POST',
                  header: {
                    'content-type': 'application/json'
                  },
                  data: {
                    content:that.data.content,
                    imagesSrc:uploadImagesSrc,
                    visiblePersonType:that.data.visiblePersonTypeIndex,
                    sessionId: wx.getStorageSync('LoginSessionKey')
                  },
                  success: function (infoRes) {
                    //后台返回结果
                    console.log(infoRes)
                    if(infoRes.data.status == "1" && infoRes.data.message == "success"){
                      wx.showToast({
                        title:"发布成功",
                        icon: 'success',
                        duration: 2000,
                        success:function(){
                          wx.reLaunch({
                            url: "../zanzan/zanzan"
                          })
                        },
                        fail:function(){},
                        complete:function(){}
                      })
                    }else{
                      if(infoRes.data.status == "-1" && infoRes.data.messageInfo == "登录已超时，请重新登录"){
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
                        wx.hideLoading();
                        wx.showModal({
                          title: '提示信息',
                          showCancel:false,
                          content: '发布失败'
                        })
                        
                      }
                    }
                  },
                  fail: function (infoRes) {
                    wx.hideLoading();
                    wx.showModal({
                      title: '提示信息',
                      showCancel:false,
                      content: '发布失败'
                    })
                  }
                });
              }
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
      }
    }else{
      console.log(that.data.content);
      //保存发布的动态
      wx.request({
        url: app.server.hostUrl + '/dynamic/releaseDynamicInfo',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          content:that.data.content,
          imagesSrc:uploadImagesSrc,
          visiblePersonType:that.data.visiblePersonTypeIndex,
          sessionId: wx.getStorageSync('LoginSessionKey')
        },
        success: function (infoRes) {
          //后台返回结果
          console.log(infoRes)
          if(infoRes.data.status == "1" && infoRes.data.message == "success"){
            wx.showToast({
              title:"发布成功",
              icon: 'success',
              duration: 2000,
              success:function(){
                wx.reLaunch({
                  url: "../zanzan/zanzan"
                })
              },
              fail:function(){},
              complete:function(){},
            })
          }else{
            let messageInfo = "发布失败";
            if(infoRes.data.status == "-1" && infoRes.data.messageInfo == "动态内容中包含敏感词"){
              messageInfo = messageInfo+"！"+infoRes.data.messageInfo
            }
            wx.hideLoading();
            wx.showModal({
              title: '发布动态',
              showCancel:false,
              content: messageInfo
            })
          }
        },
        fail: function (infoRes) {
          wx.hideLoading();
          wx.showModal({
            title: '发布动态',
            showCancel:false,
            content: '发布失败'
          })
        }
      });
    }
  },

  /**
   * 选择照片
   * @param {x} e 
   */
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
        count:9,
        //sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            that.data.filesNums = that.data.filesNums+res.tempFilePaths.length;
            console.log(that.data.filesNums);
            if(that.data.filesNums < 10){
              that.setData({
                files: that.data.files.concat(res.tempFilePaths)
              });
            }else{
              that.data.filesNums = that.data.filesNums-res.tempFilePaths.length;
              wx.showModal({
                title: '',
                showCancel:false,
                content: "最多上传9张图片"
              });
            }
        },
        fail:function (res) {
          
        }
    })
  },
  previewImage: function(e){
      wx.previewImage({
          current: e.currentTarget.id, // 当前显示图片的http链接
          urls: this.data.files // 需要预览的图片http链接列表
      })
  },

  //删除图片
  deleteImg: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var files = that.data.files;
    files.splice(index, 1); //从数组中删除index下标位置，指定数量1，返回新的数组
    if(that.data.filesNums > 0){
      that.data.filesNums = that.data.filesNums-1;
    }
    that.setData({
      files: files,
    });
  },

  bindTextInput: function (e) {
    const t = e.detail.value
    const len = e.detail.value.length
    //const r = 300 - len
    this.setData({
      content: e.detail.value,
      remainLen: len
    });
    if(len == 300){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '发布内容不能超过300字',
      })
    }
  },

  sendToDb: function (fileId = "") {
    const that = this
    const posterData = {
      authorId: that.data.userId,
      msg: that.data.content,
      photoId: fileId,
      date: db.serverDate()
    }
    db.collection("poster")
      .add({
        data: {
          ...posterData
        }
      })
      .then(res => {
        wx.showToast({
          title: "发送成功"
        })
        wx.navigateBack({
          delta: 1
        })
      })
      .catch(error => {
        that.onSendFail()
      })
      .finally(wx.hideLoading())
  },

  onSendFail: function () {
    wx.hideLoading()
    wx.showToast({
      title: "发送失败",
      image: "/images/error.png"
    })
    this.setData({
      clickable: true
    })
  },

  onSendTap: function () {
    if (this.data.content === "" && this.data.imageSrc === "") {
      wx.showModal({
        title: "错误",
        content: "不能发送空内容",
        showCancel: false,
        confirmText: "好的"
      })
      return
    }
    if (!this.data.clickable) return
    this.setData({
      clickable: false
    })
    const that = this
    wx.showLoading({
      title: "发送中",
      mask: true
    })
    const imageSrc = this.data.imageSrc
    if (imageSrc !== "") {
      const finalPath = imageSrc.replace("//", "/").replace(":", "")
      // wx.cloud
      //   .uploadFile({
      //     cloudPath: finalPath,
      //     filePath: imageSrc // 文件路径
      //   })
      //   .then(res => {
      //     that.sendToDb(res.fileID)
      //   })
      //   .catch(error => {
      //     that.onSendFail()
      //   })
    } else {
      that.sendToDb()
    }
  },


  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    loginData.checkUserLogon();
    try {
      var value = wx.getStorageSync('LoginSessionKey')
      if (!value) {
        wx.showToast({
          title: "获取用户信息失败，请重新授权登陆",
          image: "/images/error.png"
        })
        wx.reLaunch({
          url: "/pages/index/index"
        })
      } else {
        this.setData({
          userId: value
        })
      }
    } catch (e) {
      wx.showToast({
        title: "获取用户信息失败，请重新授权登陆",
        image: "/images/error.png"
      })
      wx.reLaunch({
        url: "/pages/index/index"
      })
    }
  },

  /**
   * 谁可看
   */
  bindPickerDynamicTypeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail)
    this.setData({
      visiblePersonTypeIndex: e.detail.value
    })
  },
  /**
   * 关闭选择框
   * @param {} e 
   */
  onCloseTopPopup(e) {
    this.setData({ showTopPopup: false });
  },
  
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () { },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () { },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () { },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () { },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () { },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () { },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () { }
})
