window.isfirst = 0; //
var ocx;
var preWindowIndex=0;
var indexcodes = [];
var pictype = "jpeg";
var picpath = "C:\\";
var videosize = "256";
var videopath = "C:\\";
var decode = "5";
var PTZ_CMD_ZOOM_IN=11		/* 焦距以速度SS变大(倍率变大) */
var PTZ_CMD_ZOOM_OUT=12		/* 焦距以速度SS变小(倍率变小) */
var PTZ_CMD_FOCUS_NEAR=13		/* 焦点以速度SS前调*/
var PTZ_CMD_FOCUS_FAR=14		/* 焦点以速度SS后调*/
var PTZ_CMD_IRIS_OPEN=15		/* 光圈以速度SS扩大*/
var PTZ_CMD_IRIS_CLOSE=16		/* 光圈以速度SS缩小*/
var PTZ_CMD_TILT_UP=21		/* 云台以SS的速度上仰*/
var PTZ_CMD_TILT_DOWN=22		/* 云台以SS的速度下俯*/
var PTZ_CMD_PAN_LEFT=23		/* 云台以SS的速度左转*/
var PTZ_CMD_PAN_RIGHT=24		/* 云台以SS的速度右转*/
var PTZ_CMD_UP_LEFT=25		/* 云台以SS的速度上仰和左转*/
var PTZ_CMD_UP_RIGHT=26		/* 云台以SS的速度上仰和右转*/
var PTZ_CMD_DOWN_LEFT=27		/* 云台以SS的速度下俯和左转*/
var PTZ_CMD_DOWN_RIGHT=28		/* 云台以SS的速度下俯和右转*/
var PTZ_CMD_PAN_AUTO=29		/* 云台以SS的速度左右自动扫描*/
var PRESET_CMD_SET_PRESET=8		/* 设置预置点*/
var PRESET_CMD_CLE_PRESET=9		/* 清除预置点*/
var PRESET_CMD_GOTO_PRESET=39	/* 转到预置点*/
var PTZ_CMD_START=0;		/* 开始命令*/
var PTZ_CMD_STOP=1;			/* 结束命令*/
var SUCCESS=0;	/* 控件操作成功*/
var FAILED=1;	/* 控件操作失败*/
var ERROR=-1;	/* 控件操作错误*/
var ISPREVIEW=1; /* 正在预览*/
var NOTPREVIEW=0; /* 没在预览*/
var OPRATION_PTZ=10004;
var OPRATION_CUTVIDEO=10003;
var OPRATION_VIDEOPARAM=10002;
var theme = "Red";
//token设置事件通知
function tokenCallEvent(reqID) {
	//alert(reqID);
	$.ajax({
		url : ajaxGetToken,
		type : "post",
		dataType : "text",
		success : function(token) {
			ocx.setToken(reqID, token);
		}
	});
}
//预览消息事件
function OnfireEventNotify(EventType,WndIndex,EventXml)
{
	var RealTimePlayOcx=document.getElementById("PreviewOCX");
	switch(EventType)
	{
		case 0x02000001: 		//抓图
			break;
		case 0x02000002: 		//紧急录像
			break;
		case 0x02000005:	//开始预览
			break;
		case 0x02000006:	//停止预览
			break;
		case 0x0200000E: 	//获取令牌
		    //var reqId = new new Number(EventXml);
			$.ajax({
				url : "../../../stream/getVmsTokenAction",
				type : "post",
				dataType : "text",
				success : function(token) {
					//alert(token);
					RealTimePlayOcx.SetToken(EventXml, token);
				}
			});

			break;
		case 0x02000011:	//窗口选中改变
			break;
		case 0x02000007:		//控件初始化完毕事件
			break;
		case 0x02000012:		//窗口交换改变
			break;
		default: //
	}
}

