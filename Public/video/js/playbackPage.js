var PlayBackOCX;
var SUCCESS=0;    /* 控件操作成功*/
var FAILED=1;    /* 控件操作失败*/
var DOWNLOADFLAG=0;
var handle="";
var theme ="Red";
window.isfirst = 0; // 用来第一次自动选择某一个节点
function downloadState(lparam,wparam){
//    var percent = wparam.getElementsByTagName("download");
    print("句柄为："+lparam+"下载状态："+wparam);
}
function windowChange(){
    print("事件通知：窗口选中改变");
}

function startPlayback(){
    print("事件通知：回放开始");
}

function stopPlayback(){
    print("事件通知：回放停止");
}
function selectOcxSkinType(){
    var theme = $("#ocxSkinSelect").val();
    var ocxType ="playbackOcx";
    $.ajax({
        type:"post",
        url:"../../../param/setOcxSkinAction",
        dataType:"text",
        data:{
            theme:theme,
            ocxType:ocxType
            },
        success:function(data){
            window.location.href=window.location.href;
        }
    });
    window.location.href=window.location.href;
}
function applyToken(reqID){
    print("事件通知：token请求");
    // $.post("../../../stream/getVmsTokenAction",
    $.post(getTokenUrl,
      function (data,status){
             var setTokenResult = PlayBackOCX.setToken(reqID,data);
             if(setTokenResult==SUCCESS){
                print("token设置成功");
             }
             else{
                 print("token设置失败，错误码为："+setTokenResult)
             }
      },"text"
    );
}

$(document).ready(function(){

    //加载视频回放控件
	/*    var options={
            divId:"ocx_playback",
            skin: skin
        };
    PlayBackOCX = new PlaybackOCX(options);*/

    //注册消息事件通知回调方法
    //
    //参数设置
    $('#setGlobalParam').click(function () {
         settingDialog.dialog("open");
           return false;
       });

    //下载设置
    $('#downloadVideo').click(function () {
        if(DOWNLOADFLAG==0){
            var indexCode = $("#selectCameraName").attr("indexCode");
            if(indexCode == null){
                $.sticky("请选择监控点！", 'attention');
                return;
            }
        downloadDialog.dialog("open");
        }else if(DOWNLOADFLAG==1){
            var result = PlayBackOCX.stopDownload(handle);
            DOWNLOADFLAG=0;
            var message =""
            $("#downloadVideo").text('开始下载');
            if(result==0){
                message = "停止下载成功";
            }else{
                message = "停止下载失败";
            }
            print(message);
        }
          return false;
      });

    //获取当前窗口
    $("#getSelectedWindow").click(function(){
        var playBackResult = PlayBackOCX.getSelectedWindow();
        print("当前窗口为："+playBackResult);
    });

    //停止当前窗口回放
    $("#stopPlayback").click(function(){
        PlayBackOCX.stopPlayback(PlayBackOCX.getSelectedWindow());
    });


    //获取解码时间
    $("#getDecodeTime").click(function(){
        var result =PlayBackOCX.getDecodeTime(PlayBackOCX.getSelectedWindow());
        alert(result);
//        var days=Math.floor(result/(24*3600));
//
//        //计算出小时数
//
//        var leave1=result%(24*3600);    //计算天数后剩余的毫秒数
//        var hours=Math.floor(leave1/(3600));
//        //计算相差分钟数
//        var leave2=leave1%(3600) ;       //计算小时数后剩余的毫秒数
//        var minutes=Math.floor(leave2/60);
//        //计算相差秒数
//        var leave3=leave2%(60);      //计算分钟数后剩余的毫秒数
//        var seconds=Math.round(leave3);
        print("当前时间为："+result);
    });



    //停止所有回放
    $("#stopPlaybackAll").click(function(){
        PlayBackOCX.stopPlayback(-1);
    });

    //清空提示框
    $("#clearAll").click(function(){
        $("#information").val("");
    });
    getOcxSkin();
});

/*  参数设置——开始 */

//页面加载时从后台获取参数设置的初始值


