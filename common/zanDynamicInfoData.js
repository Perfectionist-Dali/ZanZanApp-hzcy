const app = getApp()

var fakeData = {
  dynamicMes: {
    userNickname: "我是点赞小能手",
    userHeadImage: "http://192.168.0.101:8080/images/header/timg.jpg",
    dynamicContent: "点赞，是一个点赞动态获得红包的平台。有效的帮助发布者快速传播信息的同时，让浏览用户更有乐趣的查看信息；",
    imgUrls: [
      'http://192.168.0.101:8080/images/data-pic/dynamic/6b83d0.png',
      'http://192.168.0.101:8080/images/data-pic/dynamic/7c0a.jpg'
      //'{{imageHost}}/images/data-pic/dynamic/WechatIMG19.jpeg'
    ],
    imgWidth:"width:90px;",
    imgHeight:"height:90px;",
    sendTime:"1小时前",
    showMoreInfo:false
  },
	/**
   * 模仿后台传输数据项 - 请求分类项
   */
  requestForCategories: function () {
    return this.data;
  },

  /**
   * 模仿后台传输数据项 - 请求对应分类的商品
   * @param {number} first - 请求的头一项在数据库中的索引位置
   * @param {number} num - 请求的数据量
   * @param {string} itemType - 请求的数据所属类别，默认为"全部"，可不填
   * @return {array} itemsArr - 商品信息数组
   */
  requestForItemsOfType: function (first, num, itemType = '全部') {
    var temp = this.item;
    temp.category = itemType;
    temp.title = itemType + " - 超级无敌平靓正师奶抢购食神推介无敌澎湃鱼蛋车仔面"
    var itemsArr = [];
    for (var i = first; i < first + num; i++) {
      itemsArr.push(temp);
    }
    return itemsArr;
  },

  /**
   * 模拟向后台请求动态数据
   * param {number} couponStatus - 0: 立即使用, 1: 点击领取, 2:已使用, 3:已过期
   */
  requestForCouponOfStatus: function (nums) {
    //var dynamic = this.dynamicMes
    // if (this.dynamicMes.imgUrls.length == 1){
    //   this.dynamicMes.imgWidth = "width:160px;";
    //   this.dynamicMes.imgHeight = "";
    // }
    //dynamic.userNickname = "123121321";
    var dynamicArr = [];

    return dynamicArr;
  },

  /**
  * 测试用函数 - 模仿后台传输数据项，请求活动项
  */
  requestForSaleActs: function () {
    var data = [];
    for (var i = 0; i < 3; i++) {
      data.push({
        actName: "优惠" + i,
        actImgSrc: "../../resources/商品图测试.jpg"
      });
    }
    return data;
  },

  /**
   * 测试用函数 - 模仿后台传输数据项，请求对应活动项的商品
   * @param {number} first - 请求的头一项在数据库中的索引位置 
   * @param {number} num - 请求的数据量
   * @param {string} actName - 请求商品对应的活动名
   * @return {array} 商品信息数组
   */
  requestForItemsOfSaleAct: function (first, num, actName) {
    var temp = this.item;
    temp.actName = actName;
    temp.title = actName + " - 超级无敌平靓正师奶抢购食神推介无敌澎湃鱼蛋车仔面"
    var tempArr = [];
    for (var i = 0; i < num; i++) {
      tempArr.push(temp);
    }
    return tempArr;
  },

  /**
   * 测试用函数 - 模仿后台传输数据项，搜索数据请求
   * @param {number} num - 请求的数据量
   * @param {string} search - 搜索字段
   * @return {array} 商品信息数组
   */
  requestForItemsOfSearch: function (num, search) {
    var temp = this.item;
    var tempArr = [];
    temp.title = search;

    for (var i = 0; i < num; i++) {
      tempArr.push(temp);
    }
    return tempArr;
  }
}

module.exports = fakeData;