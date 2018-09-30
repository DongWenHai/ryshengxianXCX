// pages/settlement/settlement.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    liuyan: '',
    coupon: [],
    isGetAll: false,
    curpage: 0,
    selectedCoupon: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderInfo();
  },
  getOrderInfo: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.checkout.cart.select.detail.get',
        token: app.globalData.session_key
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          that.getAddress();
          var settlementData = res.data.data.cart.cart_list;
          var totalMoney = Number(res.data.data.select_money).toFixed(2);
          var totalPay = Number(res.data.data.select_money).toFixed(2);
          that.setData({
            settlementData: settlementData,
            totalMoney: totalMoney,
            totalPay: totalPay
          })
          that.getAllCoupon(totalMoney);
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getOrderInfo();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.code,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  getAllCoupon: function (total_money) {
    if (this.data.isGetAll) {
      return;
    }
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        token: app.globalData.session_key,
        request: 'private.coupon.all.my.coupon.get'
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.total == 0) {
            that.setData({
              isGetAll: true,
              selectedCoupon: []
            })
          } else {
            var couponData = that.data.coupon;
            var data = res.data.data.data;
            var coupon = [];
            couponData = couponData.concat(data);
            couponData.forEach(function (v, i) {

              if (Number(v.min_money) <= Number(total_money) || Number(v.min_money) == 0) {
                coupon.push(v);
              }
            })
            that.setData({
              coupon: coupon,
              curpage: that.data.curpage + 1
            })
            if (res.data.data.data.length < res.data.data.page_size) {
              var selectedCoupon = [];
              if (coupon[0]) {
                selectedCoupon.push(coupon[0]);
              }
              that.setData({
                isGetAll: true,
                selectedCoupon: selectedCoupon
              })
              that.shouldPay();
            }
            that.getAllCoupon(total_money);
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getAllCoupon(total_money);
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '获取数据异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  // 计算应付
  shouldPay: function () {
    if (this.data.selectedCoupon.length > 0) {
      var totalPay = this.data.totalMoney - this.data.selectedCoupon[0].coupon_money;
    } else {
      var totalPay = this.data.totalMoney;
    }
    this.setData({
      totalPay: totalPay
    })
  },
  //获取地址
  getAddress: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.all.my.address.get',
        token: app.globalData.session_key
      },
      success: function (res) {
        if (res.data.code == 0) {
          var addressData = res.data.data.data;
          if (addressData.length == 0) {
            that.setData({
              defaultAddress: ''
            })
          } else {
            var defaultAddress = '';
            for (var i = 0; i < addressData.length; i++) {
              if (addressData[i].default_select == 1) {
                defaultAddress = addressData[i];
              }
            }
            if (!defaultAddress) {
              defaultAddress = addressData[0]
            }
            that.setData({
              defaultAddress: defaultAddress
            })
          }


        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getAddress();
          }
          app.getSessionKey();
        }
      }
    })
  },
  //编辑地址
  editAddress: function () {
    var address = this.data.defaultAddress;
    address = JSON.stringify(address);
    wx.navigateTo({
      url: '/pages/editAddress/editAddress?address=' + address,
    })
  },
  //设置默认地址
  setDefaultAddress: function () {
    var that = this;
    var defaultAddress = this.data.defaultAddress;
    if (defaultAddress.default_select == 1) { return; }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.set.default.select.action',
        select_id: defaultAddress.id,
        token: app.globalData.session_key
      },
      success: function (res) {
        if (res.data.code == 0) {
          defaultAddress.default_select = 1;
          that.setData({
            defaultAddress: defaultAddress
          })
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
  setLiuyan: function (e) {
    this.setData({
      liuyan: e.detail.value
    })
  },
  payOrder: function () {
    if (!this.data.defaultAddress && !this.data.defaultAddress.id) {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    var that = this;
    var coupon_id = 0;
    if (this.data.selectedCoupon[0]) {
      coupon_id = this.data.selectedCoupon[0].id
    }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.checkout.order.submit.action',
        token: app.globalData.session_key,
        address_id: that.data.defaultAddress.id,
        liuyan: that.data.liuyan,
        coupon_id: coupon_id
      },
      success: function (data) {
        var orderid = data.data.orderid;
        app.POST({
          url: app.config.url,
          data: {
            platform: app.config.platform,
            request: 'private.pay.md.order.pay.get',
            token: app.globalData.session_key,
            orderid: orderid,
            pay_method: 0
          },
          success: function (result) {
            if (result.code && result.code == 1) {
              wx.showToast({
                title: result.msg,
                icon: 'none',
                duration: 2000
              })
            }else{
              wx.requestPayment({
                'timeStamp': result.data.timeStamp,
                'nonceStr': result.data.nonceStr,
                'package': result.data.package,
                'signType': 'MD5',
                'paySign': result.data.paySign,
                'success': function (res) {
                  // console.log(res);
                  wx.navigateTo({
                    url: '/pages/order/order?activeIndex=2',
                  })
                },
                'fail': function (res) {
                  // console.log(res);
                  wx.navigateTo({
                    url: '/pages/order/order?activeIndex=1',
                  })
                }
              })
            }
          }
        })
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

})