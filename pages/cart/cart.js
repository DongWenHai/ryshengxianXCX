// pages/cart/cart.js
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
    var userInfo = wx.getStorageSync('userInfo');
    if (!app.globalData.userInfo || !userInfo || app.globalData.userInfo.avatarUrl != userInfo.avatarUrl || app.globalData.userInfo.nickName != userInfo.nickName) {
      this.setData({
        showUpdateUserinfo: true
      })
    }
  },
  navToSettlement:function(){
    var userInfo = wx.getStorageSync('userInfo');
    if (!app.globalData.userInfo || !userInfo || app.globalData.userInfo.avatarUrl != userInfo.avatarUrl || app.globalData.userInfo.nickName != userInfo.nickName) {
      this.setData({
        showUpdateUserinfo: true
      })
    }else{
      wx.navigateTo({
        url: '/pages/settlement/settlement',
      })
    }
  },
  updateUserInfoSuccess: function () {
    this.setData({
      showUpdateUserinfo: false
    })
    wx.navigateTo({
      url: '/pages/settlement/settlement',
    })
  },
  cancleUpdateUserinfo: function () {
    this.setData({
      showUpdateUserinfo: false
    })
  },
  //全选
  radioChange: function () {
    if (this.data.selectAll) {
      this.setData({
        selectAll: false
      })
    } else {
      this.setData({
        selectAll: true
      })
    }
  },
  // 获取购物车
  getCartData: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.goods.cart.get',
        token: app.globalData.session_key
      },
      success: function (res) {
        console.log('getCartData', res);
        if (res.data.code == 0) {
          if (res.data.data.cart.length == 0) {
            that.setData({
              cartList: [],
              cart: res.data.data,
              noData: true
            })
          } else {
            that.setData({
              cartList: res.data.data.cart.cart_list,
              cart: res.data.data,
              noData: false
            })
          }
        } else if (res.data.code >= 999) {
            app.getSessionKeyCallback = res => {
              that.getCartData();
            }
            app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //减少数量
  reduceCount: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var count = this.getCount(id);
    if (count == 1) {
      wx.showModal({
        title: '温馨提示',
        content: '是否删除该宝贝？',
        success: function (res) {
          if (res.cancel) {
            return;
          } else if (res.confirm) {
            that.fnReduceCount(count, id)
          }
        }
      })
    } else {
      this.fnReduceCount(count, id)
    }

  },
  fnReduceCount: function (count, id) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.goods.quantity.update.action',
        token: app.globalData.session_key,
        cart_id: id,
        product_count: count - 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCartData();
          if (count == 1) {
            that.deleteCart(id)
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.fnReduceCount(count, id);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  //删除购物车
  deleteCart: function (id) {
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        token: app.globalData.session_key,
        request: 'private.cart.goods.cart.del.action',
        select_id: id
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.deleteCart(id);
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
  //增加数量
  addCount: function (e) {
    var that = this;
    var count = this.getCount(e.currentTarget.dataset.id);
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.goods.quantity.update.action',
        token: app.globalData.session_key,
        cart_id: e.currentTarget.dataset.id,
        product_count: Number(count) + 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCartData();
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.addCount(e);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  //根据id获取对应的数量
  getCount: function (id) {
    var cartList = this.data.cartList;
    for (var key in cartList) {
      if (key == id) {
        return cartList[key].product_count
      }
    }
  },
  //全选
  selectAll: function () {
    var cart = this.data.cart;
    if (cart.cart.all_selected == 1) {
      this.setSelect('');
    } else if (cart.cart.all_selected == 0) {
      var select_id = this.getAllId();
      this.setSelect(select_id);
    }
  },
  //单选
  selectCart: function (e) {
    var cartList = this.data.cartList;
    for (var key in cartList) {
      if (cartList[key].id == e.currentTarget.dataset.id) {
        if (cartList[key].select_status == 0) {
          cartList[key].select_status = 1;
        } else {
          cartList[key].select_status = 0;
        }
      }
    }
    this.setData({
      cartList: cartList
    })
    var select_id = this.getSelectedId();
    this.setSelect(select_id);
  },
  //设置选中购物车
  setSelect: function (select_id) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.goods.cart.set_select.action',
        token: app.globalData.session_key,
        select_id: select_id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCartData();
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.setSelect(select_id);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //获取所有id
  getAllId: function () {
    var cartList = this.data.cartList;
    var select_id = '';
    for (var key in cartList) {
      select_id = select_id + ',' + cartList[key].id;
    }
    if (select_id) {
      select_id = select_id.slice(1);
    }
    return select_id;
  },
  //获取选中的id
  getSelectedId: function () {
    var cartList = this.data.cartList;
    var select_id = '';
    for (var key in cartList) {
      if (cartList[key].select_status == 1) {
        select_id = select_id + ',' + cartList[key].id;
      }
    }
    if (select_id) {
      select_id = select_id.slice(1);
    }
    return select_id;
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
    this.getCartData();
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