//参数设置dialog
var settingDialog = $('#settingDialog').dialog({
    autoOpen : false,
    modal : true,
    width : 600,
    height : 500,
    draggable : true,
    buttons : {
        "ok" : {
            text : '确认',
            'class' : 'bPrimary',
            click : function(dialog) {
                dialog.close();
                saveParam();
            }
        },
        "cancel" : {
            text : '关闭',
            click : function(dialog) {
                dialog.close();
            }
        }
    }
});

var downloadDialog = $('#downloadDialog').dialog({
    autoOpen : false,
    modal : true,
    width : 600,
    height : 500,
    draggable : true,
    buttons : {
        "ok" : {
            text : '确认',
            'class' : 'bPrimary',
            click : function(dialog) {
                dialog.close();
                downloadVideo();
            }
        },
        "cancel" : {
            text : '关闭',
            click : function(dialog) {
                dialog.close();
            }
        }
    }
});


//获取空间主题
function getOcxSkin(){
    var ocxType="playbackOcx";
    $.ajax({
        type:"post",
        url:"/",
        dataType:"text",
        data:{
            ocxType:ocxType
            },
        success:function(data){
            theme = 'Blue';
            var options={
                    divId:"ocx_playback",
                    theme: 'Red'
                };
                PlayBackOCX = new PlaybackOCX(options);
                PlayBackOCX.registerCallback(PLAYBACK_EVENT_WINDOW,windowChange);
                PlayBackOCX.registerCallback(PLAYBACK_EVENT_START,startPlayback);
                PlayBackOCX.registerCallback(PLAYBACK_EVENT_STOP,stopPlayback);
                PlayBackOCX.registerCallback(PLAYBACK_EVENT_TOKEN,applyToken);
                PlayBackOCX.registerCallback(EVENT_DOWNLOAD,downloadState);
                $.ajax({
                    type:"post",
                    url:"/",
                    dataType:"text",
                    success:function(data){

                        var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><global><snap picture=\"jpeg\" save=\"d:\\\"/><clip packSize=\"256\" save=\"d:\\\"/><performance decode=\"5\"/></global>";
                        PlayBackOCX.setGlobalParam(xml);
                    }
                });
//            alert(skin);
        }
    });
}





//下载录像
function downloadVideo(){
    var beginTime = $("#beginTime").val();
    var endTime = $("#endTime").val();
    var indexCode = $("#selectCameraName").attr("indexCode");
    if(indexCode == null){
        $.sticky("请选择监控点！", 'attention');
        return;
    }
    if(beginTime == ""){
        $.sticky("开始时间不能为空！", 'attention');
        return;
    }
    if(endTime == ""){
        $.sticky("结束时间不能为空！", 'attention');
        return;
    }
    var subTime = (toDate(endTime).getTime()-toDate(beginTime).getTime())/1000/3600/24;
    //比较日期大小
    if(subTime < 0){
        $.sticky("开始时间必须小于结束时间！","时间选择错误！", 'attention');
        return;
    }
    if(subTime > 3){
        $.sticky("时间跨度不得超过3天，请重新选择！","时间选择错误！", 'attention');
        return;
    }
    var storeType =$("#storeType").val();
    beginTime = formatDate(beginTime);
    endTime = formatDate(endTime);
    var filePath= $("#videoSavePath").val();
    var indexCode = $("#selectCameraName").attr("indexCode");
    $.post("../../../stream/getPlaybackInfoAction",
              {
                indexCode:indexCode,
                beginTime:beginTime,
                endTime:endTime,
                storeType:storeType
              },
              function (data,status){
                  var playBackResult = PlayBackOCX.setPlayback(beginTime,endTime,data);
                  if(playBackResult==SUCCESS){
                      alert("查询成功,开始下载");
                      var result = PlayBackOCX.startDownLoad(beginTime,endTime,filePath,data);
                      if(result==1){
                          print("调用下载接口失败");
                      }else{
                          DOWNLOADFLAG=1;
                          $("#downloadVideo").text('停止下载');
                          handle = result;
                          print ("下载成功，句柄为"+result);
                      }
                  }else{
                      print("查询失败，错误码为："+playBackResult);
                  }
              },
             "text"
            );

}

