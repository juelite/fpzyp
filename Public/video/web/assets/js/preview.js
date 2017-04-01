/**
 * 预览视频功能
 */
"use strict";

/** *********预览事件消息通知类型************ */
// 抓图结束通知
var PREVIEW_EVENT_SNAP = 33554433;
// 紧急录像结束通知
var PREVIEW_EVENT_VEDIO = 33554434;
// 开始预览通知
var PREVIEW_EVENT_START = 33554437;
// 停止预览通知
var PREVIEW_EVENT_STOP = 33554438;
// 获取token消息通知
var PREVIEW_EVENT_TOKEN = 33554446;
// 窗口选中改变通知
var PREVIEW_EVENT_CHANGE = 33554449;

// 记录控件对象
var previewOcxObj;

/**
 * 预览控件类
 * 
 * @param:divId 控件所在DIV的ID
 */
function PreviewOCX(options) {

	/**
	 * 初始化
	 */
	this.init = function(options) {
		this.divId = options.divId;

		// 获取控件所在DIV
		var divObj = document.getElementById(this.divId);
		if (isBrowserIE() == 2) {// IE11
			// 加载控件
			divObj.innerHTML = '<object classid=\"clsid:6DABF69C-7610-4D25-BC4F-664003130B94\" width=\"100%\" height=\"100%\" id=\"PreviewOCX\" name=\"PreviewOCX\" ></object>';

			// 注册回调方法
			var handler = document.createElement("script");
			handler.setAttribute("for", "PreviewOCX");
			handler.event = "EventNotify(event_type, wnd_index, param)";
			var node = document
					.createTextNode("EventNotify(event_type, wnd_index, param);");
			handler.appendChild(node);
			divObj.appendChild(handler);
		} else {
			// 加载控件
			var object = document.createElement("object");
			object.setAttribute("classid",
					"clsid:6DABF69C-7610-4D25-BC4F-664003130B94");
			object.setAttribute("width", "100%");
			object.setAttribute("height", "100%");
			object.setAttribute("id", "PreviewOCX");
			object.setAttribute("name", "PreviewOCX");
			divObj.appendChild(object);

			var script = document.createElement("script");
			script.setAttribute("language", "javascript");
			script.setAttribute("for", "PreviewOCX");
			script.setAttribute("event",
					"EventNotify(event_type, wnd_index, param)");
			script.innerHTML = "EventNotify(event_type, wnd_index, param);";
			divObj.appendChild(script);
		}

		// 预览控件
		this.previewOCX = document.getElementById("PreviewOCX");

		// 存放预览控件回调函数的数组
		this.callback = new Array();

		// 预览对象保存
		previewOcxObj = this;
	}

	/**
	 * 设置全局参数
	 * 
	 * @param:xml 全局参数
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.setGlobalParam = function(xml) {
		var result = this.previewOCX.SetGlobalParam(xml);

		return result;
	}

	/**
	 * 设置操作权限
	 * 
	 * @param:operXml 权限类型
	 * @returns:成功返回0；失败返回错误码
	 */
	this.setOperAuth = function(operXml) {
		var result = this.previewOCX.SetOpPrivilege(operXml);
		return result;
	}

	/**
	 * 设置Token
	 * 
	 * @param:reqID 令牌请求ID
	 * @param:token 令牌
	 * @returns:成功返回0；失败返回错误码
	 */
	this.setToken = function(reqID, token) {
		var result = this.previewOCX.SetToken(reqID, token);
		return result;
	}

	/**
	 * 设置窗口布局
	 * 
	 * @param:layoutType 布局格式枚举见示例
	 * @returns:成功返回0；失败返回错误码
	 */
	this.setWindowsLayout = function(layoutType) {
		var result = this.previewOCX.SetLayoutType(layoutType);
		return result;
	}

	/**
	 * 开始预览
	 * 
	 * @param:xml 预览参数
	 * @param:wndIdx 当前预览的窗口索引号
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.startPreview = function(wndIdx, xml) {
		var result = this.previewOCX.StartPreview(xml, wndIdx);
		return result;
	}

	/**
	 * 停止预览
	 * 
	 * @param:index 窗口索引，-1表示停止所有窗口的预览
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.stopPreview = function(index) {
		var result = this.previewOCX.StopPreview(index);
		return result;
	}

	/**
	 * 云镜控制
	 * 
	 * @param:cmdId 云台控制参数
	 * @param:xml 云台控制参数
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.ptzControl = function(cmdId, xml) {
		var result = this.previewOCX.PtzControl(cmdId, xml);
		return result;
	}

	/**
	 * 视频参数设置
	 * 
	 * @param:xml 设置的视频参数
	 * @returns:成功返回0；失败返回错误码
	 */
	this.setPreviewParam = function(xml) {
		var result = this.previewOCX.SetVideoParam(xml);
		return result;
	}

	/**
	 * 视频参数获取
	 * 
	 * @returns:视频参数
	 */
	this.getPreviewParam = function() {
		var cfgXml = this.previewOCX.GetVideoParam();
		return cfgXml;
	}

	/**
	 * 预览状态获取
	 * 
	 * @param:wndIndex 指定窗口的窗口索引值
	 * @returns:0表示没有预览，1表示正在预览
	 */
	this.getPreviewStatus = function(wndIndex) {
		var status = this.previewOCX.IsPreview(wndIndex);
		return status;
	}

	/**
	 * 设置当前选中窗口
	 * 
	 * @param:wndIndex 指定窗口的窗口索引值
	 * @returns:操作发起成功0；失败返回错误码
	 */
	this.setSelectWindow = function(wndIndex) {
		var result = this.previewOCX.SelectWindow(wndIndex);
		return result;
	}

	/**
	 * 获取当前选中窗口
	 * 
	 * @returns:选中窗口索引
	 */
	this.getSelectWindow = function() {
		var index = this.previewOCX.GetCurrentSelectWindow();
		return index;
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
 * 预览事件消息通知
 * 
 * @param:event_type 事件类型
 * @param:wnd_index 窗口索引
 * @param:xml 事件携带的参数
 */
function EventNotify(event_type, wnd_index, param) {
	switch (event_type) {
	case PREVIEW_EVENT_SNAP:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call(this, param);
		}
		break;
	case PREVIEW_EVENT_VEDIO:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call(this, param);
		}
		break;
	case PREVIEW_EVENT_START:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call();
		}
		break;
	case PREVIEW_EVENT_STOP:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call();
		}
		break;
	case PREVIEW_EVENT_TOKEN:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call(this, param);
		}
		break;
	case PREVIEW_EVENT_CHANGE:
		if (previewOcxObj.callback[event_type]) {
			previewOcxObj.callback[event_type].call(this, wnd_index);
		}
		break;
	default:
		// alert("视频预览通知消息类型错误！");
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