layui.use(['layer', 'form', 'laypage'], function () {
  var layer = layui.layer,
    form = layui.form,
    laypage = layui.laypage,
    $ = layui.$;

  form.render(null, 'search-form');

  //渲染函数
  function showResult(objData) {
    laypage.render({
      elem: objData.pageId, //分页id
      count: objData.count, //数据总数
      limit: 10,
      layout: ['count', 'prev', 'page', 'next'],
      groups: 1,
      prev: '<i class="layui-icon">&#xe603;</i>',
      next: '<i class="layui-icon">&#xe602;</i>',
      theme: '#3e74b7',
      jump: function (obj, first) {
        //obj 包含了当前分页的所有参数，比如：
        //obj.curr 得到当前页，以便向服务端请求对应页的数据。
        //obj.limit 得到每页显示的条数

        //二次请求
        $.ajax({
          url: objData.url, //传入接口
          type: 'get',
          dataType: 'json',
          data: {
            limit: obj.limit, //传入limit(obj.limit)
            page: obj.curr //当前页(obj.limit)
          },
          success: function(res) {
            //分页渲染
            document.getElementById(objData.boxId).innerHTML = function(){ //目标容器
              var arr = []
              ,thisData = res.data;

              layui.each(thisData, function(index, item){
                var _name = objData.itemName, //数据名字，变量作为属性名，通过eval()来实现
                    _val = objData.itemVal; //数据值，变量作为属性名

                var _html = `<div class="rerult-item">
                              <div class="item-border">
                                <div class="item-number">
                                  <div>${index + 1}</div>
                                </div>
                                <div class="item-info">
                                  <div>
                                    <div class="item-name layui-elip">${eval('item.'+_name) == 'null'? '未知': eval('item.'+_name)}</div>
                                    <div class="item-location layui-elip"><span>${objData.valName}</span>${eval('item.'+_val) == 'null'? '未知': eval('item.'+_val)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>`;
                arr.push(_html);
              });
              return arr.join('');
            }();
          }
        });
      }
    });
  }

  //固定卡点
  //初次请求获取接口数据总数
  $.get('http://47.96.165.26:8080/zhuji/kadian/getList', function(data) {
    var _objData = {
          'pageId': 'gdkd', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'gdkd_box', //目标容器
          'itemName': 'name', //数据名字
          'valName': '位置：', //值名称（位置或编号）
          'itemVal': 'intercerptaddress', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/kadian/getList' //数据接口
        };
    //固定卡点渲染
    showResult(_objData);
  });

  //卡口系统
  $.get('http://47.96.165.26:8080/zhuji/kakou/getList?origin=-1', function(data) {
    var _objData = {
          'pageId': 'kkxt', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'kkxt_box', //目标容器
          'itemName': 'crossingName', //数据名字
          'valName': '编号：', //值名称（位置或编号）
          'itemVal': 'crossingIndexCode', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/kakou/getList'
        };
    //卡口系统渲染
    showResult(_objData);
  });

  //治安监控
  $.get('http://47.96.165.26:8080/zhuji/camera/getList', function(data) {
    var _objData = {
          'pageId': 'zajk', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'zajk_box', //目标容器
          'itemName': 'name', //数据名字
          'valName': '编号：', //值名称（位置或编号）
          'itemVal': 'indexCode', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/camera/getList'
        };
    //治安监控渲染
    showResult(_objData);
  });

  //防控警力
  $.get('http://47.96.165.26:8080/zhuji/crossing/getList', function(data) {
    var _objData = {
          'pageId': 'fkjl', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'fkjl_box', //目标容器
          'itemName': 'name', //数据名字
          'valName': '位置：', //值名称（位置或编号）
          'itemVal': 'intercerptaddress', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/crossing/getList'
        };
    //防控警力渲染
    showResult(_objData);
  });

  //巡处车辆
  $.get('http://47.96.165.26:8080/zhuji/equipment/getList', function(data) {
    var _objData = {
          'pageId': 'xccl', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'xccl_box', //目标容器
          'itemName': 'deviceName', //数据名字
          'valName': '编号：', //值名称（位置或编号）
          'itemVal': 'deviceCode', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/equipment/getList'
        };
    //巡处车辆渲染
    showResult(_objData);
  });

  //警情
  $.get('http://47.96.165.26:8080/zhuji/jingqing/getList', function(data) {
    var _objData = {
          'pageId': 'jq', //分页id
          'count': data.count, //接口数据总数
          'boxId': 'jq_box', //目标容器
          'itemName': 'situationContext', //数据名字
          'valName': '位置：', //值名称（位置或编号）
          'itemVal': 'alarmAddress', //数据值
          'url': 'http://47.96.165.26:8080/zhuji/jingqing/getList'
        };
    //警情渲染
    showResult(_objData);
  });

  function checkTime(time) {
    //校验时间,小于10前面加0
    if (time < 10) return "0" + time;
    return time;
  }

  function getTime() {
    var date = new Date();
    //显示年月日时分秒
    $('#time_box').html('当前时间：' + checkTime(date.getFullYear()) + '年' + checkTime(date.getMonth() + 1) + '月' + checkTime(date.getDate()) + '日' + checkTime(date.getHours()) + ":" + checkTime(date.getMinutes()) + ":" + checkTime(date.getSeconds()));
  }

  //--陈雪梅新增-start
  function listScroll() {
    $('.page-box').getNiceScroll().hide();
    $('.page-box').getNiceScroll().show();
    $('.page-box').getNiceScroll().resize();
    $('.page-box').niceScroll({
      cursorcolor: "#BDBDBD", //滚动条的颜色
      cursoropacitymax: 1, //滚动条的透明度，从0-1
      touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
      cursorwidth: "5px", //滚动条的宽度
      cursorborder: "0", // 游标边框css定义
      cursorborderradius: "6px", //以像素为光标边界半径  圆角
      //autohidemode最好设置为true，这样切换的时候会自动隐藏滚动条
      autohidemode: true, //是否隐藏滚动条  true的时候默认不显示滚动条，当鼠标经过的时候显示滚动条
      zindex: "auto", //给滚动条设置z-index值
      railpadding: {
        top: 0,
        right: 0,
        left: 0,
        bottom: 0
      } //滚动条的位置
    });
  }
  //--陈雪梅新增-end

  $(document).ready(function () {
    getTime();
    var timer = setInterval(function () {
      getTime();
    }, 1000);

    $('.tab-box > div').click(function (event) {
      var _index = $(this).index();
      if (_index === 0) {
        $('.search-box,.left_box_one,.left_box_two').css('display', 'none');
        $('.map-content').css('display', 'block');
      } else if (_index === 1) {
        $('.map-content,.left_box_two').css('display', 'none');
        $('.search-box,.left_box_one').css('display', 'block');
      } else if (_index === 2) {
        $('.map-content,.left_box_one').css('display', 'none');
        $('.search-box,.left_box_two').css('display', 'block');
      }

      $(this).addClass('active').siblings().removeClass('active');
    });

    //--陈雪梅新增-start
    listScroll();

    $('.sidebar-bg > div').click(function (event) {
      $(this).addClass('active').siblings().removeClass('active');
      var _index = $(this).index();

      $('.search-result > div').eq(_index).css('display', 'block').siblings().css('display', 'none');
    });
    //--陈雪梅新增-end
  });
});