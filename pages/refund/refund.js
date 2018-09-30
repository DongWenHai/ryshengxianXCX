// pages/refund/refund.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    status: 1,
    reason: '',
    beizhu: '',
    pic: '',
    reasonIndex: null,
    commentsPhoto: [],
    notDelete: false,
    typeradio: [
      {
        name: '仅退款',
        checked: true,
        value: 1
      },
      {
        name: '退货退款',
        checked: false,
        value: 2
      },
    ],
    statusradio: [
      {
        name: '未收到',
        checked: true,
        value: 1
      },
      {
        name: '已收到',
        checked: false,
        value: 2
      },
    ],
    reasonData: ['不想要了', '订单有错误重新下单', '质量有问题', '缺货', '物流太慢了']
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderid,
      backpage: options.backpage
    })
    this.getOrderDetail(options.orderid);
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
  typeradioChange: function (e) {
    this.setData({
      type: e.detail.value
    })
  },
  statusradioChange: function (e) {
    this.setData({
      status: e.detail.value
    })
  },
  setReason: function (e) {
    var index = e.currentTarget.dataset.index;
    var reasonIndex = this.data.reasonIndex;
    if (reasonIndex == index) {
      this.setData({
        reasonIndex: null,
        reason: ''
      })
    } else {
      this.setData({
        reasonIndex: index,
        reason: this.data.reasonData[index]
      })
    }
  },
  otherReason: function (e) {
    this.setData({
      reason: e.detail.value
    })
  },
  setBeizhu: function (e) {
    this.setData({
      beizhu: e.detail.value
    })
  },
  // 提交申请
  refundSubmit: function () {
    var self = this;
    // this.uploadImg(this.submit());
    this.submit();

  },
  submit: function () {
    var self = this;
    app.POST({
      url: app.config.url,
      data: {
        request: 'private.refund.apply.order.refund.action',
        platform: app.config.platform,
        token: app.globalData.session_key,
        auto_id: self.data.order.id,
        product_id: self.data.orderId,
        refund_type: self.data.type,
        ship_status: self.data.status,
        refund_reason: self.data.reason,
        refund_beizhu: self.data.beizhu,
        // refund_pic: self.data.pic
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 1500,
            success: function () {
              setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/order/order?activeIndex=4',
                })
                // var backpage = Number(self.data.backpage) + 1
                // var pages = getCurrentPages();             //  获取页面栈
                // var currPage = pages[pages.length - 1];    // 当前页面
                // var prevPage = pages[pages.length - backpage];

                // prevPage.setData({
                //   refresh: true
                // })
                // console.log(Number(self.data.backpage))
                // wx.navigateBack({
                //   delta: Number(self.data.backpage)
                // })
              }, 1500)
            }
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.submit();
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
  // 删除选中的图片
  deleteSelectPhoto: function (e) {
    var commentsPhoto = this.data.commentsPhoto;
    commentsPhoto.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      commentsPhoto: commentsPhoto
    })
  },
  showDeletetip: function () {
    if (this.data.notDelete) {
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(0).step()
      this.setData({
        bounceInUp: animation.export(),
        selectAttr: true
      })
      setTimeout(function () {
        animation.translateY(-25).step()
        this.setData({
          bounceInUp: animation.export()
        })
      }.bind(this), 200)
      this.setData({
        notDelete: false
      })
    } else {
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation;
      animation.translateY(0).step()
      this.setData({
        bounceInUp: animation.export(),
      })
      setTimeout(function () {
        animation.translateY(-25).step()
        this.setData({
          bounceInUp: animation.export(),
          selectAttr: false
        })
      }.bind(this), 200)
      this.setData({
        notDelete: true
      })
    }

  },
  // 上传图片
  getcommentsPhoto: function () {
    var self = this;
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var commentsPhoto = self.data.commentsPhoto.concat(tempFilePaths);
        if (commentsPhoto.length > 5) {
          wx.showToast({
            title: '上传图片不能多于5张',
            icon: 'none',
            duration: 1500
          })
        } else {
          self.setData({
            commentsPhoto: commentsPhoto
          })
        }
      }
    })
  },
  uploadImg: function (Fn) {
    var self = this;
    var commentsPhoto = this.data.commentsPhoto;
    var pic = '';
    var num = 0;
    if (commentsPhoto.length > 0) {
      commentsPhoto.forEach(function (v, i) {
        wx.uploadFile({
          url: app.config.url,
          filePath: v,
          name: 'file',
          formData: {
            platform: app.config.platform,
            token: app.globalData.session_key,
            request: 'private.source.upload.pic.action',
            file_dir: 'pho',
            file_type: 'form_data'
          },
          success: function (res) {
            var data = res.data
            data = JSON.parse(data);

            if (data.code != 0) {
              wx.showToast({
                title: '上传图片失败',
                icon: 'none',
                duration: 1500
              })
              return false;
            } else if (data.code == 0) {
              pic = pic + ',' + data.url;
              num += 1;
              if (num == commentsPhoto.length) {
                pic = pic.slice(1)
                self.setData({
                  pic: pic
                })
                Fn;
              }
            }

          }
        })
      })
    } else {
      self.setData({
        pic: ''
      })
      Fn;
    }


    return true;
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