function selectOcxSkinType(){
	var theme = $("#ocxSkinSelect").val();
	var ocxType ="previewOcx";
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

function initParam(isTrue){
	$.ajax({
		type:"post",
		url:"/",
		dataType:"text",
		success:function(data){
			// var param=jQuery.parseJSON(data);
			// $("input[data-value='"+param.picType+"']").attr("checked","checked");
			// $("#captureSavePath").val(param.picPath);
			// $("select option[value='"+param.videoSize+"']").attr("selected","selected");
			// $("Select").uniform();
			// $("#videoClibsSavePath").val(param.videoPath);
			// $("#slideValue").text(param.decode);
			// $("#slide").slider({value:param.decode});
			if(isTrue){
				var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><global><snap picture=\"jpeg\" save=\"d:\\\"/><clip packSize=\"256\" save=\"d:\\\"/><performance decode=\"5\"/></global>";
;
				if(ocx.setGlobalParam(xml)==FAILED){
					 jAlert('全局参数初始化失败', '全局参数', 'error');
				}
			}else{
				settingDialog.dialog("open");
			}

		}
	});
}

//窗口交换改变事件通知
function windowExchangeEvent(index) {
	print("窗口交换改变，当前窗口索引为：" + index);
}
function windowInitOK() {
	print(" 控件初始化完毕");

}
//窗口选择改变事件通知
function windowChangeEvent(index){
	var windIndex=showptz();
	print("窗口选中改变，当前窗口索引为：" + windIndex);
}
//开始预览事件通知
function startPreviewEvent(){
	var windIndex=showptz();
	print("窗口" + windIndex+"：开始预览");
}
//停止预览事件通知
function stopPreviewEvent(){
	var windIndex=ocx.getSelectWindow();
	print("窗口" + windIndex+"：停止预览");
}
//抓图完成事件通知
function picCutEvent(param){
	var windIndex=ocx.getSelectWindow();
	if(param==SUCCESS){
		print("窗口" + windIndex+"：抓图成功");
	}else{
		print("窗口" + windIndex+"：抓图失败");
	}
}
//录像完成事件通知
function videoCutEvent(param){
	var windIndex=ocx.getSelectWindow();
	if(param==SUCCESS){
		print("窗口" + windIndex+"：录像成功");
	}else{
		print("窗口" + windIndex+"：录像失败");
	}

}
//选择窗口布局
function selectWindowType() {
	var layoutType = Number($("#windowTypeSelect").val());
	if(ocx.setWindowsLayout(layoutType)!=SUCCESS){
		 jAlert('窗口布局设置失败', '窗口布局', 'error');
	}else{
		print("窗口布局设置成功");
	}
}
//记录窗口之前选中的index
function remember(id){
	preWindowIndex=$("#"+id).val();
}
//选择当前窗口
function selectWindow() {
	var wndIndex = Number($("#windowselect").val());
	if(ocx.setSelectWindow(wndIndex)==ERROR){
		$("#windowselect").val(preWindowIndex)
	}
}
//获取当前窗口
function getwindow() {
	var getwindow = $("#console");
	var index = ocx.getSelectWindow();
	getwindow.text("当前窗口索引为：" + index);
}

//设置操作权限
function setOpration(indexCode) {
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\" ?> ");
	xml.push("<Privileges>");
	xml.push("<Privilege type=\"12\" /> ");
	$.ajax({
		type:"post",
		url:"../../../stream/checkResourcePrivilegeAction",
		dataType:"text",
		data:{
			indexCode : indexCode,
			operCode : OPRATION_CUTVIDEO
			},
		success:function(data){
			var a = $.parseXML(data);
			var result = $(a).find('result').attr("result_code");
			if(result=="0"){
				xml.push("<Privilege type=\"10\" /> ");
			}
			$.ajax({
				type:"post",
				url:"../../../stream/checkResourcePrivilegeAction",
				dataType:"text",
				data:{
					indexCode : indexCode,
					operCode : OPRATION_PTZ
					},
				success:function(data){
					var a = $.parseXML(data);
					var result = $(a).find('result').attr("result_code");
					if(result=="0"){
						xml.push("<Privilege type=\"9\" /> ");
					}
					xml.push("</Privileges>");
					var index = ocx.getSelectWindow();
					if (ocx.setOperAuth(xml.join(""))==SUCCESS) {
						print("窗口"+index+"操作权限设置成功");
					}else{
						print("窗口"+index+"操作权限设置失败");
					}
				}
			});
		}
	});
}

