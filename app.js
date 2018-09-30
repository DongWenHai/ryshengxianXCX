//app.js
App({
  onLaunch: function () {
    const that = this;
    const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
    console.log(extConfig);
    if (extConfig.api_url && extConfig.appid) {
      that.config.url = extConfig.api_url;
      that.config.extAppid = extConfig.appid;
      that.config.app_type = extConfig.app_type;
    } else {
      wx.showModal({
        title: '警告',
        content: '第三方数据异常',
      })
    }
    this.getSessionKey();
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    this.updateVersion();
  },
  config:{
    platform:'wxxcx',
    url:'https://www.ruoyw.cn/api/new_mall/shop3/public/api/data/'
  },
  globalData: {
    userInfo: null,
    session_key:null
  },
  POST: function (o) {
    var self = this;
    if(!o.fail || (typeof o.fail !== 'function')){
      o.fail = function(err){
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon:'none',
          duration:2000
        })
      }
    }
    wx.request({
      url: o.url,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: o.data,
      success: o.success,
      fail: o.fail,
      complete: o.complete
    })
  },
  //升级版本
  updateVersion:function(){
    // 版本升级提醒
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })

      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  //同步用户信息
  updateUserInfo: function (userInfo) {
    var that = this;
    this.POST({
      url: that.config.url,
      data: {
        platform: that.config.platform,
        request: 'public.weixin.user.openid.from.code.get',
        token: that.globalData.session_key,
        userInfo: JSON.stringify(userInfo)
      },
      success: function (ret) {
        // console.log(ret);
        if (ret.data.code == 0) {
          if (that.updateUserInfoCallback) {
            that.updateUserInfoCallback(ret)
          }
        } else if (ret.data.code >= 999) {
          that.getSessionKeyCallback = function (res) {
            that.updateUserInfo(userInfo);
          }
          that.getSessionKey();
        } else {
          wx.showToast({
            title: ret.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //获取session_key
  getSessionKey:function(){
    var that = this;
    wx.showLoading({
      title: '正在登录',
      mask:true
    })
    wx.login({
      success:function(res){
        that.POST({
          url: that.config.url,
          data: {
            platform: that.config.platform,
            request: 'public.weixin.user.openid.from.code.get',
            code:res.code,
            // userInfo:JSON.stringify(that.globalData.userInfo)
          },
          success:function(ret){
            // console.log(ret);
            wx.hideLoading();
            if(ret.data.code == 0){
              that.globalData.session_key = ret.data.session_key;
              that.getUserData();
              //获取session_key的回调，避免page身份信息获取不到
              if(that.getSessionKeyCallback){
                that.getSessionKeyCallback(ret)
              }
              if (that.getSessionKeyCallbackIndex) {
                that.getSessionKeyCallbackIndex(ret)
              }
            }else{
              wx.showToast({
                title: ret.data.msg,
                icon:'none',
                duration:2000
              })
            }
          },
          fail:function(){
            wx.hideLoading();
            wx.showToast({
              title: '获取登录信息失败',
              icon:'none',
              duration:2000
            })
          }
        })
      }
    })
    
  },
  //获取用户信息
  getUserData:function(){
    var that = this;
    this.POST({
      url:that.config.url,
      data:{
        platform:that.config.platform,
        request:'private.weixin.user.info.get',
        token:that.globalData.session_key
      },
      success:function(res){
        // console.log('getUserData',res);
        if(res.data.code ==0){
          that.globalData.userData = res.data.data;
          //获取用户信息回调，避免page的异步造成获取数据失败的问题
          if(that.getUserDataCallback){
            that.getUserDataCallback(res);
          }
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '获取用户信息失败',
          icon:'none',
          duration:2000
        })
      }
    })
  },
  //验证session_key有效期
  checkSessionKey:function(fn){
    var that = this;
    this.POST({
      url:that.config.url,
      data:{
        platform:that.config.platform,
        request:'private.user.get.check.token',
        token:that.globalData.session_key
      },
      success:function(res){
        if(res.data.code == 0){
          if(fn && typeof fn == 'function'){
            fn();
          }
        }else if(res.data.code >= 999){
          that.getSessionKeyCallback = res =>{
            if (fn && typeof fn == 'function') {
              fn();
            }
          }
          that.getSessionKey();
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          })
        }
      }
    })
  }
})