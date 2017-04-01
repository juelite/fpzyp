/**
 * 回放视频功能
 */
"use strict";

/** *********回放事件消息通知类型************ */
// Token请求通知
var PLAYBACK_EVENT_TOKEN     = 33554438;
// 窗口选中改变通知
var PLAYBACK_EVENT_WINDOW    = 33554449;
// 回放开始通知
var PLAYBACK_EVENT_START     = 33554464;
// 回放停止通知
var PLAYBACK_EVENT_STOP      = 33554465;
//下载进度事件
var EVENT_DOWNLOAD           = 0x08000001;
// 记录控件对象
var callbackOcxObj;

/**
 * 回放控件类
 *
 * @param:divId 控件所在DIV的ID
 */
function PlaybackOCX(options) {

	/**
	 * 初始化
	 */
	this.init = function(options) {
		this.divId = options.divId;
        this.theme  = options.theme;
		// 获取控件所在DIV
		var divObj = document.getElementById(this.divId);
		if (isBrowserIE() == 2) {// IE11
			// 加载控件
			var o = document.createElement("object");

			var o2 = document.createElement("PARAM");
			o2.setAttribute("NAME","THEME");
			o2.setAttribute("VALUE",this.theme);
			o.setAttribute("classid",
					"clsid:9FBB8076-0B0E-49F0-9013-7B74B1C4CABB");
			o.setAttribute("width", "100%");
			o.setAttribute("height", "100%");
			o.setAttribute("id", "PlayBackOCX");
			o.setAttribute("name", "PlayBackOCX");
//			o.object.theme =this.theme;
     		o.appendChild(o2);

			divObj.appendChild(o);
//			divObj.object.Theme =this.theme;

			var script = document.createElement("script");
			script.setAttribute("language", "javascript");
			script.setAttribute("for", "PlayBackOCX");
			script.setAttribute("event",
					"Notify(event_type, wnd_index, lparam, sparam)");
			script.innerHTML = "Notify(event_type, wnd_index, lparam, sparam);";
			divObj.appendChild(script);
		} else {
			if (-[ 1, ]) {// IE9,IE10
				// 加载控件
				var object = document.createElement("object");


				object.setAttribute("classid",
						"clsid:9FBB8076-0B0E-49F0-9013-7B74B1C4CABB");
				object.setAttribute("width", "100%");
				object.setAttribute("height", "100%");
				object.setAttribute("id", "PlayBackOCX");
				object.setAttribute("name", "PlayBackOCX");
				object.setAttribute("Theme", this.theme);
				try{
					object.object.Theme =this.theme;
				}catch(e){
					;;;;
				}
				divObj.appendChild(object);

//                var prms=divObj.getElementsByTagName("param");
//                for(var i=0;i<prms.length;i++){
//                	if(prms[i].name=="Theme"){
//                		 prms[i].value==this.theme;
//                	}
//
//                }


				var script = document.createElement("script");
				script.setAttribute("language", "javascript");
				script.setAttribute("for", "PlayBackOCX");
				script.setAttribute("event",
						"Notify(event_type, wnd_index, lparam, sparam)");
				script.innerHTML = "Notify(event_type, wnd_index, lparam, sparam);";
				divObj.appendChild(script);
			} else {// IE6,7,8
				var object2 = document.createElement("object");


//				object2.setAttribute("classid",
//						"clsid:9FBB8076-0B0E-49F0-9013-7B74B1C4CABB");
//				object2.setAttribute("width", "100%");
//				object2.setAttribute("height", "100%");
//				object2.setAttribute("id", "PlayBackOCX");
//				object2.setAttribute("name", "PlayBackOCX");
//				object2.setAttribute("Theme", this.theme);
//				object2.object.Theme =this.theme;
//				alert(object2.innerHTML);
				divObj.innerHTML = '<object id=\"PlayBackOCX\"Theme=\"'+this.theme+'\"classid=\"clsid:9FBB8076-0B0E-49F0-9013-7B74B1C4CABB\" width=\"100%\" height=\"100%\" ><param name="Theme" value =\"'+this.theme+'\"></object>'
						+ '<script language=\"javascript\" for=\"PlayBackOCX\" event=\"Notify(event_type, wnd_index, lparam, sparam)\">Notify(event_type, wnd_index, lparam, sparam);</script>';
			}
		}

		// 回放控件
		this.playbackOCX = document.getElementById("PlayBackOCX");

		// 存放回放控件回调函数的数组
		this.callback = new Array();

		// 记录对象
		callbackOcxObj = this;
	}

	/**
	 * 设置全局参数
	 *
	 * @param:xml 全局参数
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.setGlobalParam = function(xml) {
		try {
			var result = this.playbackOCX.SetGlobalParam(xml);

			return result;
		} catch (e) {
			return 1;
		}
	}

	/**
	 * 设置Token
	 *
	 * @param:reqID 令牌请求ID
	 * @param:token 令牌
	 * @returns:成功返回0；失败返回错误码
	 */
	this.setToken = function(reqID, token) {
		try {
			var result = this.playbackOCX.SetToken(reqID, token);

			return result;
		} catch (e) {
			return 1;
		}
	}

	this.getDecodeTime = function(windIndex){
		try {
			var result = this.playbackOCX.GetDecodeTime(windIndex);
			return result;
		} catch (e) {
			// TODO: handle exception
			return "获取解码时间失败";
		}
	}
	/**
	 * 下载接口
	 * @param:bOpen 1代表打开 0代表关闭
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.startDownLoad = function(beginTime,endTime,filePath,xml) {
		try{
			var result = this.playbackOCX.StartDownLoad(beginTime,endTime,filePath,xml);
			return result;
		   }catch(e) {
				return 1;
		}
	}






	/**
	 * 停止下载
	 * @param:bOpen 1代表打开 0代表关闭
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.stopDownload = function(handle) {
		try{
			this.playbackOCX.StopDownload(handle);
			return 0;
		   }catch(e) {
				return 1;
		}
	}
	/**
	 * 录像搜索与播放
	 *
	 * @param:beginTime 搜索开始时间 2013-04-18 10:00:00
	 * @param:endTime 搜索结束时间 2013-04-18 10:30:00
	 * @param:xml 回放搜索参数
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.setPlayback = function(beginTime, endTime, xml) {
		try {
			var result = this.playbackOCX.SetPlayback(beginTime, endTime, xml);
			return result;
		} catch (e) {
			return 1;
		}
	}

	/**
	 * 停止回放
	 *
	 * @param:index 窗口索引，-1表示停止所有窗口回放
	 * @returns
	 */
	this.stopPlayback = function(index) {
		try {

			this.playbackOCX.ClearPlayback(index);
			return;
		} catch (e) {
			return;
		}
	}

	/**
	 * 获取当前选中窗口
	 *
	 * @returns:选中窗口索引
	 */
	this.getSelectedWindow = function() {
		try {
			var index = this.playbackOCX.GetSelectedWindow();
			return index;
		} catch (e) {
			return 0;
		}
	}

	/**
	 * 注册回调方法
	 *
	 * @param:callbackType 回调类型
	 * @param:fn 回调方法
	 */
	this.registerCallback = function(callbackType, fn) {
		this.callback[callbackType] = fn;
	}

	this.init(options);
}

