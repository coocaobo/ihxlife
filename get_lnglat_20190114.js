//获取用户所在位置的经纬度
//获取经纬度
var get_position = function(calltype,signdata,qrcodeID,codeBtnFlag){

    var map,geolocation;
    //加载地图，调用浏览器定位服务
    map = new AMap.Map('container',{
        resizeEnable: true
    });
    map.plugin('AMap.Geolocation',function(){
        //geolocation = new AMap.Geolocation({
        //获取经纬度等待的时间
        //timeout: 4000//此为设置的超时毫秒数。若在指定时间内未定位成功，返回超时错误信息“TIMEOUT”,默认值为无穷大
        //});
        geolocation = new AMap.Geolocation();

        //判断是否是ios系统，如果是，则调用远程定位方法

        if (AMap.UA.ios) {

            //使用远程定位，见 remogeo.js
            var remoGeo = new RemoGeoLocation();

            //替换方法
            navigator.geolocation.getCurrentPosition = function() {
                return remoGeo.getCurrentPosition.apply(remoGeo,arguments);
            };

            //替换方法
            navigator.geolocation.watchPosition = function() {
                return remoGeo.watchPosition.apply(remoGeo, arguments);
            };
        }

        map.addControl(geolocation);

        //询问是否允许获取地理信息
        geolocation.getCurrentPosition();
        //定位成功，返回经纬度信息
        AMap.event.addListener(geolocation,'complete', onComplete);
        //定位失败，返回定位出错信息
        AMap.event.addListener(geolocation,'error',onError);
    });

    //解析定位结果
    function onComplete(data) {
        var qiandao_lng = data.position.getLng();
        var qiandao_lat = data.position.getLat();

        var fakLng = 109.472297;
        var fakLat = 34.498334;
        alert(qiandao_lng + '-' + qiandao_lat + '-' +fakLng +'-'+fakLat )
        qiandao_lng = fakLng;
        qiandao_lat = fakLat;

        //加载进度条显示
        $(".processwrap").css("display","block");

        //准备请求参数
        //确认签到
//		//获取经纬度后拼接参数，调用ajax，返回到数据库中进行签到有效性的判断
        if(calltype == "morning"){
//			alert("早会签到");
            //早会的签到签退一样，请求的JSON串是一样的
            var lnglat_double = {
                "openid": signdata.openid,
                "userid": signdata.userid,
                "timestamp": signdata.timestamp,
                "nonce": signdata.nonce,
                "trade_source": signdata.trade_source,
                "signature": signdata.signature,
                "qrcodeid" : qrcodeID,
                "attentype": "morning",
                "longitude" : qiandao_lng,
                "latitude" : qiandao_lat,
                "cacheflag": signdata.cacheflag
            }
            //调用ajax,将经纬度和工号返回给后台
            if(codeBtnFlag){
                return_lnglat(lnglat_double);
            }else{
                /*codeBtnFlag 为false*/
                //加载进度条隐藏
                $(".processwrap").css("display","none");
                alert("操作过于频繁或重复,请重新扫码!");
            }
            //设置为false,防止用户在第一次请求服务器未完成时进行二次调用。
            codeBtnFlag = false;

        }else if(calltype == "class"){

            //班级的签到和签退请求的JSON串是不同的，需要分情况
            if(signdata.signtype == "in"){//班级签到
                var signindata = {
                    "staffcode": signdata.staffcode,//班级签到
                    "timestamp": signdata.timestamp,
                    "nonce": signdata.nonce,
                    "trade_source": signdata.trade_source,
                    "signature": signdata.signature,
                    "classcode": signdata.classcode,
                    "traincode": signdata.traincode,
                    "qrcodeid" : signdata.qrcodeid,
                    "attentype": "class",
                    "longitude" : qiandao_lng,
                    "latitude" : qiandao_lat
                }
//				alert(JSON.stringify(signindata));
                //将签到页面的课程列表置为none,否则会同时显示两个页面，造成混乱。
                $("#courselist").css("display","none");

                //调用早会签到验证的函数，返回签到结果
                if(codeBtnFlag){
                    return_lnglat(signindata);
                }
                codeBtnFlag = false;

            }else if(signdata.signtype == "out"){//班级签退
                var signalldata = {
                    "staffcode": signdata.staffcode,//班级签退
                    "timestamp": signdata.timestamp,
                    "nonce": signdata.nonce,
                    "trade_source": signdata.trade_source,
                    "signature": signdata.signature,
                    "classcode": signdata.classcode,
                    "traincode": signdata.traincode,
                    //1106:添加了二维码ID这一参数值
                    "qrcodeid" : signdata.qrcodeid,
                    "attentype": "class",
                    "longitude" : qiandao_lng,
                    "latitude" : qiandao_lat,
                    "judgelist" : signdata.judgelist
                };
                //调用早会签到验证的函数，返回签到结果
                if(codeBtnFlag){
                    return_lnglat(signalldata);
                }
                codeBtnFlag = false;
            }else{
                //
            }
        }else{
            //严谨写法,防止错误
            alert("系统错误!");
        }

    }
    //解析定位错误信息
    function onError(data) {

        //alert(JSON.stringify(data));

        //console(data.toString);
        alert('定位失败');
    }
}