//保存全局参数
function saveParam() {
    var pictype = $("input[name='capture.format']:checked").attr("data-value");
    var picpath = $("#captureSavePath").val();
    var videosize = $("#videoClibsSize").val();
    var videopath = $("#videoClibsSavePath").val();
    var decode = $("#slideValue").text();
    var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><global><snap picture=\"" + pictype + "\" save=\"" + picpath+ "\"/><clip packSize=\"" + videosize + "\" save=\""+videopath+"\"/><performance decode=\"" + decode + "\"/></global>";
    if (PlayBackOCX.setGlobalParam(xml) == SUCCESS) {
        $.ajax({
            type:"post",
            url:"../../../param/saveParmAction",
            dataType:"text",
            data:{
                picType: pictype,
                picPath: picpath,
                videoSize: videosize,
                videoPath: videopath,
                decode: decode
                }
        });
         jAlert('全局参数设置成功', '全局参数', 'ok');
    }else{
         jAlert('全局参数设置失败', '全局参数', 'error');
    }

}

//用于切换参数设置表单里的页面
function showDetail(e){
     var name=$(e).attr('name');
     var id=$(e).attr('id');
     $("a[name='"+name+"']").parent().removeClass('active');
     $(".form-inline").addClass('div-none');
     $(e).parent().addClass("active");
     $("#"+id+name).removeClass('div-none');
 }

 //用于设置抓图和剪辑的保存路径
function browseFolder(id) {
    try {
        var Message = "选择文件路径"; //选择框提示信息
        var Shell = new ActiveXObject("Shell.Application");
        //var Folder = Shell.BrowseForFolder(0, Message, 64, 17); //起始目录为：我的电脑
        var Folder = Shell.BrowseForFolder(0, Message, 0); //起始目录为：桌面
        if (Folder != null) {
            document.getElementById(id).value = Folder.self.path;
            return Folder;
        }
    } catch (e) {
        jAlert(e.message);
    }
}

//用于参数设置表单里的解码性能
$('#slide').slider({
    range: "min",
    min: 1,
    max: 9,
    value: 5,
    slide: function( event, ui ) {
        $('#slideValue').text(ui.value);
    }
});
/*  参数设置——结束 */


/* 查询录像和回放——开始  */
var myDate = new Date().format("yyyy-MM-dd");

$("#beginTime").val(myDate+" 00:00:00");
$("#endTime").val(myDate+" 23:59:59");

$("#playCramera_time").click(function(){
    var indexCode = $("#selectCameraName").attr("indexCode");
    if(indexCode == null){
        $.sticky("请选择监控点！", 'attention');
        return;
    }
    playCamera(indexCode);
});

function playCamera(indexCode){
    var beginTime = $("#beginTime").val();
    var endTime = $("#endTime").val();

    if(beginTime == ""){
        $.sticky("开始时间不能为空！", 'attention');
        return;
    }
    if(endTime == ""){
        $.sticky("结束时间不能为空！", 'attention');
        return;
    }
    var subTime = (toDate(endTime).getTime()-toDate(beginTime).getTime())/1000/3600/24;
    //比较日期大小
    if(subTime < 0){
        $.sticky("开始时间必须小于结束时间！","时间选择错误！", 'attention');
        return;
    }
    if(subTime > 3){
        $.sticky("时间跨度不得超过3天，请重新选择！","时间选择错误！", 'attention');
        return;
    }
    var storeType =$("#storeType").val();
        beginTime = formatDate(beginTime);
    endTime = formatDate(endTime);

    //获取回放xml
    // $.post("../../../stream/getPlaybackInfoAction",
    $.post(getPlayBackXml,
      {
        indexCode:indexCode,
        beginTime:beginTime,
        endTime:endTime,
        storeType:storeType
      },
      function (data,status){
          var playBackResult = PlayBackOCX.setPlayback(beginTime,endTime,data);
          if(playBackResult==SUCCESS){
              print("查询成功");
          }else{
              print("查询失败，错误码为："+playBackResult);
          }
      },
     "text"
    );
}

