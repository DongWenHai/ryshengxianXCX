var 
app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage:1,
    loaded:false,
    sort:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.cid){
      this.getProducts(options.cid,1);
      this.setData({
        cid: options.cid
      })
    }
    if(options.title){
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
  },
  //获取产品列表，类别cid
  getProducts: function (cid,sort) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.product.store.cate.goods.get',
        token: app.globalData.session_key,
        category_id: cid,
        curpage: that.data.curpage,
        sort:sort
      },
      success: function (res) {
        // console.log('getProducts',res);
        if (res.data.code == 0) {
          var ProductsData = that.data.ProductsData || [];
          ProductsData = ProductsData.concat(res.data.data.data);
          that.setData({
            ProductsData: ProductsData,
            curpage: that.data.curpage + 1
          })
          if (res.data.data.data.length < res.data.data.page_size) {
            that.setData({
              loaded: true
            })
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getProducts(cid, sort);
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
  //切换每日上新导航
  toggleNav: function (e) {
    this.setData({
      sort: e.currentTarget.dataset.sort,  //每日上新导航活动项下标
      curpage: 1,        //每日上新分类
      loaded: false,      //每日上新产品是否加载完成
      ProductsData: [],
    })
    this.getProducts(this.data.cid,e.currentTarget.dataset.sort);
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
    if(this.data.loaded){
      return;
    }
    this.getProducts(this.data.cid, this.data.sort);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})