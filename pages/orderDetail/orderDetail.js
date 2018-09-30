
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowLogistics: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId
    })
    this.getOrderDetail(options.orderId);
  },
  // 获取订单详情
  getOrderDetail: function (orderId) {
    var self = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    app.POST({
      url: app.config.url,
      data: {
        request: 'private.order.my.order.detail.get',
        platform: app.config.platform,
        token: app.globalData.session_key,
        orderid: orderId
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          self.setData({
            orderData: res.data.data.data.data,
            order: res.data.data.data.order
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getOrderDetail(orderId);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },
  // 取消订单
  cancleOrder: function (e) {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '确认取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          app.POST({
            url: app.config.url,
            data: {
              request: 'private.order.cancel.order.action',
              platform: app.config.platform,
              token: app.globalData.session_key,
              orderid: e.currentTarget.dataset.orderid
            },
            success: function (res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'success',
                  duration: 1500,
                  success: function () {
                    self.data.order.order_status = 0;
                    self.setData({
                      order: self.data.order
                    })
                  }
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '出错啦',
                icon: 'none'
              })
            }
          })
        } else if (res.cancel) {
          console.log(res);
        }
      }
    })

  },
  deleteOrder: function (e) {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '确认要删除该订单吗？',
      success: function (res) {
        if (res.confirm) {
          app.POST({
            url: app.config.url,
            data: {
              request: 'private.order.delete.order.action',
              platform: app.config.platform,
              token: app.globalData.session_key,
              orderid: e.currentTarget.dataset.orderid
            },
            success: function (res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'success',
                  success: function () {
                    setTimeout(function () {
                      wx.navigateTo({
                        url: '/pages/order/order',
                      })
                    }, 1500)
                  }
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '出错啦',
                icon: 'none'
              })
            }
          })
        } else if (res.cancel) {
          console.log(res);
        }
      }
    })

  },
  // 提醒发货
  tipsSend: function (e) {
    app.POST({
      url: app.config.url,
      data: {
        request: 'private.ship.notify.order.ship.action',
        platform: app.config.platform,
        token: app.globalData.session_key,
        auto_id: e.currentTarget.dataset.autoid
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 1500
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.tipsSend(e);
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
      fail: function (res) {
        console.log(res);
      }
    })
  },
  // 确认收货
  confirmAccept: function (e) {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          app.POST({
            url: app.config.url,
            data: {
              request: 'private.order.confirm.receipt.action',
              platform: app.config.platform,
              token: app.globalData.session_key,
              orderid: e.currentTarget.dataset.orderid
            },
            success: function (res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '确认收货成功',
                  icon: 'success',
                  duration: 1500,
                  success: function () {
                    setTimeout(function () {
                      wx.navigateTo({
                        url: '/pages/order/order'
                      })
                    }, 1500)
                  }
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 1500
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log(res);
        }
      }
    })

  },
  // 查看物流
  lookLogistics: function (e) {
    var self = this;
    var waybill_no = e.currentTarget.dataset.waybill_no;
    var logistics_code = e.currentTarget.dataset.logistics_code;
    if (!waybill_no) {
      wx.showToast({
        title: '您查询的物流单号不存在！',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    wx.showLoading({
      title: '正在查询...',
      mask: true
    })
    app.POST({
      url: app.config.url,
      data: {
        request: 'private.ship.order.logistics.detail.get',
        platform: app.config.platform,
        token: app.globalData.session_key,
        number: waybill_no,
        logistics_code: logistics_code
      },
      success: function (res) {
        console.log('lookLogistics', res)
        var logistics = res.data;
        if (logistics.State == 0) {
          wx.showToast({
            title: '暂无物流轨迹',
            icon: 'none'
          })
        } else {
          self.setData({
            isShowLogistics: true,
            logistics: logistics
          })
        }
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },
  // 关闭物流面板
  closeLogistics: function () {
    this.setData({
      isShowLogistics: false
    })
  },
  //立即付款
  payOrder: function (e) {
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.pay.md.order.pay.get',
        token: app.globalData.session_key,
        orderid: e.currentTarget.dataset.orderid,
        pay_method: 0
      },
      success: function (result) {
        wx.requestPayment({
          'timeStamp': result.data.timeStamp,
          'nonceStr': result.data.nonceStr,
          'package': result.data.package,
          'signType': 'MD5',
          'paySign': result.data.paySign,
          'success': function (res) {
            wx.navigateTo({
              url: '/pages/order/order?activeIndex=2',
            })
          },
          'fail': function (res) {
            console.log(res);
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