//获取窗口预览状态
function getWindowState() {
	var index = ocx.getSelectWindow();
	var status = ocx.getPreviewStatus(index);
	if (status == ISPREVIEW) {
		$("#console").text("当前窗口预览状态：正在预览");
	}
	if (status == NOTPREVIEW) {

		$("#console").text("当前窗口预览状态：没有预览");
	}
}
//云台移动，变焦
function ptzControllerMove(command, action) {
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	xml.push("<PtzControl>");
	xml.push("<Action>" + action + "</Action>");
	xml.push("<Priority>50</Priority>");
	xml.push("<Speed>5</Speed>");
	//xml.push("<Preset Index =1 DwellTime=50 Speed=5 />");
	xml.push("</PtzControl>");
	if (ocx.ptzControl(command, xml.join("")) == SUCCESS) {
		print("云台操作："+command+",操作："+action+"成功");
	}else{
		print("云台操作："+command+",操作："+action+"失败");
	}
}

//云台预置点设置
function  ptzSetPoint(pointIndex,action){
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	xml.push("<PtzControl>");
	xml.push("<Action>" + action + "</Action>");
	xml.push("<Priority>50</Priority>");
	xml.push("<Speed>5</Speed>");
	xml.push("<Preset Index ="+pointIndex+" DwellTime=50 Speed=5 />");
	xml.push("</PtzControl>");
	if (ocx.ptzControl(PRESET_CMD_SET_PRESET, xml.join("")) == SUCCESS) {
		return SUCCESS;
	}else{
		return FAILED;
	}
}

//云台调用预置点
function  ptzGetPoint(pointIndex,action){
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	xml.push("<PtzControl>");
	xml.push("<Action>" + action + "</Action>");
	xml.push("<Priority>50</Priority>");
	xml.push("<Speed>5</Speed>");
	xml.push("<Preset Index ="+pointIndex+" DwellTime=50 Speed=5 />");
	xml.push("</PtzControl>");
	if (ocx.ptzControl(PRESET_CMD_GOTO_PRESET, xml.join("")) == SUCCESS) {
		return SUCCESS;
	}else{
		return FAILED;
	}
}

//视频参数设置
function videoParameterUpdate() {
	var paramxml = ocx.getPreviewParam();
	var a = $.parseXML(paramxml);
	var bright = $(a).find('Bright').text();
	//alert(paramxml);
	var contrast = $(a).find('Contrast').text();
	var saturation = $(a).find('Saturation').text();
	var hue = $(a).find('Hue').text();
	$("#videoParameterL").attr("data-default", bright);
	$("#videoParameterM").attr("data-default", contrast);
	$("#videoParameterS").attr("data-default", hue);
	$("#videoParameterB").attr("data-default", saturation);

	$("#videoParameterL").val(bright).trigger('change');
	$("#videoParameterM").val(contrast).trigger('change');
	$("#videoParameterS").val(hue).trigger('change');
	$("#videoParameterB").val(saturation).trigger('change');
}

function getVideoParameterXml(bright,contrast,saturation,hue) {
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	xml.push("<VideoEffect>");
	//亮度
	xml.push("<Bright>"+bright+"</Bright>");
	//对比度
	xml.push("<Contrast>"+contrast+"</Contrast>");
	//饱和度
	xml.push("<Saturation>"+saturation+"</Saturation>");
	//色调
	xml.push("<Hue>"+hue+"</Hue>");
	xml.push("</VideoEffect>");
	return xml.join("");
}

