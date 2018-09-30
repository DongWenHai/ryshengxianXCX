var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort:2,         //产品排序，1新品，2销量，3价格高，4价格低
    curpage:1,      //加载数据分页
    loaded:false,    //数据是否全部加载完成
    haslogin:true     //是否登录态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.category_id){
      this.setData({
        category_id: options.category_id
      })
      this.getClassifyProducts(options.category_id,2,1)
    }
    if (options.title){
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
  },
  //导航切换
  toggleNav:function(e){
    this.setData({
      sort: e.currentTarget.dataset.sort,         //产品排序，1新品，2销量，3价格高，4价格低
      curpage: 1,      //加载数据分页
      loaded: false,
      classifyProductsData:[]
    })
    this.getClassifyProducts(this.data.category_id, e.currentTarget.dataset.sort, 1)
  },
  //获取分类产品
  getClassifyProducts: function (cid, sort, curpage){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.product.store.cate.goods.get',
        token:app.globalData.session_key,
        category_id:cid,
        sort:sort,
        curpage:curpage
      },
      success:function(res){
        // console.log('getClassifyProducts',res);
        if(res.data.code == 0){
          var classifyProductsData = that.data.classifyProductsData ? that.data.classifyProductsData:[];
          classifyProductsData = classifyProductsData.concat(res.data.data.data);
          that.setData({
            classifyProductsData: classifyProductsData,
            curpage:that.data.curpage + 1
          })
          if (res.data.data.data.length < res.data.data.page_size){
            that.setData({
              loaded:true
            })
          }
        }else if(res.data.code >= 999){
            app.getSessionKeyCallback = res => {
              that.getClassifyProducts(cid, sort, curpage);
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
    if(this.data.loaded){
      return;
    }
    this.getClassifyProducts(this.data.category_id, this.data.sort, this.data.curpage)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})