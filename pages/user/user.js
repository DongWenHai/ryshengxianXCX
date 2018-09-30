// pages/user/user.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUpdateUserinfo:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  updateUserInfoSuccess: function () {
    this.setData({
      showUpdateUserinfo: false,
      userInfo:app.globalData.userInfo
    })
  },
  cancleUpdateUserinfo: function () {
    
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
    var userInfo = wx.getStorageSync('userInfo');
    if (!app.globalData.userInfo || !userInfo || app.globalData.userInfo.avatarUrl != userInfo.avatarUrl || app.globalData.userInfo.nickName != userInfo.nickName) {
      this.setData({
        showUpdateUserinfo: true
      })
    }
    this.setData({
      userInfo: app.globalData.userInfo
    })
    var that = this;
    app.getUserDataCallback = function (res) {
      that.setData({
        userData: res.data.data
      })
    }
    app.getUserData();
    
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