//注意：选项卡 依赖 element 模块，否则无法进行功能性操作
layui.use(['element', 'form', 'laypage'], function () {
    var $ = layui.$,
        form = layui.form,
        laypage = layui.laypage,
        element = layui.element;
    //滚动条方法
    function niceScroll(obj) {
        obj.niceScroll({
            cursorcolor: "#d0d6dd", //滚动条的颜色
            cursoropacitymax: 1, //滚动条的透明度，从0-1
            touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
            cursorwidth: "5px", //滚动条的宽度
            cursorborder: "0", // 游标边框css定义
            cursorborderradius: "5px", //以像素为光标边界半径  圆角
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
    niceScroll($('.unfold-cons-box'));
    niceScroll($('.Z_unfold-cons-box1'));
    niceScroll($('.Z_unfold-cons-box'));
    element.on('tab(big-tab)', function (data) {
        switch (data.index) {
            case 0:
                $('.Z_sh .left_show_box').css({
                    'background': 'url(./images/tabs1_03.png)',
                    'background-size': 'cover'
                });
                $('#big-tab .layui-tab-title li.layui-this').siblings().find('img').attr('src', 'images/route-hover.png');
                $('#big-tab .layui-tab-title li.layui-this').find('img').attr('src', 'images/video.png');
                break;
            case 1:
                $('.Z_sh .left_show_box').css({
                    'background': 'url(./images/tabs2_03.png)',
                    'background-size': 'cover'
                });
                $('#big-tab .layui-tab-title li.layui-this').siblings().find('img').attr('src', 'images/video-hover.png');
                $('#big-tab .layui-tab-title li.layui-this').find('img').attr('src', 'images/route.png');
                break;
        }
    });
    //收缩按钮
    var $trun = 0;
    $(".shrinkBtn").click(function () {
        if ($trun) {
            $('.unfold-box .shrinkBtn span').html('收缩');
            $('.unfold-box .shrinkBtn i').html('&#xe619;');
            $(".video-list,.Z_unfold-cons-box1").css("display", "block");
            $('.left_box_one').css('height', 'calc(100% - 140px)');
            $('.Z_unfold-box1 .left').css('box-shadow', '0px 0px 0px 0px rgba(63, 120, 183, 0.25)');
            $trun = 0;
        } else {
            $('.unfold-box .shrinkBtn span').html('展开');
            $('.unfold-box .shrinkBtn i').html('&#xe61a;');
            $(".video-list,.Z_unfold-cons-box1").css("display", "none");
            $('.Z_unfold-box1 .left').css('box-shadow', '0px 2px 2px 0px rgba(63, 120, 183, 0.25)');
            $('.left_box_one').css('height', 'calc(100% - 740px)');
            $trun = 1;
        }
    })
    // 查看监控
    $(document).delegate(".unfold-cons", "click", function (e) {
        var _indexs = $(this).index();
        if ($(e.target).hasClass('monitorBtn')) {
            $('.video-list').css('display', 'none');
            // 到时候在这调用ajax 传值
            $('.Z_unfold-box,.Z_unfold-cons-box').css('display', 'block');
        }
    })
    //返回查看监控
    $('.backBtn').click(function () {
        $('.Z_unfold-box,.Z_unfold-cons-box').css('display', 'none');
        $('.unfold-box,.unfold-cons-box').css('display', 'block');
    })
    //点击时间段切换
    //点击5分钟
    $('.five-box').click(function () {
        $('.Z_time_line .line-bg').css('background', 'url(./images/0-5.png)');
        $('.Z_unfold-box1 .mins-box').html('5');
    })
    //点击15分钟
    $('.fivteen-box').click(function () {
        $('.Z_time_line .line-bg').css('background', 'url(./images/0-15.png)');
        $('.Z_unfold-box1 .mins-box').html('15');
    })
    //点击3分钟
    $('.three-box').click(function () {
        $('.Z_time_line .line-bg').css('background', 'url(./images/0-3.png)');
        $('.Z_unfold-box1 .mins-box').html('3');
    })
    let [i, videoArr] = [0, []];
    var indexs = 0;
    //多屏监控
    $('.more-video-btn').on('click', function () {
        $('.more-video-box').css('display', 'block');
        $('.Z_unfold-cons-box .unfold-cons').on('click', function () {
            var _showId = $(this).index();
            var _showHref = $(this).attr('vhref');
            aquireVideo(_showId, _showHref);
        })
    })

    function startPlay(id) {
        var myPlayer = videojs(id);
        videojs(id, {}, function onPlayerReady() {
            videojs.log('Your player is ready!');
            this.play();
            this.on('ended', function () {
                videojs.log('Awww...over so soon?!');
            });
        });
    }
    //		视频盒子被点击
    function aquireVideo(_showId, _showHref) {
        var _showId = _showId;
        var _showHref = _showHref;
        videoArr.push({
            id: _showId,
            vhref: _showHref
        })
        console.log(videoArr);
        var vivHtml = `<video
                                 id="my-player${i}"
                                 class="video-js"
                                 autoplay="autoplay"
                                 style="width:100%; height:100%; object-fit:contain"
                                 controls
                                 data-setup='{}'>
                                 <source src='${_showHref}' type='rtmp/flv'/>  
                             </video>`;
        $('.small-box').eq(indexs).html(vivHtml);
        startPlay('my-player' + i);
        i++;

    }
    $('.small-box').click(function () {
        indexs = $(this).index();
        $(this).siblings().css('border', '3px solid #3364a7');
        $(this).css({
            'border': '3px solid blue',
            'cursor': 'pointer'
        });
    })
    //多屏监控关闭按钮
    $('#video-close-btn').click(function () {
        $('.more-video-box').css('display', 'none');
        $('.Z_unfold-cons-box .unfold-cons').unbind();
    });
    // 返回多屏监控
    $('.backBtn').click(function () {
        $('.more-video-box').css('display', 'none');
    })
    //视频监控列表展示
    // $.ajax({
    //     type: 'get',
    //     url: '',
    //     data: '',
    //     success: function (data) {
    //         console.log(data);
    //     }
    // });
    //监听警力调度下拉框
    form.on('select(range-select)', function (data) {
        // console.log(data.value); //得到被选中的value值
    });
     //步巡警力列表展示
    $.ajax({
        type: 'get',
        url: 'http://47.96.165.26:8080/zhuji/equipment/getList',
        data: {
            'deviceType': '2'
        },
        success: function (res) {
            //步巡警力列表展示
            laypage.render({
                elem: 'jlddPage',
                count: res.count, //数据总数，从服务端得到
                limit: 10,
                layout: ['count', 'prev', 'page', 'next'],
                groups: 1,
                prev: '<i class="layui-icon">&#xe603;</i>',
                next: '<i class="layui-icon">&#xe602;</i>',
                theme: '#3e74b7',
                jump: function (obj, first) {
                    $.ajax({
                        type: 'get',
                        url: 'http://47.96.165.26:8080/zhuji/equipment/getList',
                        data: {
                            'deviceType': '2',
                            'limit': obj.limit,
                            'page': obj.curr
                        },
                        success: function (res) {
                            // 警力调度分页
                            $('.Z_monitor_list_box .unfold-cons-box').empty();
                            $.each(res.data, function (index, value) {
                                console.log(value);
                                var _bxjlHtml = `<div class="unfold-cons">
                                <div class="num">${index + 1}</div>
                                <div class="cons">
                                    <div class="top-cons">
                                        <div class="title">${value.deviceName}</div>
                                    </div>
                                    <div class="bot-cons">
                                        <div class="hours">
                                            <span>编号:</span>
                                            <b>${value.orgSn}</b>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                                $('.Z_monitor_list_box .unfold-cons-box').append(_bxjlHtml);
                            })
                        }
                    });
                    //首次不执行
                    if (!first) {
                        //do something
                    }
                }
            });
        }
    });
     //车巡警力列表展示
    $.ajax({
        type: 'get',
        url: 'http://47.96.165.26:8080/zhuji/equipment/getList',
        data: {
            'deviceType': '1'
        },
        success: function (res) {
            //步巡警力列表展示
            laypage.render({
                elem: 'cxjlPage',
                count: res.count, //数据总数，从服务端得到
                limit: 10,
                layout: ['count', 'prev', 'page', 'next'],
                groups: 1,
                prev: '<i class="layui-icon">&#xe603;</i>',
                next: '<i class="layui-icon">&#xe602;</i>',
                theme: '#3e74b7',
                jump: function (obj, first) {
                    $.ajax({
                        type: 'get',
                        url: 'http://47.96.165.26:8080/zhuji/equipment/getList',
                        data: {
                            'deviceType': '1',
                            'limit': obj.limit,
                            'page': obj.curr
                        },
                        success: function (res) {
                            // 警力调度分页
                            $('#cxjl_box').empty();
                            $.each(res.data, function (index, value) {
                                var _cxjlHtml = `<div class="unfold-cons">
                                <div class="num">${index + 1}</div>
                                <div class="cons">
                                    <div class="top-cons">
                                        <div class="title">${value.deviceName}</div>
                                    </div>
                                    <div class="bot-cons">
                                        <div class="hours">
                                            <span>编号:</span>
                                            <b>${value.orgSn}</b>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                                $('#cxjl_box').append(_cxjlHtml);
                            })
                        }
                    });
                    //首次不执行
                    if (!first) {
                        //do something
                    }
                }
            });
        }
    });
    //视频切换按钮
    function btnclick() {
        $('.oneBtn').css('background', 'url(images/video/screen-1.png)');
        $('.fourBtn').css('background', 'url(images/video/screen-4.png)');
        $('.sixBtn').css('background', 'url(images/video/screen-6.png)');
        $('.nineBtn').css('background', 'url(images/video/screen-9.png)');
    }
    $('.oneBtn').click(function () {
        $('.monitor-box .small-box').removeClass('four-box six-big-box six-box').addClass('one-box');
        btnclick();
        $(this).css('background', 'url(images/video/screen-hover-1.png)');
    })
    $('.fourBtn').click(function () {
        $('.monitor-box .small-box').removeClass('one-box six-big-box six-box').addClass('four-box');
        btnclick();
        $(this).css('background', 'url(images/video/screen-hover-4.png)');
    })
    $('.sixBtn').click(function () {
        $('.monitor-box .small-box').removeClass('one-box four-box').addClass('six-box').eq(0).removeClass(
            'six-box').addClass('six-big-box');
        btnclick();
        $(this).css('background', 'url(images/video/screen-hover-6.png)');
    })
    $('.nineBtn').click(function () {
        $('.monitor-box .small-box').removeClass('one-box six-big-box four-box').addClass('six-box');
        btnclick();
        $(this).css('background', 'url(images/video/screen-hover-9.png)');
    })
});