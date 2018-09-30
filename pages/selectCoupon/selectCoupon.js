var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 0,
    isGetAll: false,
    coupon: [
      {
        addtime: "2018-06-19 09:54:21",
        coupon_code: "C20180617173033",
        coupon_money: "0",
        coupon_name: "暂不使用",
        coupon_type: "0",
        expire_time: "2018-06-30",
        id: "0",
        min_money: "0",
        orderid: "0",
        select_status: "0",
        source: "",
        start_time: "2018-06-17"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.total_money) {
      this.setData({
        total_money: options.total_money,
        id: options.id
      })
      this.getAllCoupon(options.total_money, options.id);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
    }

  },
  getAllCoupon: function (total_money, id) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        token: app.globalData.session_key,
        request: 'private.coupon.my.coupon.get',
        curpage: that.data.curpage + 1
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          if (res.data.data.total == 0) {
            that.setData({
              isGetAll: true
            })
          } else {
            var couponData = that.data.coupon;
            var data = res.data.data.data;
            var coupon = [];
            couponData = couponData.concat(data);
            couponData.forEach(function (v, i) {
              couponData[i].start_time = v.start_time.slice(0, 10).replace(/-/g, '.');
              couponData[i].expire_time = v.expire_time.slice(0, 10).replace(/-/g, '.');
              if (Number(v.min_money) <= Number(total_money) || v.min_money == '0') {
                if (v.id == id) { v.select_status = 1 }
                coupon.push(v);
              }
            })
            that.setData({
              coupon: coupon,
              curpage: that.data.curpage + 1
            })
            if (res.data.data.data.length < res.data.data.page_size) {
              that.setData({
                isGetAll: true
              })
            }
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getAllCoupon(total_money, id);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  selectCoupon: function (e) {
    var coupon = this.data.coupon;
    var selectCoupon = [];
    coupon.forEach(function (v, i) {
      if (v.id == e.detail.value) {
        selectCoupon.push(v)
      }
    })
    var pages = getCurrentPages();             //  获取页面栈
    var currPage = pages[pages.length - 1];    // 当前页面
    var prevPage = pages[pages.length - 2];    // 上一个页面
    var totalPay = this.data.total_money - selectCoupon[0].coupon_money;
    prevPage.setData({
      selectedCoupon: selectCoupon,
      totalPay: totalPay
    })
    wx.navigateBack({
      delta: 1
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
    this.getAllCoupon(this.data.total_money);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})