//视频参数获取
function videoParameterGet() {

	var indexCode = indexcodes[ocx.getSelectWindow()];
	var bright = $("#videoParameterL").val();
	var contrast = $("#videoParameterM").val();
	var saturation = $("#videoParameterB").val();
	var hue = $("#videoParameterS").val();
	var xml=getVideoParameterXml(bright,contrast,saturation,hue);
	//alert(xml.join(""));
	$.ajax({
		type:"post",
		url:"../../../stream/checkResourcePrivilegeAction",
		dataType:"text",
		data:{
			indexCode : indexCode,
			operCode : OPRATION_VIDEOPARAM
			},
		success:function(data){
			var a = $.parseXML(data);
			var result = $(a).find('result').attr("result_code");
			if(result=="0"){
				if(ocx.setPreviewParam(xml)!=SUCCESS){
					$("#videoParameterL").attr("data-default", bright);
					$("#videoParameterM").attr("data-default", contrast);
					$("#videoParameterS").attr("data-default", hue);
					$("#videoParameterB").attr("data-default", saturation);
					 jAlert('视频参数设置失败', '视频参数', 'error');
				}else{
					jAlert('视频参数设置成功', '视频参数', 'ok');
				}
			}else{
				jAlert("没有视频参数设置权限");
			}
		}
	});



}
//显示参数设置表单
function showDetail(e) {
	var name = $(e).attr('name');
	var id = $(e).attr('id');
	$("a[name='" + name + "']").parent().removeClass('active');
	$(".form-inline").addClass('div-none');
	$(e).parent().addClass("active");
	$("#" + id + name).removeClass('div-none');

}
//显示录像分包选项
/* function getOptions(e) {
	var id = $(e).attr("id");
	$("div[name='capture.option']").addClass("div-none");
	$("#" + id + "s").removeClass("div-none");
} */
 //开启语音对讲
$("#deviceTalkOpen").click(function(){

	ocx.DeviceTalk(ocx.getSelectWindow(),1);
});

//关闭语音对讲
$("#deviceTalkClose").click(function(){
	ocx.DeviceTalk(ocx.getSelectWindow(),0);
});

//开启声音
$("#playSoundOpen").click(function(){
	ocx.PlaySound(1);
});

//关闭声音
$("#playSoundClose").click(function(){
	ocx.PlaySound(0);
});
//单窗口预览停止
function stopOne() {
	var index = ocx.getSelectWindow();
	if (ocx.stopPreview(index) != SUCCESS) {
		print("窗口"+index+":停止预览失败");
	}else{
		showptz();
	}
}
//全窗口预览停止
function stopAll() {
	if (ocx.stopPreview(-1) != SUCCESS) {
		print("全窗口停止预览失败");
	}else{
		showptz();
	}
}
// 选择本地文件夹路径
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
//选择预置点
function selectIndex(e, id) {
	var text = $(e).text();
	$("#" + id).val(text);
}
/*	//显示预置点列表
function showpoints() {

	var indexcode = indexcodes[ocx.getSelectWindow()];

	$.ajax({
				url : "../../../stream/getPresetToJsonAction",
				type : "post",
				data : {
					indexCode : indexcode
				},
				dataType : "text",
				success : function(json) {
					var presets = jQuery.parseJSON(json);
					$.each(presets,function() {
										var liElement = "<li><a href='#' onclick='selectIndex(this,\"pointindex\")'>"
												+ this.number
												+ "</a></li>";
										var liElement2 = "<li><a href='#' onclick='selectIndex(this,\"selectedpoint\")'>"
												+ this.number
												+ "</a></li>";
										$("#pointInfo").append(
												liElement);
										$("#pointlist").append(
												liElement2);
									})

				}
			});

}*/

function getParmXml(picType,picPath,videoSize,videoPath,decode){
	var xml = [];
	xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?><global>");
	xml.push("<snap picture=\""+picType+"\" save=\""+picPath+"\"/>");
	xml.push("<record packSize=\""+videoSize+"\" save=\""+videoPath+"\"/>");
	xml.push(" <performance decode=\""+decode+"\"/>");
	xml.push("</global>");
	return xml.join("");
}

