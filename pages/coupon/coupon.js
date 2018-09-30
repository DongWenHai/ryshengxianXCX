
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 1,
    getMoreTitle: '加载更多',
    total: 0,
    isGetAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
  },
  initData: function () {
    var self = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.coupon.all.my.coupon.get',
        token: app.globalData.session_key,
        coupon_status: 1
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          if (res.data.data.total == 0) {
            self.setData({
              couponData: []
            })
          } else if (res.data.data.total <= res.data.data.page_size) {
            var couponData = res.data.data.data;
            couponData.forEach(function (v, i) {
              couponData[i].start_time = v.start_time.slice(0, 10).replace(/-/g, '.');
              couponData[i].expire_time = v.expire_time.slice(0, 10).replace(/-/g, '.');
            })
            self.setData({
              couponData: couponData,
              getMoreTitle: '没有更多了',
              isGetAll: true
            })
          } else {
            var couponData = res.data.data.data;
            couponData.forEach(function (v, i) {
              couponData[i].start_time = v.start_time.slice(0, 10).replace('-', '/');
              couponData[i].expire_time = v.expire_time.slice(0, 10).replace('-', '/');
            })
            self.setData({
              couponData: couponData,
              total: res.data.data.page_size
            })
          }

        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.initData();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  getMore: function () {
    var self = this;
    if (res.data.isGetAll) { return; }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.coupon.all.my.coupon.get',
        token: app.globalData.token,
        coupon_status: 1,
        curpage: self.data.curpage + 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          var data = res.data.data.data;
          var couponData = self.data.couponData;
          data.forEach(function (v, i) {
            data[i].start_time = v.start_time.slice(0, 10).replace('-', '/');
            data[i].expire_time = v.expire_time.slice(0, 10).replace('-', '/');
          })
          couponData = couponData.concat(data);
          self.setData({
            couponData: couponData,
            total: self.data.total + res.data.data.page_size,
            curpage: self.data.curpage + 1
          })
          if (self.data.total >= res.data.data.total) {
            self.setData({
              isGetAll: true,
              getMoreTitle: '没有更多了'
            })
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getMore();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
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