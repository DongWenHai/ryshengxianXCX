var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    delete_history:true,    //控制搜索历史清除
    keyWords:'',
    historyKeyWords:[]      //历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'historyKeyWords',
      success: function(res) {
        that.setData({
          historyKeyWords:res.data
        })
      },
    })
  },
  openDeleteHistory:function(){
    this.setData({
      delete_history:false
    })
  },
  closeDeleteHistory:function(){
    this.setData({
      delete_history: true
    })
  },
  setKeyWords:function(e){
    var val = e.detail.value;
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if(val.length > 30){
      wx.showToast({
        title: '关键词不能超过30个字',
        icon:'none',
        duration:1500
      })
      val = val.slice(0,30);
    }
    this.setData({
      keyWords:val
    })
  },
  search:function(){
    if(!this.data.keyWords){
      wx.showToast({
        title: '请输入关键词',
        icon:'none',
        duration:2000
      })
      return;
    }
    wx.redirectTo({
      url: '/pages/searchResult/searchResult?keyWords=' + this.data.keyWords,
    })
  },
  keySearch:function(e){
    wx.redirectTo({
      url: '/pages/searchResult/searchResult?keyWords=' + e.currentTarget.dataset.keywords,
    })
  },
  // 删除历史关键词
  deleteHistoryKeyWords:function(e){
    var index = e.currentTarget.dataset.index;
    var historyKeyWords = wx.getStorageSync('historyKeyWords') || [];
    historyKeyWords.splice(index,1);
    wx.setStorage({
      key: 'historyKeyWords',
      data: historyKeyWords
    })
    this.setData({
      historyKeyWords: historyKeyWords
    })
  },
  //删除所有关键词
  deleteAllHistoryKeyWords:function(){
    var that = this;
    wx.showModal({
      title: '温馨提醒',
      content: '是否删除所有搜索历史',
      success:function(res){
        if(res.confirm){
          wx.setStorage({
            key: 'historyKeyWords',
            data: [],
            success: function () {
              that.setData({
                historyKeyWords: []
              })
            }
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