function toDate(strDateTime){
    var strDateTimes = strDateTime.split(' ');
    var strDate = strDateTimes[0].split('-');
    var year = Number(strDate[0]);
    var month = Number(strDate[1]) - 1;
    var day = Number(strDate[2]);

    var strTime = strDateTimes[1].split(':');
    var hour = Number(strTime[0]);
    var minute = Number(strTime[1]);
    var secend = Number(strTime[2]);
    return new Date(year, month, day, hour, minute, secend);
}

function formatDate(time){
    return time.replace(" ","T")+"Z";
}
/* 查询录像和回放——结束  */


/*  视频回放页面监控点资源树  */
var settingS = {
    id:'mytree',
    //页面加载时先获取所有组织资源
    ajax : {
        url : getResourceAction,
        type:"post",
        data:{resType:1000},
        dataType:"text"
    },
    data: {
        simpleData: {
            enable: true
        },
        key:{
            name:"name"
        }
    },
    //异步加载监控点 ，参数为组织资源的indexCode
    async : {
        enable : true,
        url : getCameraAction,
        autoParam:["indexCode"],
        type : 'post',
        dataFilter: filter
    },
    callback : {
        beforeExpand: zTreeBeforeExpand,
        onExpand:zTreeExpand,
        onClick: onclick,
        onAsyncSuccess:function(event, treeId, treeNode, msg){
        	if(0==window.isfirst){
        		var n = treeNode.children[treeNode.children.length-1];
        		var treeObj = $.fn.zTree.getZTreeObj("zTreea");
        		treeObj.selectNode(n , true, true);

    			// $('.curSelectedNode').trigger('click');

    			$("#selectCameraName").text(n.name);
        		$("#selectCameraName").attr({"indexCode":n.indexCode});
        		setTimeout(function(){
        			$('#playCramera_time').trigger('click');
        		},1800)
        		window.isfirst = 1;// 用来第一次自动选择某一个节点（只要一次）
        	}
        }
    }
};

function zTreeExpand(event, treeId, treeNode){
	// alert(treeNode.tId + ", " + treeNode.name);
}

//处理监控点节点的id属性，在每个监控点的id属性值前面加上 "camera"
function filter(treeId, parentNode, childNodes) {
    if (!childNodes) return null;
    for (var i=0, l=childNodes.length; i<l; i++) {
        childNodes[i].id = "camera"+childNodes[i].id;
    }
    return childNodes;
}

function zTreeBeforeExpand(treeId, treeNode) {
    var treea = $("#zTreea").tree();
     if(!treeNode.isExpand){
         treea.reAsyncChildNodes(treeNode, "!refresh");
         treeNode.isExpand = 1;
     }
     return true;
 };

function onclick(event,treeId,treeNode){
	// alert(treeNode.tag)
    if(treeNode && treeNode.tag && treeNode.tag=="camera"){
        $("#selectCameraName").text(treeNode.name);
        $("#selectCameraName").attr({"indexCode":treeNode.indexCode});
           // alert(treeNode.indexCode);
    }
}


$('#zTreea').tree(settingS);

function print(msg){
    var console=document.getElementById('information');
    var oldMsg=console.value;
    console.value=oldMsg+'\n'+msg;
}


function getChildren(ids,treeNode){
    ids.push(treeNode.id);
     if (treeNode.isParent){
            for(var obj in treeNode.children){
                getChildren(ids,treeNode.children[obj]);
            }
        }
     return ids;
}

setTimeout(function(){
	var treea = $("#zTreea").tree();
    var treeObj = $.fn.zTree.getZTreeObj("zTreea");
    var indexCode = $.url().param('indexCode');//'001052';
    var btime = $.url().param('btime');
    var etime = $.url().param('etime');
    // var myDate = '2016-11-22';
    // alert(tm)
	$("#beginTime").val(btime);
	$("#endTime").val(etime);
	// $("#endTime").val(myDate+" 23:59:59");

    var n = treeObj.getNodeByParam("indexCode", indexCode, null);

    treeObj.expandNode(n,true,true,true);
},2000);
