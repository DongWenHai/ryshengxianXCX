// pages/getUserInfo/getUserInfo.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.fromPage) {
      this.setData({
        fromPage: options.fromPage
      })
      if (options.product_id) {
        this.setData({
          product_id: options.product_id
        })
      }
    }
  },
  //获取用户信息
  getUserInfo: function (res) {
    var that = this;
    var share_id = app.globalData.share_id || '';
    var product_id = app.globalData.product_id || '';
    if (res.detail.errMsg == 'getUserInfo:ok') {
      app.globalData.userInfo = res.detail.userInfo;
      that.setData({
        userInfo: res.detail.userInfo
      })
      app.getSessionKey();
      wx.navigateBack({
        delta: 1
      })
    }

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

  }
})