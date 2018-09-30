//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    showUpdateUserInfo: false,  //用户信息授权是否显示
    dateNewNavIndex:0,  //每日上新导航活动项下标
    curpage:1,        //每日上新分类
    loaded:false,      //每日上新产品是否加载完成
    modelAnimation: {},          //模态框动画
    showAttrModel: false,        //属性选择模态框控制
    stock: 0,                   //当前库存
    price: 0,                   //当前价格
    count: 1,                   //产品数量
    attrArr: [],
    attrData: []
  },
  onLoad: function () {
    this.getuserInfoCallback();
  },
  // 设置banner的高
  imgOnload: function (e) {
    var res = wx.getSystemInfoSync();
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      ratio = imgwidth / imgheight;
    this.setData({
      swiperHeight: (res.windowWidth - 30) / ratio
    })
  },
  getuserInfoCallback:function(){
    var that = this;
    if(app.globalData.session_key){
      that.getNav();  //分类导航
      that.getBanner();  //获取banner
      that.getHotProducts();
      that.getSpecial();  //专题
      that.getDateNewNav(); //每日上新导航
    }else{
      app.getSessionKeyCallbackIndex = res =>{     //session_key之后的回调，在此处初始化数据，防止session_key获取不到
        //初始数据
        that.getNav();  //分类导航
        that.getBanner();  //获取banner
        that.getHotProducts();
        that.getSpecial();  //专题
        that.getDateNewNav(); //每日上新导航
      }
    }
  },
  //获取导航栏
  getNav:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.home.product.category.get',
        token:app.globalData.session_key
      },
      success:function(res){
        console.log('getNav',res);
        if(res.data.code == 0){
          that.setData({
            navData:res.data.data
          })
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
  //获取banner
  getBanner:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.home.flash.auto.pic.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getBanner',res);
        if(res.data.code == 0){
          that.setData({
            bannerData:res.data.data
          })
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
  //获取banner下产品
  getHotProducts:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.product.recommend.product.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getHotProducts',res);
        if(res.data.code == 0){
          that.setData({
            hotProductsData:res.data.data.data
          })
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
  //获取专题
  getSpecial:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.home.index.special.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getSpecial',res);
        if(res.data.code == 0){
          that.setData({
            specialData:res.data.data
          })
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
  //获取每日上新产品导航
  getDateNewNav:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.home.index.new.nav.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getDateNewNav',res);
        if(res.data.code == 0){
          that.setData({
            dateNewNav:res.data.data
          })
          if (res.data.data[0].id){
            that.getDateNewProducts(res.data.data[0].id);
            that.setData({
              dateNewId: res.data.data[0].id
            })
          }
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
  //获取每日上新产品产品列表，上新类别id
  getDateNewProducts:function(id){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.home.index.new.pro.get',
        token:app.globalData.session_key,
        category_id:id,
        curpage:that.data.curpage
      },
      success:function(res){
        // console.log('getDateNewProducts',res);
        if(res.data.code == 0){
          var dateNewProductsData = that.data.dateNewProductsData || [];
          dateNewProductsData = dateNewProductsData.concat(res.data.data);
          that.setData({
            dateNewProductsData: dateNewProductsData,
            curpage:that.data.curpage + 1,
            isToggle:false
          })
          if (res.data.data.length < res.data.page_size){
            that.setData({
              loaded:true
            })
          }
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
  //切换每日上新导航
  toggleDateNewNav:function(e){
    this.setData({
      dateNewNavIndex: e.currentTarget.dataset.index,  //每日上新导航活动项下标
      curpage: 1,        //每日上新分类
      loaded: false,      //每日上新产品是否加载完成
      dateNewProductsData:[],
      dateNewId: e.currentTarget.dataset.id,
      isToggle:true   //切换上新产品状态，避免触发页面触底事件
    })
    this.getDateNewProducts(e.currentTarget.dataset.id);
  },
  //快速添加产品到购物车
  addcart:function(e){
    var pid = e.currentTarget.dataset.pid;
    this.getProductInfo(pid);
    this.setData({
      pid:pid
    })
  },
  //查询产品基本属性信息
  getProductInfo:function(pid){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.product.product.attr.get',
        token:app.globalData.session_key,
        pid:pid
      },
      success:function(res){
        if(res.data.code == 0){
          if (res.data.attr_all_detail.length == 0){
            that.setData({
              attrArr: res.data.attr_all_detail,
              productData: res.data.data,
              price: res.data.data.product_price,
              stock: res.data.data.product_stock
            })
            that.addCar();
          }else{
            that.setData({
              attrArr: res.data.attr_all_detail,
              productData:res.data.data,
              price:res.data.data.product_price,
              stock:res.data.data.product_stock
            })
            that.initAttrData();
            that.showAttrModel();
          }
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
  // 初始化属性数组attrData
  initAttrData: function () {
    var attrArr = this.data.attrArr || [];
    var attrData = this.data.attrData || [];
    for (var i = 0; i < attrArr.length; i++) {
      for (var j = 0; j < attrArr[i].attr_value_list.length; j++) {
        //index是属性在attrData下的下标，大于或等于0表示找到了该属性，则需要查询对应属性值，等于-1时未找到该属性，则添加属性及其属性值,
        var index = this.getAttrKeyIndex(attrData, attrArr[i].attr_value_list[j].attrKey);
        if (index >= 0) {
          var attrValueIndex = this.getAttrValueIndex(attrData, index, attrArr[i].attr_value_list[j].attrValue);
          //attrValueIndex大于等于0表示已存在该属性值，不做任何处理，等于-1未找到该属性值，将该属性加入到对应属性下
          if (attrValueIndex == -1) {
            attrData[index].attrValue.push(attrArr[i].attr_value_list[j].attrValue);
            attrData[index].attrId.push(attrArr[i].attr_value_list[j].attrId);
          }
        } else {
          //查询sku全排列数组，index为-1，添加属性和属性值
          attrData.push({
            attrKey: attrArr[i].attr_value_list[j].attrKey,
            attrValue: [attrArr[i].attr_value_list[j].attrValue],
            attrId: [attrArr[i].attr_value_list[j].attrId],
            attrControl: [],
            attrStatus: []
          })
        }
      }
    }

    //根据属性值对应的库存添加attrData中属性值控制(attrControl)
    for (var k = 0; k < attrData.length; k++) {
      for (var m = 0; m < attrData[k].attrId.length; m++) {
        var attrStockStatus = this.searchAttrValueStockBack(attrData[k].attrId[m]);
        //attrStockStatus为false是该属性对应的所有库存都为0，将对应的attrControl设置为false,否则设置为true
        if (attrStockStatus) {
          attrData[k].attrControl.push(true)
        } else {
          attrData[k].attrControl.push(false)
        }
      }
    }

    //根据属性sku数据，如果每个属性只有一个值，并且库存大于0，则将选择状态置为true,否则置为false
    if (attrArr.length == 1 && attrArr[0].attr_stock > 0) {
      for (var k = 0; k < attrData.length; k++) {
        for (var m = 0; m < attrData[k].attrId.length; m++) {
          attrData[k].attrStatus.push(true)
        }
      }
      //所有属性只有一个值时，默认选中同时将属性库存和价格保存到全局库存和价格中
      this.setData({
        stock: attrArr[0].product_stock,
        price: attrArr[0].attr_change_price
      })
    } else {
      for (var k = 0; k < attrData.length; k++) {
        for (var m = 0; m < attrData[k].attrId.length; m++) {
          attrData[k].attrStatus.push(false)
        }
      }
    }
    //将初始化数据赋值到data
    this.setData({
      attrData: attrData
    })
    // console.log(attrData);
  },
  //查询对应的attrData是否有attrKey值，有返回位置坐标，没有返回-1
  //attrData属性数组，attr_key要查询的属性名
  getAttrKeyIndex: function (attrData, attr_key) {
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].attrKey == attr_key) {
        return i;
      }
    }
    return -1;
  },
  //查询attrData下对应的attrkey中是否有属性值attr_value,有则返回下标，不存在返回-1
  //attrData属性数组，index要查询的attr_key的下标，由getAttrKeyIndex获取，attr_value要查询的属性值
  getAttrValueIndex: function (attrData, index, attr_value) {
    return attrData[index].attrValue.indexOf(attr_value)
  },
  //初始化数据是查询每个属性下对应的库存是否都为0，有库存返回true,没有库存返回false
  searchAttrValueStockBack: function (attr_id) {
    var attrArr = this.data.attrArr;
    for (var i = 0; i < attrArr.length; i++) {
      for (var j = 0; j < attrArr[i].attr_value_list.length; j++) {
        if (attrArr[i].attr_value_list[j].attrId == attr_id && Number(attrArr[i].product_stock) > 0) {
          return true;
        }
      }
    }
    return false;
  },
  //选择或取消属性时，根据sku数据库存判断每个属性的可选状态
  //规则：首先初始化所有属性状态为可选状态(true),根据attrData中选中的属性selectedId(selectedValue)查询其他属性中库存状态,没有库存将可选状态置为false,如果可选状态已经为false则不做处理，如果所有属性都未选中，则进行初始数据中可选操作【根据属性值对应的库存添加attrData中属性值控制(attrControl)】
  selectAttr: function (e) {
    var attr_value = e.currentTarget.dataset.attr_value;      //当前选中或取消的属性值
    var attr_id = e.currentTarget.dataset.attr_id;            //当前选中或取消的属性值id
    var attr_status = e.currentTarget.dataset.attr_status;    //当前选中或取消的属性值选中状态
    var attr_kindex = e.currentTarget.dataset.kindex;         //当前选中或取消的属性下标
    var attr_vindex = e.currentTarget.dataset.vindex;         //当前选中或取消的属性值下标

    var attrData = this.data.attrData;
    if (attr_status) {
      //这里是取消选择
      attrData[attr_kindex].attrStatus[attr_vindex] = false;
      attrData[attr_kindex].selectedValue = '';
      attrData[attr_kindex].selectedId = '';
    } else {
      //这里是选择属性
      if (attrData[attr_kindex].selectedId || attrData[attr_kindex].selectedValue) {
        //该属性值已经选择，这里是切换当前属性值
        var oldAttrValueIndex = this.getAttrValueIndex(attrData, attr_kindex, attrData[attr_kindex].selectedValue);
        attrData[attr_kindex].attrStatus[oldAttrValueIndex] = false;
        attrData[attr_kindex].attrStatus[attr_vindex] = true;
        attrData[attr_kindex].selectedValue = attr_value;
        attrData[attr_kindex].selectedId = attr_id;
      } else {
        //该属性值未选择，这里是选择当前属性值
        attrData[attr_kindex].attrStatus[attr_vindex] = true;
        attrData[attr_kindex].selectedValue = attr_value;
        attrData[attr_kindex].selectedId = attr_id;
      }
    }
    var selectedAttr = this.getSelectedAttr(attrData);
    this.resetAttrControl(attrData, selectedAttr);


    if (selectedAttr.selected_id.length == attrData.length) {
      var attrSkuInfo = this.getSeletedAttrInfo(selectedAttr.selected_id);
      if (attrSkuInfo) {
        this.setData({
          price: attrSkuInfo.attr_change_price,
          stock: attrSkuInfo.product_stock,
        })
      }
    } else {
      this.setData({
        price: this.data.productData.product_price,
        stock: this.data.productData.product_stock
      })
    }
    this.setData({
      attrData: attrData,
      seletedAttr: selectedAttr.selected_value.join(',')
    })
  },
  //根据当前选中的属性数组查找当前属性组的详细信息（价格、库存）
  getSeletedAttrInfo: function (selectedAttrId) {
    var attrArr = this.data.attrArr || [];
    if (selectedAttrId.length > 0) {
      for (var i = 0; i < attrArr.length; i++) {
        if (attrArr[i].attr_value_list.length == selectedAttrId.length) {
          var com = 0;
          for (var k = 0; k < attrArr[i].attr_value_list.length; k++) {
            if (selectedAttrId.indexOf(attrArr[i].attr_value_list[k].attrId) >= 0) {
              com += 1;
            }
          }
          if (com == attrArr[i].attr_value_list.length) {
            return attrArr[i];
          }
        } else {
          return false;
        }
      }
      return false;
    } else {
      return false;
    }

  },
  //根据已经选择的属性判断其他属性的属性值是否可选
  resetAttrControl: function (attrData, selectedAttr) {
    var attrArr = this.data.attrArr;
    //重置属性可操作值为true
    for (var i = 0; i < attrData.length; i++) {
      for (var j = 0; j < attrData[i].attrControl.length; j++) {
        attrData[i].attrControl[j] = true;
      }
    }
    //全局库存查询，将没有库存的属性值可选控制直接置为false
    for (var k = 0; k < attrData.length; k++) {
      for (var m = 0; m < attrData[k].attrId.length; m++) {
        var attrStockStatus = this.searchAttrValueStockBack(attrData[k].attrId[m]);
        //attrStockStatus为false是该属性对应的所有库存都为0，将对应的attrControl设置为false,否则设置为true
        if (!attrStockStatus) {
          attrData[k].attrControl[m] = false;
        }
      }
    }
    //通过已选择属性判断同时还有该属性值的其他属性是否存在库存，没有库存则可选属性置为false
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].selectedId) {
        for (var j = 0; j < attrData.length; j++) {
          if (i != j) {
            for (var k = 0; k < attrData[j].attrId.length; k++) {
              if (attrData[j].attrControl[k]) {
                var hasStock = this.searchTwoAttrValueStockBack(attrData[i].selectedId, attrData[j].attrId[k]);
                if (!hasStock) {
                  attrData[j].attrControl[k] = false;
                }
              }
            }
          }
        }
      } else {
        //通过已经选择的所有属性判断还未选择的属性的库存是否存在
        for (var m = 0; m < attrData[i].attrId.length; m++) {
          if (attrData[i].attrControl[m]) {
            var attrStatus = this.searchAttrValueStock(selectedAttr.selected_id, attrData[i].attrId[m]);
            if (!attrStatus) {
              attrData[i].attrControl[m] = false;
            }
          }
        }
      }
    }
    //判断已经选择的所有属性自身相对于已经选择的其他属性值判断是否存在库存
    for (var i = 0; i < attrData.length; i++) {
      if (selectedAttr.selected_id.length > 1 && attrData[i].selectedId) {
        for (var n = 0; n < attrData[i].attrId.length; n++) {
          if (attrData[i].attrControl[n]) {
            var attrIdArr = [];
            for (var x = 0; x < selectedAttr.selected_id.length; x++) {
              if (selectedAttr.selected_id[x] != attrData[i].selectedId) {
                attrIdArr.push(selectedAttr.selected_id[x])
              }
            }
            var attrStatus = this.searchAttrValueStock(attrIdArr, attrData[i].attrId[n]);
            if (!attrStatus) {
              attrData[i].attrControl[n] = false;
            }
          }
        }
      }
    }
  },
  //判断同时含有两个属性值得sku数据库存是否大于0，有库存返回true，没有库存返回false
  searchTwoAttrValueStockBack: function (selectedId, attr_id) {
    var attrArr = this.data.attrArr;
    var num = 0;
    for (var i = 0; i < attrArr.length; i++) {
      num = 0;
      for (var j = 0; j < attrArr[i].attr_value_list.length; j++) {
        if (attrArr[i].attr_value_list[j].attrId == attr_id || attrArr[i].attr_value_list[j].attrId == selectedId && Number(attrArr[i].product_stock) > 0) {
          num += 1;
        }
      }
      if (num == 2) {
        return true;
      }
    }
    return false;
  },
  //获取已经选择的属性id对应的未选中的属性库存是否存在,attrIdArr已选择的属性id数组，attr_id为为选择的属性对应的属性值id
  searchAttrValueStock: function (attrIdArr, attr_id) {
    var attrArr = this.data.attrArr;
    for (var i = 0; i < attrArr.length; i++) {
      var num = 0;
      for (var j = 0; j < attrArr[i].attr_value_list.length; j++) {
        if (attrIdArr.indexOf(attrArr[i].attr_value_list[j].attrId) >= 0 || attrArr[i].attr_value_list[j].attrId == attr_id) {
          num += 1;
        }
      }
      if (num == (attrIdArr.length + 1)) {
        return true;
      }
    }
    return false;
  },
  //获取已经选择的属性id和value
  getSelectedAttr: function (attrData) {
    var selected_id = [];
    var selected_value = [];
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].selectedId) {
        selected_id.push(attrData[i].selectedId);
        selected_value.push(attrData[i].selectedValue);
      }
    }
    return {
      selected_id: selected_id,
      selected_value: selected_value
    }
  },
  reduceCount: function () {
    if (this.data.count > 1) {
      this.setData({
        count: this.data.count - 1
      })
    }
  },
  addCount: function () {
    if (this.data.count < this.data.stock) {
      this.setData({
        count: Number(this.data.count) + 1
      })
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 1500
      })
    }
  },
  modelAnimation: function () {
    var animation = wx.createAnimation({
      duration: 200
    })
    animation.opacity(1).step();
    this.setData({
      modelAnimation: animation.export()
    })
  },
  showAttrModel: function () {
    this.setData({
      showAttrModel: true
    })
    this.modelAnimation();
  },
  closeAttrModel: function () {
    this.setData({
      modelAnimation: {},          //模态框动画
      showAttrModel: false,        //属性选择模态框控制
      stock: 0,                   //当前库存
      price: 0,                   //当前价格
      count: 1,                   //产品数量
      attrArr: [],
      attrData: [],
      pid:''
    })
  },
  //加入购物车
  addCar: function () {
    var that = this;
    var attr_id = this.getSelectedAttr(this.data.attrData);
    if (attr_id.selected_value.length < this.data.attrData.length) {
      wx.showToast({
        title: '请选择产品属性',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.stock <= 0) {
      wx.showToast({
        title: '产品无库存',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.count > this.data.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.goods.add.cart.action',
        token: app.globalData.session_key,
        product_id: that.data.pid,
        product_count: that.data.count,
        attr_id: attr_id.selected_id.join(',')
      },
      success: function (res) {
        // console.log('addCar',res);
        if (res.data.code == 0) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          })
          that.closeAttrModel();
        } else if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000
          })
        } else if (res.data.code >= 999) {
            app.getSessionKeyCallback = res => {
              that.addCar();
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
  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    if (this.data.loaded || this.data.isToggle){
      return;
    }
    this.getDateNewProducts(this.data.dateNewId);
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '自定义转发标题',
        path: '/pages/index/index'
      }
    }
    
  },
  onPullDownRefresh:function(){
    var that = this;
    app.checkSessionKey(function(){
      that.setData({
        dateNewNavIndex: 0,  //每日上新导航活动项下标
        curpage: 1,        //每日上新分类
        loaded: false,      //每日上新产品是否加载完成
        showAttrModel: false,        //属性选择模态框控制
        stock: 0,                   //当前库存
        price: 0,                   //当前价格
        count: 1,                   //产品数量
        attrArr: [],
        attrData: []
      })
      that.getNav();  //分类导航
      that.getBanner();  //获取banner
      that.getHotProducts();
      that.getSpecial();  //专题
      that.getDateNewNav(); //每日上新导航
      wx.stopPullDownRefresh();
    })
  }
})