//保存全局参数
function saveParam() {
	var pictype = $("input[name='capture.format']:checked").attr("data-value");
	var picpath = $("#captureSavePath").val();
	var videosize = $("#videoClibsSize").val();
	var videopath = $("#videoClibsSavePath").val();
	var decode = $("#slideValue").text();
	var xml=getParmXml(pictype,picpath,videosize,videopath,decode);
	//alert(xml.join(""));
	if (ocx.setGlobalParam(xml) == SUCCESS) {
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
				},
			success:function(data){

			}
		});
		return SUCCESS;
	}else{
		return FAILED;
	}

}


//显示云台控制
function showptz() {
	var windIndex = ocx.getSelectWindow();
	if (ocx.getPreviewStatus(windIndex) == 1) {
		$('.control-mask').hide();
		videoParameterUpdate();

	} else {
		$('.control-mask').show();
	}

	return windIndex;
}
//消息打印
function print(msg) {
	var infoConsole = $("#console");
	var now = new Date();
	msg = now.toLocaleString() + ":" + msg;
	var oldMsg = infoConsole.val();
	infoConsole.val(oldMsg + '\n' + msg);
}
//获取空间主题
function getOcxSkin(){
	var ocxType = "previewOcx";
	$.ajax({
		type:"post",
		url:"/",
		dataType:"text",
		data:{
			ocxType:ocxType
			},
		success:function(data){
			theme = 'Blue';
			var preview = {
					divId : "preview_1",
				    theme: theme
				}
				ocx = new PreviewOCX(preview);
				//设置token回调
				ocx.registerCallback(PREVIEW_EVENT_TOKEN, tokenCallEvent);
				//抓图回调函数
				ocx.registerCallback(PREVIEW_EVENT_SNAP, picCutEvent);

				//录像回调
				ocx.registerCallback(PREVIEW_EVENT_VEDIO, videoCutEvent);
				//开始预览回调
				ocx.registerCallback(PREVIEW_EVENT_START, startPreviewEvent);
				//停止预览回调
				ocx.registerCallback(PREVIEW_EVENT_STOP, stopPreviewEvent);
				//窗口选中改变回调
				ocx.registerCallback(PREVIEW_EVENT_SELECTED, windowChangeEvent);
				// 窗口交换改变
				ocx.registerCallback(PREVIEW_EVENT_CHANGE, windowExchangeEvent);
				// 控件初始化完毕消息
				ocx.registerCallback(PREVIEW_EVENT_INIT_OK, windowInitOK);

				//$('#tabContent').tabs();
				initParam(true);
		}
	});
}
$(document).ready(function() {
	//ztree
	var settingRes = {
		//页面加载时先获取组织资源
		ajax : {
			url : getResourceAction,
			type : "post",
			data : {
				resType : 1000
			},
			dataType : "text"
		},
		data : {
			simpleData : {
				enable : true
			},
			key : {
				name : "name"
			}
		},
		//异步加载监控点 ，参数为组织资源的indexCode
		async : {
			enable : true,
			url : getCameraAction,
			autoParam : [ "indexCode" ],
			type : 'post',
			dataFilter : filter
		},
		callback : {
			beforeExpand : zTreeBeforeExpand,
			onDblClick : zTreeOnDblClick,
			onAsyncSuccess:function(event, treeId, treeNode, msg){
	        	if(0==window.isfirst){
	        		var n = treeNode.children[treeNode.children.length-1];
	        		var treeObj = $.fn.zTree.getZTreeObj("zTreea");
	        		treeObj.selectNode(n , true, true);
	        		// alert(11)
	    			// $('.curSelectedNode').trigger('click');

	        		setTimeout(function(){
	        			zTreeOnDblClick(event, treeId, n)
	        			// $('#playCramera_time').trigger('click');
	        		},100)
	        		window.isfirst = 1;// 用来第一次自动选择某一个节点（只要一次）
	        	}
	        }
		}
	};
	//处理监控点节点的id属性，在每个监控点的id属性值前面加上 "camera"
	function filter(treeId, parentNode, childNodes) {
		if (!childNodes)
			return null;
		for ( var i = 0, l = childNodes.length; i < l; i++) {
			childNodes[i].id = "camera" + childNodes[i].id;
		}
		return childNodes;
	}
	function zTreeBeforeExpand(treeId, treeNode) {
		var treea = $("#zTreea").tree();
		if (!treeNode.isExpand) {
			treea.reAsyncChildNodes(treeNode, "!refresh");
			treeNode.isExpand = 1;
		}
		return true;
	}

	$("#clearAll").click(function(){
		$("#console").val("");
	});
	//ztree双击事件
	function zTreeOnDblClick(event, treeId, treeNode) {
		//双击开始预览
		if (treeNode.tag == "camera") {
			//alert(treeNode.indexCode);
			$.ajax({
				url : getStreamAction,
				type : "post",
				data : {
					indexCode : treeNode.indexCode
				},
				dataType : "text",
				success : function(xml) {
					var winindex = ocx.getSelectWindow();
					if(ocx.startPreview(winindex, xml)==0){

						if(ocx.setSelectWindow(winindex+1)==-1){
							ocx.setSelectWindow(0);
						}
					}
					indexcodes[winindex] = treeNode.indexCode;
				}
			});

		}
	}
	;
	var treea = $("#zTreea").tree(settingRes);

	//云台遮罩
	$('.control-mask').show();
	//$('.control-mask').hide();


	$('#pointset').click(function() {
		var selectedpoint = $("#selectedpoint").val();
		if(ptzSetPoint(selectedpoint,PTZ_CMD_START)==0){

		}else{
			 jAlert('预置点设置失败', '预置点', 'error');
		}

	});

	$('#btn-call-preset').click(function() {
		var selectedpoint = $("#selectedpoint").val();
		if(selectedpoint==null || selectedpoint==""){
			jAlert('选择预置点', '请选择预置点', 'error');
		}
		ptzGetPoint(selectedpoint,0);
	});
	 getOcxSkin();
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
					if(saveParam()==SUCCESS){
						dialog.close();
						 jAlert('全局参数设置成功', '全局参数', 'ok');
					}else{
						 jAlert('全局参数设置失败', '全局参数', 'error');
					}
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

	//获取全局参数


	//显示参数设置dialog
	$('#paramset').click(function() {
		initParam(false);
		return false;
	});

	//select样式定义
	 $("Select").uniform();
	//解码性能
	$('#slide').slider({
		range : "min",
		min : 1,
		max : 9,
		value : 5,
		slide : function(event, ui) {
			$('#slideValue').text(ui.value);
		}
	});

	  /* 视频参数 */
    $('#videoParameterSet .uRange').slider({
        range: "min",
        min: 1,
        max: 10,
        value: 5,
        slide: function( event, ui ) {
            $(this).parents('dl').find('dt input').val(ui.value).trigger('change');
        }
    });
    $('#videoParameterSet input[data-trigger="slide"]').spinner({min: 1,max: 10}).on('change',function(){
        var value = $(this).val();
        $(this).parents('dl').find('dd .uRange').slider({value:value});
    });
		$('#videoParameterSet a[data-trigger="reset"]').click(function(){
        var input = $('#videoParameter .controls input');
        $(input).each(function(idx,item){
            $(this).val($(this).attr('data-default')).trigger('change');
        });
        return false;
    });

});
setTimeout(function(){
    var treeObj = $.fn.zTree.getZTreeObj("zTreea");
    var indexCode = $.url().param('indexCode');//'001052';

    var n = treeObj.getNodeByParam("indexCode", indexCode, null);
    // setTimeout(function(){
    // 	var treeObj = $.fn.zTree.getZTreeObj("zTreea");
	   //  var indexCode = $.url().param('indexCode');//'001052';

	   //  var n = treeObj.getNodeByParam("indexCode", indexCode, null);
    // 	var cn = n.children[n.children.length-1]
    // 	treeObj.selectNode(cn, true, true);
    // } , 200);

    treeObj.expandNode(n,true,true,true);
},2000);
