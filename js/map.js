/**
 *Created by bobli on 2018/10/24.
 */
/**
 * @date 2018/10/24
 * @author bobli
 * @desc 开始
 */
layui.use(['layer', 'form'], function () {
    var layer = layui.layer,
        form = layui.form,
        $ = layui.$;
    var clusterVideoCamera,//视频监控点聚合图层 在form.on('checkbox')中初始化
        clusterBayonetSystem,//卡口系统点聚合图层 在form.on('checkbox')中初始化
        clusterPoliceEquipment,// 预留 警力设备点聚合图层
        clusterPoliceman,// 预留 警力点聚合图层
        firstInterceptCircle, secondInterceptCircle, thirdInterceptCircle,//三层拦截圈
        policeSituationMarkers = [],// 警情markers数组  于 注释“初始化 警情” 中初始化
        videoCameraMarkers = [],// 视频监控markers数组 于 注释“初始化 治安监控 videoCameraMarkers” 中初始化
        bayonetSystemMarkers = [],// 卡口系统markers数组 于 注释“初始化 bayonetSystemMarkers 卡口系统” 中初始化
        policeEquipmentMarkers = [],//巡处车辆markers数组 于 注释“初始化 巡处车辆 和 警力” 中初始化
        policemanMarkers = [],//警力设备markers数组 于 注释“初始化 巡处车辆 和 警力” 中初始化
        stableInterceptPoint = [],//初始化 固定卡点
        stableBayonet = [], //用于对固定卡点
        //拦截包围圈半径，(速度*时间)/60 单位km
        FIRSTINTERCEPTDISTANCE = (45 * 3) / 60.00, SECONDINTERCEPTDISTANCE = (45 * 5) / 60.00,
        THIRDINTERCEPTDISTANCE = (45 * 15) / 60.00,
        mapclickCount = 0, //用于计算 地图选择突击事件 点击的次数，当大于1时，解绑地图点击事件
        escapeRouteVideosMarker = [], //逃生路线上面的视频点
        drivingEscapeRoute = [],
        accidentOccurPlace = [],//地图自定义事件 发生地点Marker
        allInterceptPointDistance = [],
        interceptCicleInsideMarkers = []// 拦截圈内的拦截点信息
    ;


    //初始化地图容器
    var map = new AMap.Map('mapContainer', {
        zoom: 10,//初始化缩放级别
        center: [120.246863, 29.708692]// 显示中心点
    });
    //添加诸暨市边界
    var zhujiDistrictArea = new AMap.GeoJSON({
        geoJSON: $zhujiRegion,//此处的zhujiRegion为zhujiRegion.js 中定义的诸暨市的矢量边界全局变量
        getPolyline: function (geojson, lnglats) {
            return new AMap.Polyline({
                path: lnglats,
                isOutline: true,
                outlineColor: '#dddc4f',
                borderWeight: 2,
                strokeColor: '#7d90dd',
                strokeWeight: 3,
                strokeStyle: 'dashed'
            });
        }
    });
    map.add(zhujiDistrictArea);

    /* 治安监控、警力、巡处车辆、警情、卡口系统、固定卡点 图层初始化和现实与否控制 begin*/
    //初始化 治安监控 videoCameraMarkers
    $.ajax({
        url: 'js/zhujiCameraJson.json',
        type: 'GET',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {
                var _infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -40)
                });
                $.each(result, function (index, target) {
                    var _marker = new AMap.Marker({
                        icon: 'images/map/video.png',
                        position: [Number(target.LONGITUDE), Number(target.LATITUDE)],
                        offset: new AMap.Pixel(-15, -43)
                    });
                    videoCameraMarkers.push(_marker);
                    //给每一个marker绑定一个点击事件，用作弹出信息框
                    var info = "";

                    info += "<div>" + target.NAME + "</div>";
                    _marker.content = info;
                    _marker.on('click', function (ele) {
                        _infoWindow.setContent(ele.target.content);
                        _infoWindow.open(map, ele.target.getPosition())
                    });
                    _marker.on('mouseover', function (target) {
                        _marker.setIcon('images/map/videoChoose.png');
                    });
                    _marker.on('mouseout', function (target) {
                        _marker.setIcon('images/map/video.png');
                    });
                });
            }
            else {
                layer.alert('请求监控设备数据失败，请检查数据接口！');
            }
        }
    });
    //初始化 bayonetSystemMarkers 卡口系统
    $.ajax({
        url: 'js/zhujiKaKou.json',
        type: 'GET',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {

                var _infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -40)
                });
                $.each(result, function (index, target) {
                    var _marker = new AMap.Marker({
                        icon: 'images/map/bayonet.png',
                        position: [Number(target.LONGITUDE), Number(target.LATITUDE)],
                        offset: new AMap.Pixel(-15, -43)
                    });
                    bayonetSystemMarkers.push(_marker);
                    //给每一个marker绑定一个点击事件，用作弹出信息框
                    var info = "";
                    info += "<div>" + target.CROSSING_NAME + "</div>";
                    _marker.content = info;
                    _marker.on('click', function (ele) {
                        _infoWindow.setContent(ele.target.content);
                        _infoWindow.open(map, ele.target.getPosition())
                    });
                    _marker.on('mouseover', function (target) {
                        _marker.setIcon("images/map/bayonetChoose.png");
                    });
                    _marker.on("mouseout", function (target) {
                        _marker.setIcon('images/map/bayonet.png');
                    })
                });
            }
            else {
                layer.alert('请求卡口系统数据失败，请检查数据接口！');
            }
        }
    });
    //初始化 警情
    $.ajax({
        url: './js/zhujiJingQing.json',
        type: 'GET',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {
                var _infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -40)
                });
                $.each(result, function (index, target) {
                    var _marker = new AMap.Marker({
                        icon: 'images/map/policeSituation.png',
                        //可以使用下面的代码对地图图标的大小进行控制
                        /*new AMap.Icon({
                            size: new AMap.Size(35,35),
                            image:'images/map/警情.png',
                            imageSize: new AMap.Size(35,35)//图标所用图片大小，根据所设置的大小拉伸或压缩图片，
                            //等同于CSS中的background-size属性。可用于实现高清屏的高清效果
                        }),*/
                        position: [target.GPS_X, target.GPS_Y],
                        offset: new AMap.Pixel(-22, -51)
                    });
                    policeSituationMarkers.push(_marker);
                    //给每一个marker绑定一个点击事件，用作弹出信息框
                    var info = "";
                    info = "<div class='policeSituationPop'>" +
                        "<div class='policeSituationPopContent'>" +
                        "<div class='title'> " +
                        "<div class='situationBrief textNoWrap left'>" + target.SITUATION_CONTEXT + "</div>" +
                        "<div class='situationTime right'>" + target.DATE_TIME + "</div>" +
                        "</div>" +
                        "<div class='accident'>" +
                        "<div class='accidentPlaceTitle  left'>事发地点:</div>" +
                        "<div class='accidentPlace textNoWrap left'>" + target.ALARM_ADDRESS + "</div>" +
                        "</div>" +
                        "<div class='detailCard'>" +
                        "<div class='row'>" +
                        "<div class='width-197 left'>" +
                        "<div class='contentType left'>警情类型：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.POLICE_TYPE + "</div>" +
                        "</div>" +
                        "<div class='width-197 right'>" +
                        "<div class='contentType left'>所属单位：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.POLICE_NAME + "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='row'>" +
                        "<div class='width-197 left'>" +
                        "<div class='contentType left'>单位代码：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.ORG_SN + "</div>" +
                        "</div>" +
                        "<div class='width-197 right'>" +
                        "<div class='contentType left'>接警人：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.PERSON_NAME + "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='row'>" +
                        "<div class='width-197 left'>" +
                        "<div class='contentType left'>状态：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.STATUS + "</div>" +
                        "</div>" +
                        "<div class='width-197 right'>" +
                        "<div class='contentType left'>警情大类：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.BIGPOLICE_TYPE + "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div class='row'>" +
                        "<div class='width-197 left'>" +
                        "<div class='contentType left'>入库时间：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.CREATE_TIME + "</div>" +
                        "</div>" +
                        "<div class='width-197 right'>" +
                        "<div class='contentType left'>报警人：</div>" +
                        "<div class='contentDetail textNoWrap right'>" + target.ALARM_STAFF + "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>";

                    _marker.content = info;
                    _marker.on('click', function (ele) {
                        _infoWindow.setContent(ele.target.content);
                        _infoWindow.open(map, ele.target.getPosition())
                    });
                });
            }
            else {
                layer.alert('请求警情数据失败，请检查数据接口！');
            }
        }
    });
    //初始化 巡处车辆 和 警力
    $.ajax({
        url: 'js/zhujiPoliceEquipment.json',
        type: 'GET',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {
                var _infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -40)
                });
                $.each(result, function (index, target) {
                    if (target.DEVICE_TYPE === 1) { //此时为巡处车辆
                        var _marker = new AMap.Marker({
                            icon: 'images/map/policeCar.png',
                            position: [target.GPS_X, target.GPS_Y],
                            offset: new AMap.Pixel(-15, -43)
                        });
                        policeEquipmentMarkers.push(_marker);
                        var info = "";
                        info = "<div class='policeSituationPop' style='height: 162px'>" +
                            "<div class='policeSituationPopContent' >" +
                            "<div class='title'> " +
                            "<div class='situationBrief textNoWrap left'>" + target.DEVICE_NAME + "</div>" +
                            "</div>" +
                            "<div class='accident'>" +
                            "<div class='accidentPlaceTitle  left'>所属片区:</div>" +
                            "<div class='accidentPlace textNoWrap left'>" + target.ORG_NAME + "</div>" +
                            "</div>" +
                            "<div class='detailCard'>" +
                            "<div class='row'>" +
                            "<div class='width-197 left'>" +
                            "<div class='contentType left'>设备编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.DEVICE_CODE + "</div>" +
                            "</div>" +
                            "<div class='width-197 right'>" +
                            "<div class='contentType left'>片区编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.ORG_SN + "</div>" +
                            "</div>" +
                            "</div>" +
                            "<div class='row'>" +
                            "<div class='width-197 left'>" +
                            "<div class='contentType left'>警员编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.POLICE_NO + "</div>" +
                            "</div>" +
                            "<div class='width-197 right'>" +
                            "<div class='contentType left'>设备名称：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.DEVICE_NAME + "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>";
                        _marker.content = info;
                        _marker.on('click', function (ele) {
                            _infoWindow.setContent(ele.target.content);
                            _infoWindow.open(map, ele.target.getPosition())
                        });
                        _marker.on('mouseover', function (target) {
                            _marker.setIcon('images/map/policeCarChoose.png');
                        });
                        _marker.on('mouseout', function (target) {
                            _marker.setIcon('images/map/policeCar.png');
                        });
                    }
                    else {//此时为单兵设备
                        var _marker = new AMap.Marker({
                            icon: 'images/map/policeman.png',
                            position: [target.GPS_X, target.GPS_Y],
                            offset: new AMap.Pixel(-15, -43)
                        });
                        policemanMarkers.push(_marker);
                        var info = "";
                        info = "<div class='policeSituationPop' style='height: 162px'>" +
                            "<div class='policeSituationPopContent' >" +
                            "<div class='title'> " +
                            "<div class='situationBrief textNoWrap left'>" + target.DEVICE_NAME + "</div>" +
                            "</div>" +
                            "<div class='accident'>" +
                            "<div class='accidentPlaceTitle  left'>所属片区:</div>" +
                            "<div class='accidentPlace textNoWrap left'>" + target.ORG_NAME + "</div>" +
                            "</div>" +
                            "<div class='detailCard'>" +
                            "<div class='row'>" +
                            "<div class='width-197 left'>" +
                            "<div class='contentType left'>设备编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.DEVICE_CODE + "</div>" +
                            "</div>" +
                            "<div class='width-197 right'>" +
                            "<div class='contentType left'>片区编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.ORG_SN + "</div>" +
                            "</div>" +
                            "</div>" +
                            "<div class='row'>" +
                            "<div class='width-197 left'>" +
                            "<div class='contentType left'>警员编号：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.POLICE_NO + "</div>" +
                            "</div>" +
                            "<div class='width-197 right'>" +
                            "<div class='contentType left'>设备名称：</div>" +
                            "<div class='contentDetail textNoWrap right'>" + target.DEVICE_NAME + "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>";
                        _marker.content = info;
                        _marker.on('click', function (ele) {
                            _infoWindow.setContent(ele.target.content);
                            _infoWindow.open(map, ele.target.getPosition())
                        });
                        _marker.on('mouseover', function (target) {
                            _marker.setIcon('images/map/policemanChoose.png');
                        });
                        _marker.on('mouseout', function (target) {
                            _marker.setIcon('images/map/policeman.png');
                        });
                    }
                });
            }
            else {
                layer.alert('请求警力设备数据失败，请检查数据接口！');
            }
        }
    });
    //初始化 固定卡点
    $.ajax({
        url: 'js/gudingkadian.json',
        type: 'GET',
        dataType: 'json',
        success: function (result, status) {
            if (status === "success") {
                var _infoWindow = new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -40)
                });
                $.each(result, function (index, target) {
                    var _marker = new AMap.Marker({
                        icon: 'images/map/stableIntercept.png',
                        position: target.LNGLAT,//有接口的时候需要替换
                        offset: new AMap.Pixel(-15, -43)
                    });
                    stableBayonet.push(target.LNGLAT);
                    stableInterceptPoint.push(_marker);
                    //给每一个marker绑定一个点击事件，用作弹出信息框
                    var info = "";
                    info = "<div>" + target.NAME + "</div>";
                    _marker.content = info;
                    _marker.on('click', function (ele) {
                        _infoWindow.setContent(ele.target.content);
                        _infoWindow.open(map, ele.target.getPosition())
                    });
                    _marker.on('mouseout', function () {
                        _marker.setIcon('images/map/stableIntercept.png');
                    });
                    _marker.on('mouseover', function () {
                        _marker.setIcon('images/map/stableInterceptChoose.png');
                    })
                });
            }
            else {
                layer.alert('请求固定卡点数据失败，请检查数据接口！');
            }
        }
    });
    //给checkbox添加选中点击事件 以便进行
    //治安监控、警力、巡处车辆、警情、卡口系统、固定卡点图层的控制
    form.on('checkbox', function (data) {
        var _targetTitle = data.elem.title;
        var _targetChecked = data.elem.checked;
        switch (_targetTitle) {
            case "固定卡点":
                _targetChecked ? map.add(stableInterceptPoint) : map.remove(stableInterceptPoint);
                break;
            case "卡口系统":
                if (_targetChecked) {
                    if (!!clusterBayonetSystem) {
                        map.add(clusterBayonetSystem)
                    }
                    else {
                        AMap.plugin([
                            'AMap.MarkerClusterer'
                        ], function () {
                            clusterBayonetSystem = new AMap.MarkerClusterer(map, bayonetSystemMarkers, {
                                gridSize: 40,
                                maxZoom: 17
                            });
                        })
                    }
                }
                else {
                    map.remove(clusterBayonetSystem);
                }
                break;
            case "治安监控":
                if (_targetChecked) {
                    if (!!clusterVideoCamera) {
                        map.add(clusterVideoCamera)
                    }
                    else {
                        AMap.plugin([
                            'AMap.MarkerClusterer'
                        ], function () {
                            clusterVideoCamera = new AMap.MarkerClusterer(map, videoCameraMarkers, {
                                gridSize: 40,
                                maxZoom: 17
                            });
                        })
                    }
                }
                else {
                    map.remove(clusterVideoCamera);
                }
                break;
            case "警力":
                _targetChecked ? map.add(policemanMarkers) : map.remove(policemanMarkers);
                break;
            case "巡处车辆":
                _targetChecked ? map.add(policeEquipmentMarkers) : map.remove(policeEquipmentMarkers);
                break;
            case "警情":
                _targetChecked ? map.add(policeSituationMarkers) : map.remove(policeSituationMarkers);
                break;
        }
    });
    /* 治安监控、警力、巡处车辆、警情、卡口系统、固定卡点 图层初始化和现实与否控制 end*/

    //地图选择突发事件按钮
    $('#layui-chooseAccident').click(function () {
        bindMapClickEvent();
        return false;
    });

    //给Map绑定 “点击地图定义 突发事件功能”
    function bindMapClickEvent() {
        map.on('click', initInterceptCircle);
    }

    //给Map解绑 “点击地图定义 突发事件功能”
    function emitMapClickEnvent() {
        map.off('click', initInterceptCircle)
    }

    /**
     * @desc 突发事件拦截范围圈的生成
     * @param {string} target 点击对象
     */
    function initInterceptCircle(target) {
        if (mapclickCount !== 1){
            pathSimplefierIns = null;
            map.remove(escapeRouteVideosMarker); //移除逃生路线上视频监控信息
            map.remove(accidentOccurPlace);//移除自定义事件
            escapeRouteVideosMarker =[];//清空逃生路线上视频监控 数组
            accidentOccurPlace = []; //清空自定义事发点 数组
            drivingEscapeRoute = []; //清空驾车出逃路线 数组
            var _layer = map.getLayers(); //移除自定义图层
            for (var i = _layer.length - 1; i >= 0; i--) {
                if (_layer[i].CLASS_NAME === "AMap.CustomLayer") {
                    map.remove(_layer[i]);
                }
            }
        }
        if (mapclickCount > 0) {
            mapclickCount = 0;
            emitMapClickEnvent();
            return
        }
        mapclickCount++;
        var _lnglat = [target.lnglat.lng, target.lnglat.lat];
        var _marker = new AMap.Marker({
            icon: 'images/map/policeSituation.png',
            position: _lnglat,
            offset: new AMap.Pixel(-22, -25)
        });
        accidentOccurPlace.push(_marker);
        //创建一个右键菜单
        /*var _contextMenu = new AMap.ContextMenu();
        _contextMenu.addItem('删除突发事件点',function () {
            pathSimplefierIns = null;
            mapclickCount = 0;
            map.remove(escapeRouteVideosMarker); //移除逃生路线上视频监控信息
            map.remove(accidentOccurPlace);//移除自定义事件
            escapeRouteVideosMarker =[];//清空逃生路线上视频监控 数组
            accidentOccurPlace = []; //清空自定义事发点 数组
            drivingEscapeRoute = []; //清空驾车出逃路线 数组
            var _layer = map.getLayers(); //移除自定义图层
            for (var i = _layer.length - 1; i >= 0; i--) {
                if (_layer[i].CLASS_NAME === "AMap.CustomLayer") {
                    map.remove(_layer[i]);
                }
            }
        });*/
        //给marker绑定右键点击事件
        _marker.on('rightclick',function (e) {
            _contextMenu.open(map, e.lnglat);
        });
        map.add(_marker);

        //根据市区平均速度45km/h来进行包围圈的划定 2.25 3.75 11.25km
        firstInterceptCircle = new AMap.Circle({
            center: _lnglat, //圆心
            radius: FIRSTINTERCEPTDISTANCE * 1000,
            strokeColor: '#a3ff6f',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#a3ff6f',
            fillOpacity: 0.7,
        });
        secondInterceptCircle = new AMap.Circle({
            center: _lnglat, //圆心
            radius: SECONDINTERCEPTDISTANCE * 1000,
            strokeColor: '#FFB230',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#FFB230',
            fillOpacity: 0.4,

        });
        thirdInterceptCircle = new AMap.Circle({
            center: _lnglat, //圆心
            radius: THIRDINTERCEPTDISTANCE * 1000,
            strokeColor: '#ff290c',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#ff290c',
            fillOpacity: 0.1
        });

        //使用turf生成以点击点为中心，半径为最外层拦截圈的缓冲区
        var _tempBuffer = turf.buffer(turf.point(_lnglat), THIRDINTERCEPTDISTANCE, {
            units: 'kilometers',
            step: 128
        });//返回的是一个geojson类型的面数据
        //计算在拦截圈内的点
        var _analysePoint = $zhujiCrossing.concat(stableBayonet);//将诸暨市路口信息和固定卡点信息进行连接，以便进行运算
        var _ptsWithin = turf.pointsWithinPolygon(turf.points(_analysePoint), turf.polygon(_tempBuffer.geometry.coordinates));
        //运算圈内点到中心点的距离
        var _distance = pointToPointDistance(_ptsWithin.features, _lnglat);
        allInterceptPointDistance = _distance; //将最远拦截圈里面的所有点获取出来，放入
        var _targetInterceptPoint = getTargetInterceptPoint(_distance);
        //计算出逃路线
        getMostPossibleDrivingScapeRoute(_targetInterceptPoint, _lnglat);
        getMostPossibleTransitScapeRoute(_targetInterceptPoint, _lnglat);
        getMostPossibleRidingScapeRoute(_targetInterceptPoint, _lnglat);

    }

    /**
     * @desc 获取缓冲区分析面数据的路径信息
     * @param {GeoJSON} buffered GeoJSON数据
     * @return 面数据的外围路径数组
     */
    function getBufferPolygonPath(buffered) {
        var path = [];
        buffered.geometry.coordinates[0].forEach(function (item) {
            path.push(item);
        });
        return path;
    }

    /**
     * @desc 获取用于计算圈内点到中心点的距离
     * @param {Array} points 用于计算的点 GeoJSON
     * @param {Array} centerPoint 中心点
     */
    function pointToPointDistance(points, centerPoint) {
        var _distanceArr = [];//记录点到点的距离 以及参与计算点的索引
        var max;
        points.forEach(function (target, index) {
            var _distance = turf.distance(turf.point(centerPoint), turf.point(target.geometry.coordinates));
            target.properties.distance = _distance;
            //target.distance = _distance;
            _distanceArr.push(target);
        });
        for (var i = 0; i < _distanceArr.length; i++) {
            for (var j = i; j < _distanceArr.length; j++) {
                if (_distanceArr[i].distance < _distanceArr[j].distance) {
                    max = _distanceArr[j];
                    _distanceArr[j] = _distanceArr[i];
                    _distanceArr[i] = max;
                }
            }
        }
        return _distanceArr;
    }

    /**
     * @desc 获取拦截点
     * @param {Array} _distance 点到中心点距离数组
     * @return {Array} 择优选取的5个
     */
    function getTargetInterceptPoint(_distance) {
        var _targetArr = [];
        _distance.forEach(function (target) {
            $zhujiCrossingJSON.forEach(function (item) {
                if ((item.LNGLAT[0] == target.geometry.coordinates[0]) && (item.LNGLAT[1] == target.geometry.coordinates[1])) {
                    item.distance = target.properties.distance;
                    _targetArr.push(item);
                }
            });
        });
        _distance.forEach(function (target) {
            $zhujiStableIntercept.forEach(function (item) {
                if ((item.LNGLAT[0] == target.geometry.coordinates[0]) && (item.LNGLAT[1] == target.geometry.coordinates[1])) {
                    item.distance = target.properties.distance;
                    _targetArr.push(item);
                }
            });
        });
        for (var i = 0; i < _targetArr.length; i++) {
            for (var j = i; j < _targetArr.length; j++) {
                if (_targetArr[i].distance < _targetArr[j].distance) {
                    max = _targetArr[j];
                    _targetArr[j] = _targetArr[i];
                    _targetArr[i] = max;
                }
            }
        }
        var _calculateResult = calculateTargetInterceptPointMethodOne(_targetArr);

        return _calculateResult;

    }

    /**
     * @desc 根据不同路口等级 来赋予 权重值，不同路口等级权重为 LEVEL 1,2,3 0.44 0.33 0.23,
     * 距离与路口的权重值分别为 0.55 0.45 认为路口等级较为重要，通过 路口等级权重*路口权重 + 距离权重* 出逃概率
     * @param {Array} targetArr 参与运算的目标点数据
     */
    function calculateTargetInterceptPointMethodOne(targetArr) { //只选取五个最有价值的点
        var _temp = [];
        var _interceptTarget = [];
        var total;
        var _posibility;
        targetArr.forEach(function (target, index) {
            _posibility = target.distance / THIRDINTERCEPTDISTANCE;
            if (target.NAME.indexOf('路口') !== -1) {
                switch (target.LEVEL) {
                    case 3 :
                        total = 0.23 * 0.55 + _posibility * 0.45;
                        break;
                    case 2:
                        total = 0.33 * 0.55 + _posibility * 0.45;
                        break;
                    case 1:
                        total = 0.44 * 0.55 + _posibility * 0.45;
                        break;
                }
                target.Weight = total;
                _temp.push(target);
            }
            else {
                if (index <= 5) {
                    _interceptTarget.push(target);
                }
            }
        });
        var max;
        for (var i = 0; i < _temp.length; i++) {
            for (var j = i; j < _temp.length; j++) {
                if (_temp[i].Weight < _temp[j].Weight) {
                    max = _temp[j];
                    _temp[j] = _temp[i];
                    _temp[i] = max;
                }
            }
        }
        if (_interceptTarget.length > 5) {
            return _interceptTarget;
        }
        else {
            var _index = 5 - _interceptTarget.length;

            //获取最终数组
            _temp.splice(_index, _temp.length - _index);
            var _tempArr = _interceptTarget.concat(_temp);
            return _tempArr;
        }
    }

    /**
     * @desc 根据距离最近来筛选路径规划目标点
     * @param {Array} targetArr 参与运算的目标点数据
     */
    function calculateTargetInterceptPointMethodTwo(targetArr) {
        return targetArr.splice(5, targetArr.length - 5);
    }

    /**
     * @desc 驾车出逃路径规划
     * @param {Array} targetArray 出逃口数组
     * @param {lnglat} startPoint 事发地点经纬度信息
     */
    function getMostPossibleDrivingScapeRoute(targetArray, startPoint) {
        var _driving,
            _drivingResult = [];//驾车路径规划结果

        AMap.plugin([
            'AMap.Driving'
        ], function () {
            _driving = new AMap.Driving({
                policy: AMap.DrivingPolicy.LEAST_TIME,//时间最少，LEAST_DISTANCE/REAL_TRAFFIC/LEAST_FEE
                extensions: 'all'
            });
            targetArray.forEach(function (target) {
                _driving.search(startPoint, target.LNGLAT, function (status, result) {
                    if (status === "complete") {
                        var _paths = [startPoint];
                        var _routes = result.routes[0];
                        var _totalDistance = (_routes.distance / 1000.00).toFixed(2) + "km";
                        var _totalTime = getTotalFormattedTime(_routes.time);
                        _routes.steps.forEach(function (goal) {
                            goal.path.forEach(function (item) {
                                _paths.push([item.lng, item.lat]);
                            });
                        });
                        _paths.push(target.LNGLAT);
                        _drivingResult.push({
                            "path": _paths,
                            "interceptAddress": target.INTERCERPTADDRESS,//需要对其进行格式化
                            "totalTime": _totalTime,
                            "totalDistance": _totalDistance,
                            "interceptName": target.NAME
                        });
                        if (_drivingResult.length === targetArray.length) {
                            //在地图上面生成逃逸路线并刷新驾车路线面板
                            refreshDrivingDomAndRoute(_drivingResult);
                        }
                    }
                    else {
                        layer.alert('驾车路径规划失败！');
                    }
                });
            });
        });

    }

    /**
     * @desc 骑行出逃路径规划
     * @param {Array} targetArray 出逃口数组
     * @param {lnglat} startPoint 事发地点经纬度信息
     */
    function getMostPossibleRidingScapeRoute(targetArray, startPoint) {
        var _riding,
            _ridingResult = [];//骑行 路径规划结果

        AMap.plugin([
            'AMap.Riding'
        ], function () {
            _riding = new AMap.Riding({
                policy: 0,// 0 推荐路线及最快路线综合;1,推荐路线,2.最快路线
            });
            targetArray.forEach(function (target) {
                _riding.search(startPoint, target.LNGLAT, function (status, result) {
                    if (status === "complete") {
                        var _destination = [result.destination.lng, result.destination.lat],
                            _origin = [result.origin.lng, result.origin.lat],
                            _paths = [],
                            _routes = result.routes[0],
                            _totalDistance = (_routes.distance / 1000.00).toFixed(2) + "km",
                            _totalTime = getTotalFormattedTime(_routes.time)
                        ;
                        _paths.push(_origin);
                        _routes.rides.forEach(function (goal) {
                            goal.path.forEach(function (item) {
                                _paths.push([item.lng, item.lat]);
                            });
                        });
                        _paths.push(_destination);
                        _paths = getUniqueArray(_paths);
                        _ridingResult.push({
                            "path": _paths,
                            "interceptAddress": target.INTERCERPTADDRESS,//需要对其进行格式化
                            "totalTime": _totalTime,
                            "totalDistance": _totalDistance,
                            "interceptName": target.NAME
                        });
                        if (_ridingResult.length === 5) {

                        }
                    }
                    else {
                        layer.alert('骑行路径规划失败！');
                    }
                });
            });
        });
    }

    /**
     * @desc 公交出逃路径规划
     * @param {Array} targetArray 出逃口数组
     * @param {lnglat} startPoint 事发地点经纬度信息
     */
    function getMostPossibleTransitScapeRoute(targetArray, startPoint) {
        var _transit,
            _transitResult = [];//公交搭乘路径规划结果
        AMap.plugin([
            'AMap.Transfer'
        ], function () {
            _transit = new AMap.Transfer({
                city: '330681',
                policy: AMap.TransferPolicy.LEAST_TIME,//LEAST_TIME/LEAST_FEE/LEAST_TRANSFER/LEAST_WALK/MOST_COMFORT/NO_SUBWAY
                nightflag: true,
                extensions: 'all'
            });
            targetArray.forEach(function (target) {
                _transit.search(startPoint, target.LNGLAT, function (status, result) {
                    if (status === "complete") {
                        var _destination = [result.destination.lng, result.destination.lat],
                            _origin = [result.origin.lng, result.origin.lat],
                            _paths = [],
                            _totalDistance,
                            _totalTime
                        ;
                        _paths.push(_origin);
                        result.plans.forEach(function (goal) {
                            _totalDistance = (goal.distance / 1000.00).toFixed(2) + "km";
                            _totalTime = getTotalFormattedTime(goal.time);
                            goal.path.forEach(function (item) {
                                _paths.push([item.lng, item.lat]);
                            });
                        });
                        _paths.push(_destination);
                        _transitResult.push({
                            "path": _paths,
                            "interceptAddress": target.INTERCERPTADDRESS,//需要对其进行格式化
                            "totalTime": _totalTime,
                            "totalDistance": _totalDistance,
                            "interceptName": target.NAME
                        });
                        if (_transitResult.length === 5) {

                        }
                    }
                    else {
                        layer.alert('公交路径规划失败！');
                    }
                });
            });
        });

    }

    /**
     * @desc 将秒转换为 h\min的形式
     * @param {Number} seconds 需要转换总时间 取值大于等于0
     * @return 格式化的时间
     */
    function getTotalFormattedTime(seconds) {
        var _finalTime = "";
        if ((seconds >= 0) && (seconds < 3600)) {
            _finalTime = Math.round(seconds / 60.00) + "min";
        }
        else {
            var _tempMod = seconds % 3600;//求余数进行分数计算
            var _hours = parseInt(seconds / 3600);//获取小时数
            if (_hours > 24) {
                var _day = parseInt(_hours / 24);
                var _tempMod2 = _hours - 24 * _day;
                _finalTime = _day + '天' + _tempMod2 + "h" + Math.round(_tempMod / 60.00) + "min";
            }
            else {
                _finalTime = _hours + "h" + Math.round(_tempMod / 60.00) + "min";
            }
        }

        return _finalTime;
    }

    /**
     * @desc 生成逃逸路线列表
     * @param {Array} drivingResult 出逃路线数组
     */
    function refreshDrivingDomAndRoute(drivingResult) {
        $('.video-list').empty();
        var _html = "";
        //初始化全局变量
        drivingEscapeRoute = drivingResult;
        var _pathData = [];
        drivingResult.forEach(function (item, index) {
            _pathData.push({
                name : "出逃路线" + (index +1),
                path :item.path
            });
            _html += '<div class="unfold-cons">' +
                '<div class="num">' + (index + 1) + '</div>' +
                '<div class="cons">' +
                '<div class="top-cons">' +
                '<div class="title">出逃至' + item.interceptAddress + '出口</div>' +
                '<button class="monitorBtn" onclick= "showDrivingRouteCamera(' + item.path.join(',') + ')">查看监控</button>' +
                '</div>' +
                '<div class="bot-cons">' +
                '<div class="hours">' +
                '<span>时长:</span>' + '<b>' + item.totalTime + '</b>' +
                '</div>' +
                '<div class="routes">' + '<span>路途:</span><b>' + item.totalDistance + '·' + item.interceptName + '</b></div>' +
                '</div>' +
                '</div>' + '</div>';
        });
        AMapUI.load('ui/misc/PathSimplifier', function (PathSimplifier) {
            if (!PathSimplifier.supportCanvas) {
                alert('当前环境不支持 Canvas！');
                return;
            }
            var  pathSimplefierIns = new PathSimplifier({
                zIndex: 100,
                map: map,
                getPath: function (pathData, pathIndex) {
                    //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                    return pathData.path;
                },
                getHoverTitle: function (pathData, pathIndex, pointIndex) {
                    /*//返回鼠标悬停时显示的信息
                    if (pointIndex >= 0) {
                        //鼠标悬停在某个轨迹节点上
                        return pathData.name  + '，点:' + pointIndex + '/' + pathData.path.length;
                    }
                    //鼠标悬停在节点之间的连线上
                    return pathData.name + '，点数量' + pathData.path.length;*/
                    return pathData.name;

                },
                renderOptions: {
                    //轨迹线的样式
                    pathLineStyle: {
                        lineWidth: 6,
                        strokeStyle: "#28d164",
                        borderWidth: 2,
                        borderStyle: "#27b75a",
                        dirArrowStyle: true

                    },
                    pathLineHoverStyle: {
                        lineWidth: 6,
                        strokeStyle: "#3d7ed7",
                        borderWidth: 2,
                        borderStyle: "#3364a7",
                        dirArrowStyle: true
                    },
                    pathLineSelectedStyle: {
                        lineWidth: 6,
                        strokeStyle: "#3d7ed7",
                        borderWidth: 2,
                        borderStyle: "#3364a7",
                        dirArrowStyle: true
                    },
                    dirArrowStyle: {
                        stepSpace: 25,
                        strokeStyle: "#ffffff",
                        lineWidth: 2
                    },
                    startPointStyle: {
                        radius: 6,
                        fillStyle: "#28d164",
                        lineWidth: 4,
                        strokeStyle: "#ffffff"
                    },
                    endPointStyle: {
                        radius: 6,
                        fillStyle: "#dc3912",
                        lineWidth: 4,
                        strokeStyle: "#ffffff"
                    },
                    keyPointStyle: {
                        radius: 6,
                        fillStyle: "rgba(8, 126, 196, 1)",
                        lineWidth: 1,
                        strokeStyle: "#eeeeee"
                    },
                    keyPointHoverStyle: {
                        radius: 4,
                        fillStyle: null,
                        lineWidth: 2,
                        strokeStyle: "#dc3912"
                    },
                    keyPointOnSelectedPathLineStyle: {
                        radius: 4,
                        fillStyle: "rgba(8, 126, 196, 1)",
                        lineWidth: 2,
                        strokeStyle: "#eeeeee"
                    }
                }
            });
            pathSimplefierIns.setData(_pathData);
            window.pathSimplefierIns = pathSimplefierIns;
            pathSimplefierIns.on('pathClick pointClick', function (ele, info) {
                //清空出逃路线上的 视频监控信息
                if (escapeRouteVideosMarker.length > 0) {
                    map.remove(escapeRouteVideosMarker);//删除已有图标
                    escapeRouteVideosMarker = [];//清空数组
                }
                //获取点击路线上的视频

                //根据所选择的路线，获取路线上面所有的摄像头信息
                var _camera = [];
                var _target = [];
                $zhujiCameraJSON.forEach(function (target, index) {
                    _camera.push([Number(target.LONGITUDE), Number(target.LATITUDE)]);
                });
                var _inputPoints = turf.points(_camera);
                var _escapeRoute = turf.lineString(info.pathData.path);
                var _bufferResult = turf.buffer(_escapeRoute , 0.05);

                var _inputPolygon = turf.polygon(_bufferResult.geometry.coordinates);
                //耗时太久，想办法解决。
                var _tagertPoint = turf.pointsWithinPolygon(_inputPoints, _inputPolygon);
                //清空_camera数组，
                var _coords = turf.coordAll(_tagertPoint);

                $.each(_coords, function (index, item) {
                    $.each($zhujiCameraJSON, function (index2, target) {
                        if (Number(target.LONGITUDE) === item[0] && Number(target.LATITUDE) === item[1]) {
                            _target.push(target);
                        }
                    });
                });
                var _html ="";
                $.each(_target, function (index, target) {
                    var _cameraLocation = [Number(target.LONGITUDE), Number(target.LATITUDE)];
                    var _snapped = turf.nearestPointOnLine(_escapeRoute, turf.point(_cameraLocation));
                    var _sliceLine = turf.lineSlice(turf.point(info.pathData.path[0]), _snapped, _escapeRoute);
                    var _distance = turf.length(_sliceLine).toFixed(2);
                    _html += '<div class="unfold-cons" onclick="setZoomAndCenter(' + _cameraLocation + ')">' +
                        '<div class="num">' + (index + 1) + '</div>' +
                        '<div class="cons">' +
                        '<div class="top-cons">' +
                        '<div class="title">' + target.NAME + '</div>' +
                        '<div class="cons">距事发点<span class="nums">' + _distance + '</span><span>km</span></div>' +
                        '</div>' +
                        '<div class="bot-cons">' +
                        '<div class="hours">' +
                        '<span>监控类型:</span>' +
                        '<b>卡口系统</b>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div style = "display: none">' + target.LONGITUDE + ',' + target.LATITUDE + '</div>'
                    ;
                    var _marker = new AMap.Marker({
                        icon: 'images/map/video.png',
                        position: [Number(target.LONGITUDE), Number(target.LATITUDE)],
                        offset: new AMap.Pixel(-15, -43)
                    });
                    _marker.on('mouseover', function (target) {
                        _marker.setIcon('images/map/videoChoose.png');
                    });
                    _marker.on('mouseout', function (target) {
                        _marker.setIcon('images/map/video.png');
                    });
                    escapeRouteVideosMarker.push(_marker);
                });
                $('.Z_unfold-cons-box').empty();//清空视频监控列表
                $('.Z_unfold-cons-box').append(_html);
                $('.unfold-box,.unfold-cons-box').css('display', 'none');
                $('.Z_unfold-box,.Z_unfold-cons-box').css('display', 'block');
                map.add(escapeRouteVideosMarker);
            });

        });
        $('.video-list').append(_html);
    }
    /**
     * @desc 获取逃生路线上的视频监控点信息
     * @param {Array| Number} input 视频点信息
     */
    window.showDrivingRouteCamera = function (input) {

        var _layers = map.getLayers();
        for (var i = _layers.length - 1; i >= 0; i--) {
            if (_layers[i].CLASS_NAME === "AMap.CustomLayer") {
                map.remove(_layers[i]);
            }
        }
        var _path = [];
        if (input instanceof Array) {
            _path = input;
        }
        else {
            for (var i = 0; i < arguments.length; i = i + 2) {
                _path.push([arguments[i], arguments[i + 1]]);
            }
        }
        var _pathSimplefierIns = null;
        AMapUI.load('ui/misc/PathSimplifier', function (PathSimplifier) {
            if (!PathSimplifier.supportCanvas) {
                alert('当前环境不支持 Canvas！');
                return;
            }
            _pathSimplefierIns = new PathSimplifier({
                zIndex: 100,
                map: map,
                getPath: function (pathData, pathIndex) {
                    //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                    return pathData.path;
                },
                getHoverTitle: function (pathData, pathIndex, pointIndex) {
                  /*  //返回鼠标悬停时显示的信息
                    if (pointIndex >= 0) {
                        //鼠标悬停在某个轨迹节点上
                        return pathData.name + '，点:' + pointIndex + '/' + pathData.path.length;
                    }
                    //鼠标悬停在节点之间的连线上
                    return pathData.name + '，点数量' + pathData.path.length;*/
                  return pathData.name;
                },
                renderOptions: {
                    //轨迹线的样式
                    pathLineStyle: {
                        lineWidth: 6,
                        strokeStyle: "#28d164",
                        borderWidth: 2,
                        borderStyle: "#27b75a",
                        dirArrowStyle: true

                    },
                    pathLineHoverStyle: {
                        lineWidth: 6,
                        strokeStyle: "#3d7ed7",
                        borderWidth: 2,
                        borderStyle: "#3364a7",
                        dirArrowStyle: true
                    },
                    pathLineSelectedStyle: {
                        lineWidth: 6,
                        strokeStyle: "#3d7ed7",
                        borderWidth: 2,
                        borderStyle: "#3364a7",
                        dirArrowStyle: true
                    },
                    dirArrowStyle: {
                        stepSpace: 25,
                        strokeStyle: "#ffffff",
                        lineWidth: 2
                    },
                    startPointStyle: {
                        radius: 6,
                        fillStyle: "#28d164",
                        lineWidth: 4,
                        strokeStyle: "#ffffff"
                    },
                    endPointStyle: {
                        radius: 6,
                        fillStyle: "#dc3912",
                        lineWidth: 4,
                        strokeStyle: "#ffffff"
                    },
                    keyPointStyle: {
                        radius: 6,
                        fillStyle: "rgba(8, 126, 196, 1)",
                        lineWidth: 1,
                        strokeStyle: "#eeeeee"
                    },
                    keyPointHoverStyle: {
                        radius: 4,
                        fillStyle: null,
                        lineWidth: 2,
                        strokeStyle: "#dc3912"
                    },
                    keyPointOnSelectedPathLineStyle: {
                        radius: 4,
                        fillStyle: "rgba(8, 126, 196, 1)",
                        lineWidth: 2,
                        strokeStyle: "#eeeeee"
                    }
                }
            });
            _pathSimplefierIns.setData([{
                name: '出逃路线',
                path: _path
            }]);
            if (escapeRouteVideosMarker.length > 0) {
                map.remove(escapeRouteVideosMarker);//删除已有图标
                escapeRouteVideosMarker = [];//清空数组
            }
            //获取点击路线上的视频

            //根据所选择的路线，获取路线上面所有的摄像头信息
            var _camera = [];
            var _target = [];
            $zhujiCameraJSON.forEach(function (target, index) {
                _camera.push([Number(target.LONGITUDE), Number(target.LATITUDE)]);
            });
            var _inputPoints = turf.points(_camera);
            var _escapeRoute = turf.lineString(_path);
            var _bufferResult = turf.buffer(_escapeRoute, 0.05);
            var _inputPolygon = turf.polygon(_bufferResult.geometry.coordinates);
            //耗时太久，想办法解决。
            var _tagertPoint = turf.pointsWithinPolygon(_inputPoints, _inputPolygon);
            var _coords = turf.coordAll(_tagertPoint);

            $.each(_coords, function (index, item) {
                $.each($zhujiCameraJSON, function (index2, target) {
                    if (Number(target.LONGITUDE) === item[0] && Number(target.LATITUDE) === item[1]) {
                        _target.push(target);
                    }
                });
            });
            var _html = "";
            $('.Z_unfold-cons-box').empty();//清空视频监控列表
            var _infoWindow = new AMap.InfoWindow({
                offset: new AMap.Pixel(0, -40)
            });
            $.each(_target, function (index, target) {
                var _cameraLocation = [Number(target.LONGITUDE), Number(target.LATITUDE)];
                var _snapped = turf.nearestPointOnLine(_escapeRoute, turf.point(_cameraLocation));
                var _sliceLine = turf.lineSlice(turf.point(_path[0]), _snapped, _escapeRoute);
                var _distance = turf.length(_sliceLine).toFixed(2);
                _html += '<div class="unfold-cons" onclick="setZoomAndCenter(' + _cameraLocation + ')">' +
                    '<div class="num">' + (index + 1) + '</div>' +
                    '<div class="cons">' +
                    '<div class="top-cons">' +
                    '<div class="title">' + target.NAME + '</div>' +
                    '<div class="cons">距事发点<span class="nums">' + _distance + '</span><span>km</span></div>' +
                    '</div>' +
                    '<div class="bot-cons">' +
                    '<div class="hours">' +
                    '<span>监控类型:</span>' +
                    '<b>卡口系统</b>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style = "display: none">' + target.LONGITUDE + ',' + target.LATITUDE + '</div>'
                ;

                var _marker = new AMap.Marker({
                    icon: 'images/map/video.png',
                    position: [Number(target.LONGITUDE), Number(target.LATITUDE)],
                    offset: new AMap.Pixel(-15, -43)
                });
                var info = "<div>" + target.NAME + "</div>";
                _marker.content = info;

                _marker.on('click', function (ele) {
                    _infoWindow.setContent(ele.target.content);
                    _infoWindow.open(map, ele.target.getPosition())
                });
                _marker.on('mouseover', function (target) {
                    _marker.setIcon('images/map/videoChoose.png');
                });
                _marker.on('mouseout', function (target) {
                    _marker.setIcon('images/map/video.png');
                });
                escapeRouteVideosMarker.push(_marker);
            });
            $('.Z_unfold-cons-box').append(_html);

            map.add(escapeRouteVideosMarker);
        });
    };
    /**
     * @desc  定位视频点
     * @param {Number} args1 视频点经度
     * @param {Number} args2 视频点纬度
     */
    window.setZoomAndCenter = function (args1, args2) {
        console.log("1:"+args1+"2:"+args2);
        var _location ;
        var _conditionOne;
        var _conditionTwo;
        for (var i = 0; i <escapeRouteVideosMarker.length ;i++){
            _location = escapeRouteVideosMarker[i].getPosition();
            _conditionOne = args1.toString().indexOf(_location.lng.toString())>=0&&args2.toString().indexOf(_location.lat.toString())>=0;
            _conditionTwo = (args1.toFixed(5) === _location.lng.toFixed(5))&&(args2.toFixed(5) === _location.lat.toFixed(5));
             if (_conditionOne||_conditionTwo) {
                     escapeRouteVideosMarker[i].setIcon('images/map/videoChoose.png');
             }
             else{
                 escapeRouteVideosMarker[i].setIcon('images/map/video.png');
             }
        }
        map.setZoomAndCenter(18, [args1, args2]);
    };

    /**
     * @desc 指挥拦截 视频监控点击事件
     */
    $('#video-monitor-tab').click(function (ele) {
        if (accidentOccurPlace.length === 0) {
            return
        }
        map.remove([firstInterceptCircle, secondInterceptCircle, thirdInterceptCircle]);
        map.remove(interceptCicleInsideMarkers);
        map.add(accidentOccurPlace[0]);
        refreshDrivingDomAndRoute(drivingEscapeRoute);
    });
    /**
     * @desc 指挥拦截 路口设卡 点击事件
     */
    $('#crossing-intercept-tab').click(function (ele) {
        addThreeMinutesIntercept();
    });
    //点击3分钟
    $('.three-box').click(function () {
        addThreeMinutesIntercept();
    });
    //点击5分钟
    $('.five-box').click(function () {
        addFiveMinutesIntercept();
    });
    //点击15分钟
    $('.fivteen-box').click(function () {
        addFifteenMinutesIntercept();
    });

    /**
     * @desc 当点击路口设卡 3min 时
     * @param
     */
    function addThreeMinutesIntercept() {
        if (accidentOccurPlace.length === 0) {
            return;
        }
        //移除自定义事件发生点Marker
        //map.remove(accidentOccurPlace[0]);
        //移除出逃路线上面的marker
        map.remove(escapeRouteVideosMarker);
        map.remove([secondInterceptCircle,thirdInterceptCircle]);
        map.remove(interceptCicleInsideMarkers);
        if (interceptCicleInsideMarkers.length > 0){
            interceptCicleInsideMarkers = [];
        }
        //移除所有的自定义图层，方便拦截圈的设置
        var _layers = map.getLayers();
        for (var i = _layers.length - 1; i >= 0; i--) {
            if (_layers[i].CLASS_NAME === "AMap.CustomLayer") {
                map.remove(_layers[i]);
            }
        }
        //添加3min拦截圈
        map.add(firstInterceptCircle);
        map.setFitView(firstInterceptCircle);
        var _centerPoint = [firstInterceptCircle.Je.center.lng, firstInterceptCircle.Je.center.lat];
        //添加卡点
        var _tempBuffer = turf.buffer(turf.point(_centerPoint), FIRSTINTERCEPTDISTANCE, {
            units: 'kilometers',
            step: 128
        });//返回的是一个geojson类型的面数据
        //计算在拦截圈内的点
        var _points = [];
        allInterceptPointDistance.forEach(function (target, idnex) {
            _points.push(target.geometry.coordinates);
        });
        var _ptsWithin = turf.pointsWithinPolygon(turf.points(_points), turf.polygon(_tempBuffer.geometry.coordinates));
        var _targetPoints = turf.coordAll(_ptsWithin);
        var _targetArr = [];
        _targetPoints.forEach(function (target) {
            $zhujiCrossingJSON.forEach(function (item) {
                if ((item.LNGLAT[0] == target[0]) && (item.LNGLAT[1] == target[1])) {
                    item.distance = turf.distance(turf.point(_centerPoint), turf.point(item.LNGLAT));
                    _targetArr.push(item);
                }
            });
        });
        _targetPoints.forEach(function (target) {
            $zhujiStableIntercept.forEach(function (item) {
                if ((item.LNGLAT[0] == target[0]) && (item.LNGLAT[1] == target[1])) {
                    item.distance = turf.distance(turf.point(_centerPoint), turf.point(item.LNGLAT));
                    _targetArr.push(item);
                }
            });
        });
        //计算每个点到事发点的距离 并且解析各个路口的地址信息
        var _html = "";
        var _marker = null;
        $('.Z_unfold-cons-box1').empty();
        _targetArr.forEach(function (target, index) {
            // result为对应的地理位置详细信息
            _html += '<div class="unfold-cons">' +
                '<div class="num">'+ (index + 1) +'</div>' +
                '<div class="cons">' +
                '<div class="top-cons">' +
                '<div class="title" title="' + target.NAME +'">' + target.NAME +'</div>' +
                '<div class="cons">距事发点<span class="nums">'+ (target.distance * 1000).toFixed(2) +'</span><span>m</span></div>' +
                '</div>' +
                '<div class="bot-cons">' +
                '<div class="hours">' +
                '<span>位置:</span>' +
                '<b>' + target.INTERCERPTADDRESS + '</b>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            _marker = new AMap.Marker({
                icon: 'images/map/stableIntercept.png',
                position: target.LNGLAT,//有接口的时候需要替换
                offset: new AMap.Pixel(-15, -43),
                zIndex :120
            });
            _marker.on('mouseout', function () {
                _marker.setIcon('images/map/stableIntercept.png');
            });
            interceptCicleInsideMarkers.push(_marker);

        });
        $('.Z_unfold-box1').find('span')[0].innerHTML = _targetArr.length;
        $('.Z_unfold-cons-box1').append(_html);
        map.add(interceptCicleInsideMarkers);
    }
    /**
     * @desc 当点击路口设卡 5min 时
     * @param
     */
    function addFiveMinutesIntercept() {
        //清空 三分钟 拦截圈内的卡口点 并且重置  拦截点数组
        map.remove(interceptCicleInsideMarkers);
        interceptCicleInsideMarkers = [];
        map.remove([firstInterceptCircle,thirdInterceptCircle]);
        //添加第二个拦截圈
        map.add(secondInterceptCircle);
        map.setFitView(secondInterceptCircle);
        var _centerPoint = [secondInterceptCircle.Je.center.lng, secondInterceptCircle.Je.center.lat];
        //添加卡点
        var _tempBuffer = turf.buffer(turf.point(_centerPoint), SECONDINTERCEPTDISTANCE, {
            units: 'kilometers',
            step: 128
        });//返回的是一个geojson类型的面数据
        //计算在拦截圈内的点
        var _points = [];
        allInterceptPointDistance.forEach(function (target, idnex) {
            _points.push(target.geometry.coordinates);
        });
        var _ptsWithin = turf.pointsWithinPolygon(turf.points(_points), turf.polygon(_tempBuffer.geometry.coordinates));
        var _targetPoints = turf.coordAll(_ptsWithin);
        var _targetArr = [];
        _targetPoints.forEach(function (target) {
            $zhujiCrossingJSON.forEach(function (item) {
                if ((item.LNGLAT[0] == target[0]) && (item.LNGLAT[1] == target[1])) {
                    item.distance = turf.distance(turf.point(_centerPoint), turf.point(item.LNGLAT));
                    _targetArr.push(item);
                }
            });
        });
        _targetPoints.forEach(function (target) {
            $zhujiStableIntercept.forEach(function (item) {
                if ((item.LNGLAT[0] == target[0]) && (item.LNGLAT[1] == target[1])) {
                    item.distance = turf.distance(turf.point(_centerPoint), turf.point(item.LNGLAT));
                    _targetArr.push(item);
                }
            });
        });
        //计算每个点到事发点的距离 并且解析各个路口的地址信息
        var _html = "";
        var _marker = null;
        $('.Z_unfold-cons-box1').empty();
        _targetArr.forEach(function (target, index) {
            // result为对应的地理位置详细信息
            _html += '<div class="unfold-cons">' +
                '<div class="num">'+ (index + 1) +'</div>' +
                '<div class="cons">' +
                '<div class="top-cons">' +
                '<div class="title" title="' + target.NAME +'">' + target.NAME +'</div>' +
                '<div class="cons">距事发点<span class="nums">'+ (target.distance * 1000).toFixed(2) +'</span><span>m</span></div>' +
                '</div>' +
                '<div class="bot-cons">' +
                '<div class="hours">' +
                '<span>位置:</span>' +
                '<b>' + target.INTERCERPTADDRESS + '</b>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            _marker = new AMap.Marker({
                icon: 'images/map/stableIntercept.png',
                position: target.LNGLAT,//有接口的时候需要替换
                offset: new AMap.Pixel(-15, -43),
                zIndex :120
            });
            _marker.on('mouseout', function () {
                _marker.setIcon('images/map/stableIntercept.png');
            });
            interceptCicleInsideMarkers.push(_marker);

        });
        $('.Z_unfold-box1').find('span')[0].innerHTML = _targetArr.length;
        $('.Z_unfold-cons-box1').append(_html);
        map.add(interceptCicleInsideMarkers);
    }
    /**
     * @desc 当点击路口设卡 15min 时
     * @param
     */
    function addFifteenMinutesIntercept() {
        //清空 三分钟 拦截圈内的卡口点 并且重置  拦截点数组
        map.remove(interceptCicleInsideMarkers);
        interceptCicleInsideMarkers = [];
        map.remove([firstInterceptCircle,secondInterceptCircle]);
        //添加第二个拦截圈
        map.add(thirdInterceptCircle);
        map.setFitView(thirdInterceptCircle);
        //计算在拦截圈内的点
        var _points = getTargetInterceptPoint(allInterceptPointDistance);

        //计算每个点到事发点的距离 并且解析各个路口的地址信息
        var _html = "";
        var _marker = null;
        $('.Z_unfold-cons-box1').empty();
        _points.forEach(function (target, index) {
            // result为对应的地理位置详细信息
            _html += '<div class="unfold-cons">' +
                '<div class="num">'+ (index + 1) +'</div>' +
                '<div class="cons">' +
                '<div class="top-cons">' +
                '<div class="title" title="' + target.NAME +'">' + target.NAME +'</div>' +
                '<div class="cons">距事发点<span class="nums">'+ (target.distance * 1000).toFixed(2) +'</span><span>m</span></div>' +
                '</div>' +
                '<div class="bot-cons">' +
                '<div class="hours">' +
                '<span>位置:</span>' +
                '<b>' + target.INTERCERPTADDRESS + '</b>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            _marker = new AMap.Marker({
                icon: 'images/map/stableIntercept.png',
                position: target.LNGLAT,//有接口的时候需要替换
                offset: new AMap.Pixel(-15, -43),
                zIndex :120
            });
            _marker.on('mouseout', function () {
                _marker.setIcon('images/map/stableIntercept.png');
            });
            interceptCicleInsideMarkers.push(_marker);

        });
        $('.Z_unfold-box1').find('span')[0].innerHTML = _points.length;
        $('.Z_unfold-cons-box1').append(_html);
        map.add(interceptCicleInsideMarkers);
    }

    /**
     * @desc 去除一、二维数组中重复的项,只支持要么是一维，要么是二维的情况，不支持一二维混合数组
     * @param {Array} inputArray
     * @return {Array} 去重后的数组
     */
    function getUniqueArray(inputArray) {
        var _newArr = [];
        var _item;
        var _hash = {};
        if (inputArray.length <= 1) {
            alert("处理的数组长度必须大于1");
            return inputArray;
        }
        else {
            if (inputArray[0] instanceof Array) {//表示为二维数组
                for (var i = 0, len = inputArray.length; i < len; i++) {
                    if (!_hash[inputArray[i]]) {
                        _newArr.push(inputArray[i]);
                        _hash[inputArray[i]] = true;
                    }
                }
                return _newArr;
            }
            else {//表示为一维数组
                for (var i = 0, len = inputArray.length; i < len; i++) {
                    _item = inputArray[i];
                    if ($.inArray(_item, _newArr) === -1) {
                        _newArr.push(_item);
                    }
                }
                return _newArr;
            }
        }
    }
});

/**
 * @date 2018/10/24
 * @author bobli
 * @desc 结束
 */
