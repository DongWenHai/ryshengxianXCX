var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getClassifyList();
  },
  toggleNav: function (e) {
    this.setData({
      navIndex: e.currentTarget.dataset.index
    })
  },
  //获取分类列表
  getClassifyList: function () {
    var that = this;
    wx.showNavigationBarLoading()
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        token: app.globalData.session_key,
        request: 'private.product.product.cate.get'
      },
      success: function (res) {
        wx.hideNavigationBarLoading()
        // console.log(res);
        if (res.data.code == 0) {
          that.setData({
            cData: res.data.data.data
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getClassifyList();
          }
          app.getSessionKey();
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
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