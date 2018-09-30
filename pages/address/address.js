// pages/address/address.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 1,
    isGetAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddress();
    if (!options.from) {
      this.setData({
        fromOrder: false
      })
    } else {
      this.setData({
        fromOrder: true
      })
    }
  },
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
        // console.log(res);
        if (res.data.code == 0) {
          that.setData({
            addressData: res.data.data.data
          })
          if (res.data.data.data.length < res.data.data.page_size) {
            that.setData({
              isGetAll: true
            })
          }
        } else if(res.data.code >= 999){
          app.getSessionKeyCallback = res => {
            that.getAddress();
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
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  //设置默认地址
  setDefaultAddress: function (e) {
    var that = this;
    if (e.currentTarget.dataset.default == 1) { return; }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.set.default.select.action',
        select_id: e.currentTarget.dataset.id,
        token: app.globalData.session_key
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          for (var i = 0; i < addressData.length; i++) {
            if (addressData[i].id == e.currentTarget.dataset.id) {
              addressData[i].default_select = 1;
            } else {
              addressData[i].default_select = 0;
            }
          }
          that.setData({
            addressData: addressData
          })
        } else if(res.data.code >= 999){
          app.getSessionKeyCallback = res => {
            that.setDefaultAddress(e);
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
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  //删除地址
  deleteAddress: function (e) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.del.my.address.action',
        token: app.globalData.session_key,
        id: e.currentTarget.dataset.id,
        default_select: e.currentTarget.dataset.default_select
      },
      success: function (res) {
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          wx.showToast({
            title: '删除地址成功',
            icon: 'success',
            duration: 1500
          })
          addressData.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            addressData: addressData
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.deleteAddress(e);
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
  // 编辑地址
  editAddress: function (e) {
    var data = '';
    for (var key in this.data.addressData) {
      if (this.data.addressData[key].id == e.currentTarget.dataset.id) {
        data = this.data.addressData[key];
      }
    }
    data = JSON.stringify(data);
    if (this.data.fromOrder) {
      wx.navigateTo({
        url: '/pages/editAddress/editAddress?address=' + data + '&from=2',
      })
    } else {
      wx.navigateTo({
        url: '/pages/editAddress/editAddress?address=' + data,
      })
    }

  },
  //由订单详情页触发选择地址
  selectAddressToOrder: function (e) {
    if (!this.data.fromOrder) { return; }
    var pages = getCurrentPages();             //  获取页面栈
    var currPage = pages[pages.length - 1];    // 当前页面
    var prevPage = pages[pages.length - 2];    // 上一个页面
    var defaultAddress = '';
    for (var key in this.data.addressData) {
      if (this.data.addressData[key].id == e.currentTarget.dataset.id) {
        defaultAddress = this.data.addressData[key];
      }
    }
    console.log(defaultAddress);
    prevPage.setData({
      defaultAddress: defaultAddress
    })
    wx.navigateBack({
      delta: 1
    })
  },
  newAddress: function () {
    if (this.data.fromOrder) {
      wx.navigateTo({
        url: '/pages/addAddress/addAddress?from=2',
      })
    } else {
      wx.navigateTo({
        url: '/pages/addAddress/addAddress',
      })
    }
  },
  // 上拉加载更多
  getMore: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.all.my.address.get',
        token: app.globalData.session_key,
        curpage: that.data.curpage + 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          var data = res.data.data.data;
          addressData = addressData.concat(data);
          that.setData({
            addressData: addressData,
            curpage: that.data.curpage + 1
          })
          if (res.data.data.data.length < res.data.data.page_size) {
            that.setData({
              isGetAll: true
            })
          }
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getMore();
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
  //从微信拉取地址
  chooseAddress:function(){
    var that = this;
    wx.chooseAddress({
      success: function (res) {
        app.POST({
          url: app.config.url,
          data: {
            request: 'private.address.add.my.address.action',
            platform: app.config.platform,
            token: app.globalData.session_key,
            shop_name: res.userName,
            shop_phone: res.telNumber,
            address_details: res.detailInfo,
            default_select: 0,
            provice_name: res.provinceName,
            city_name: res.cityName,
            area_name: res.countyName
          },
          success: function (ret) {
            // console.log('addAddress', ret);
            if(ret.data.code == 0){
              that.setData({
                curpage: 1,
                isGetAll: false,
                addressData:[]
              })
              that.getAddress();
            }else{
              wx.showToast({
                title: ret.data.msg,
                icon:'none',
                duration:2000
              })
            }
            
          },
          fail: function (res) {
            wx.showToast({
              title: '请求异常',
              icon: 'none',
              duration: 1500
            })
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
    if (this.data.refresh) {
      this.setData({
        curpage: 1,
        isGetAll: false
      })
      this.getAddress();
    }
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
    this.getMore();
  },


})