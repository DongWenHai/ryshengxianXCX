// pages/order/order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    curpage: 0,
    isGetAll: false,
    orderData: {},
    total: 0,
    noData: false,
    LogisticsStore: {
      SF: '顺丰速运',
      HTKY: '百世快递',
      ZTO: '中通快递',
      STO: '申通快递',
      YTO: '圆通速递',
      YD: '韵达速递',
      YZPY: '邮政快递包裹',
      EMS: 'EMS',
      HHTT: '天天快递',
      JD: '京东物流',
      UC: '优速快递',
      DBL: '德邦快递',
      FAST: '快捷快递',
      ZJS: '宅急送',
      TNT: 'TNT快递',
      UPS: 'UPS',
      DHL: 'DHL',
      FEDEX: 'FEDEX联邦(国内件）',
      FEDEX_GJ: 'FEDEX联邦(国际件）'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.activeIndex) {
      this.setData({
        activeIndex: options.activeIndex
      })
    }
    if (options.activeIndex == 1) {
      this.getOrderByStatus(1);
    } else if (options.activeIndex == 2) {
      this.getOrderByStatus(3);
    } else if (options.activeIndex == 3) {
      this.getOrderByStatus(4);
    } else if (options.activeIndex == 4) {
      this.getOrderByStatus(-1);
    } else {
      this.getAllOrder();
    }
  },
  toggalNav: function (e) {
    var activeIndex = e.currentTarget.dataset.index;
    this.setData({
      activeIndex: activeIndex,
      curpage: 0,
      isGetAll: false,
      orderData: {},
      total: 0,
      noData: false
    })
    if (activeIndex == 1) {
      this.getOrderByStatus(1);
    } else if (activeIndex == 2) {
      this.getOrderByStatus(3);
    } else if (activeIndex == 3) {
      this.getOrderByStatus(4);
    } else if (activeIndex == 4) {
      this.getOrderByStatus(-1);
    } else {
      this.getAllOrder();
    }
  },
  //获取所有订单
  getAllOrder: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.order.my.order.list.get',
        token: app.globalData.session_key,
        curpage: that.data.curpage + 1
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          if (res.data.data.total == 0) {
            that.setData({
              isGetAll: true,
              orderData: [],
              total: 0,
              noData: true
            })
          } else {
            var total = Number(that.data.total) + res.data.data.page_size
            var data = res.data.data.data.order;
            var orderData = that.data.orderData;
            
            orderData = Object.assign(orderData, data);
            that.setData({
              orderData: orderData,
              total: total,
              curpage: that.data.curpage + 1
            })
            if (total >= res.data.data.total) {
              that.setData({
                isGetAll: true
              })
            }
          }
        } else if (res.data.code >= 999) {
            app.getSessionKeyCallback = res => {
              that.getAllOrder();
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
                      wx.redirectTo({
                        url: '/pages/order/order'
                      })
                    }, 1500)
                  }
                })
              } else if (res.data.code >= 999) {
                app.getSessionKeyCallback = res => {
                  that.confirmAccept(e);
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
        } else if (res.cancel) {
          console.log(res);
        }
      }
    })

  },
  //获取对应状态订单
  getOrderByStatus: function (order_status) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.order.my.order.list.get',
        token: app.globalData.session_key,
        curpage: that.data.curpage + 1,
        order_status: order_status
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          if (res.data.data.total == 0) {
            that.setData({
              isGetAll: true,
              orderData: [],
              total: 0,
              noData: true
            })
          } else {
            var total = Number(that.data.total) + res.data.data.page_size
            var data = res.data.data.data.order;
            var orderData = that.data.orderData;

            orderData = Object.assign(orderData, data);
            that.setData({
              orderData: orderData,
              total: total,
              curpage: that.data.curpage + 1
            })
            if (total >= res.data.data.total) {
              that.setData({
                isGetAll: true
              })
            }
          }
        } else if(res.data.code >= 999){
            app.getSessionKeyCallback = res => {
              that.getOrderByStatus(order_status);
            }
            app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
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
        orderid: e.currentTarget.dataset.orderi,
        pay_method: 0
      },
      success: function (result) {
        if(result.code && result.code == 1){
          wx.showToast({
            title: result.msg,
            icon:'none',
            duration:2000
          })
        }else{
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
        
      }
    })
  },
  // 取消订单
  cancleOrder: function (e) {
    var that = this;
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
                  icon: 'success'
                })
                if (that.data.activeIndex == 0) {
                  var orderData = that.data.orderData;
                  var order_id = 'O' + e.currentTarget.dataset.id;
                  orderData[order_id].order_status = '0';
                  that.setData({
                    orderData: orderData
                  })
                } else if (that.data.activeIndex == 1) {
                  that.setData({
                    activeIndex: 1,
                    curpage: 0,
                    isGetAll: false,
                    orderData: {},
                    total: 0,
                    noData: false
                  })
                  that.getOrderByStatus(1);
                }

              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '请求异常',
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
  //删除订单
  deleteOrder: function (e) {
    var that = this;
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
                      wx.pageScrollTo({
                        scrollTop: 0,
                      })
                      that.setData({
                        curpage: 0,
                        isGetAll: false,
                        orderData: [],
                        total: 0
                      })
                      that.getAllOrder();
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
                title: '请求异常',
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
  //提醒发货
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
        // console.log('lookLogistics', res)
        var logistics = res.data;
        if (logistics.State == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '暂无物流轨迹',
            icon: 'none',
            duration: 1500
          })
        } else {
          self.setData({
            isShowLogistics: true,
            logistics: logistics
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  },
  // 关闭物流面板
  closeLogistics: function () {
    this.setData({
      isShowLogistics: false
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
    if (this.data.isGetAll) { return; }
    if (this.data.activeIndex == 1) {
      this.getOrderByStatus(1);
    } else if (this.data.activeIndex == 2) {
      this.getOrderByStatus(3);
    } else if (this.data.activeIndex == 3) {
      this.getOrderByStatus(4);
    } else if (this.data.activeIndex == 4) {
      this.getOrderByStatus(-1);
    } else {
      this.getAllOrder();
    }
  },

})