/**
 * 回放事件消息通知
 *
 * @param:event_type 事件类型
 * @param:wnd_index 窗口索引
 * @param:lparam 事件携带的整形参数
 * @param:sparam 事件携带的字符参数
 */
function Notify(event_type, wnd_index, lparam, sparam) {
	switch (event_type) {
	case PLAYBACK_EVENT_TOKEN:
		if (callbackOcxObj.callback[event_type]) {
			callbackOcxObj.callback[event_type].call(this, lparam);
		}
		break;
	case PLAYBACK_EVENT_WINDOW:
		if (callbackOcxObj.callback[event_type]) {
			callbackOcxObj.callback[event_type].call(this, wnd_index);
		}
		break;
	case PLAYBACK_EVENT_START:
		if (callbackOcxObj.callback[event_type]) {
			callbackOcxObj.callback[event_type].call(this, wnd_index);
		}
		break;
	case PLAYBACK_EVENT_STOP:
		if (callbackOcxObj.callback[event_type]) {
			callbackOcxObj.callback[event_type].call(this, wnd_index);
		}
		break;
	case EVENT_DOWNLOAD:
		if (callbackOcxObj.callback[event_type]) {
			callbackOcxObj.callback[event_type].call(this,lparam,sparam);
		}
		break;
	default:
		// alert("视频回放通知消息类型错误！");
	}
}

/**
 * 判断浏览器类型
 *
 * @returns:0-IE8~IE10,1-Chrome,2-IE11
 */
function isBrowserIE() {
	var appName = navigator.userAgent;
	if (appName.indexOf('MSIE') > -1) {
		return 0;
	} else if (appName.indexOf('Chrome') > -1) {
		return 1;
	} else if (!!window.ActiveXObject || "ActiveXObject" in window) {
		// 判断是否是IE11
		return 2;
	}
	return 0;
}
