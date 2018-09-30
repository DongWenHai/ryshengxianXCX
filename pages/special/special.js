var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 1,
    loaded: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.sid) {
      this.getProducts(options.sid);
      this.setData({
        sid: options.sid
      })
    }
    if (options.title) {
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
  },
  //获取产品列表，类别sid
  getProducts: function (sid) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.product.special.product.get',
        token: app.globalData.session_key,
        special_id: sid,
        curpage: that.data.curpage
      },
      success: function (res) {
        // console.log('getProducts', res);
        if (res.data.code == 0) {
          var ProductsData = that.data.ProductsData || [];
          ProductsData = ProductsData.concat(res.data.data);
          that.setData({
            ProductsData: ProductsData,
            curpage: that.data.curpage + 1
          })
          if (res.data.data.length < res.data.page_size) {
            that.setData({
              loaded: true
            })
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getProducts(sid);
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
    if (this.data.loaded) {
      return;
    }
    this.getProducts(this.data.sid);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})