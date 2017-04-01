define('./ocx_playback', [ './active_x' ], function(require, exports) {
	var Active_x = require('./active_x');
	var CameraIndexCodeMap = {};
	var CameraWIndexMap = {};
	return Active_x.extend({
		ocxNotInstall : false,
		constructor : function(opt) {
			this.base(opt, [ 'hikui-active' ], []);
		},
		render : function(clsid) {
			if (clsid) {
				this.base(clsid);
			} else {
				this.base('clsid:88F0ADA4-0B55-49EE-BD4E-FC87AD058DEF');
				this.ocxEl[0].StopPlayback(0);
			}
		},
		throwError : function(error) {
			throw new Error(error);
		},
		SetBasicInfo : function(wIndex, xmlStatus) {
			return this.ocxEl[0].SetBasicInfo(wIndex, xmlStatus);
		},
		addIndexCodeMap:function(wIndex, xmlStatus, indexCode){
			if (indexCode != null) {
				if (CameraWIndexMap[wIndex] == null) {
					CameraWIndexMap[wIndex] = [];
				}
				CameraWIndexMap[wIndex].push(indexCode);
				CameraIndexCodeMap[indexCode] = xmlStatus;
			}
		},
		removeIndexCodeMap : function(wIndex) {
			var map = CameraWIndexMap[wIndex];
			if (map == null) {
				return;
			}
			var indexCode = null;
			if (map.length > 0) {
				indexCode = map[map.length - 1];
				map.pop();
			}
			if (CameraWIndexMap[wIndex].length < 1) {
				CameraWIndexMap[wIndex] = null;
			}
			if (indexCode != null) {
				CameraIndexCodeMap[indexCode] = null;
			}
		},		
		getIndexCodeMap : function(indexCode) {
			return CameraIndexCodeMap[indexCode];
		},
		SetUserInterface : function(xmlStatus) {
			return this.ocxEl[0].SetUserInterface(xmlStatus);
		},
		SetPlayWndStateText : function(wIndex, info) {
			return this.ocxEl[0].SetPlayWndStateText(wIndex, info);
		},
		SetSearchResult : function(wIndex, isAppend, xmlStatus) {// isAppend:
																	// 是否追加，1表示追加，0表示重新设置
			return this.ocxEl[0].SetSearchResult(wIndex, isAppend, xmlStatus);
		},
		SetOccupied : function(wIndex, arg) {
			return this.ocxEl[0].SetOccupied(wIndex, arg);
		},
		StartPlayback : function(wIndex) {
			return this.ocxEl[0].StartPlayback(wIndex);
		},
		StopPlayback : function(wIndex) {
			return this.ocxEl[0].StopPlayback(wIndex);
		},
		SetToken : function(sId, token) {
			return this.ocxEl[0].SetToken(sId, token);
		},
		SetLocalParam : function(xmlParam) {
			return this.ocxEl[0].SetLocalParam(xmlParam);
		},
		OpenFolder : function(path) {
			return this.ocxEl[0].OpenFolder(path);
		},
		OpenFile : function(path, execFile, openType) {// 打开方式 0图片，1录像文件
			return this.ocxEl[0].OpenFile(path, execFile, openType);
		},
		SetLabelResult : function(wId, sId, xmlParam) {
			return this.ocxEl[0].SetLabelResult(sId, xmlParam);
		},
		SetLockResult : function(wId, sId, xmlParam) {
			return this.ocxEl[0].SetLockResult(wId, sId, xmlParam);
		},
		GetSelWnd : function() {
			return this.ocxEl[0].GetSelWnd();
		},
		GetWndNumber : function() {
			return this.ocxEl[0].GetWndNumber();
		},
		GetTimeSpan : function() {
			return this.ocxEl[0].GetTimeSpan();
		},
		SetLabelInfo : function(wIndex, xmlResult) {
			return this.ocxEl[0].SetLabelInfo(wIndex, xmlResult);
		},
		SetPreNextBtnState : function(bHasPrevious, bHasNext) {// 0-不可用 1-可用
			return this.ocxEl[0].SetPreNextBtnState(bHasPrevious, bHasNext);
		},
		SetSelWnd : function(wId) {
			return this.ocxEl[0].SetSelWnd(wId);
		},
		SetFitLayout : function(wNum) {
			return this.ocxEl[0].SetFitLayout(wNum);
		},
		ExitSectionPlay : function() {
			return this.ocxEl[0].ExitSectionPlay();
		},
		PlaySection : function(wIndex) {
			return this.ocxEl[0].PlaySection();
		},
		GetIdleWndIndex : function() {
			return this.ocxEl[0].GetIdleWndIndex();
		},
		SetPerformance : function(xml) {
			return this.ocxEl[0].SetPerformance(xml);
		},
		unregister : function() {
			// FIXME 这里需要根据控件的反注册方法来写
			// this.ocxEl[0].UnRegister();
		},
		register : function() {
			// TODO 这需要写入控件注册的逻辑
			// throw new Error('');
			return true;
		},
		getOcxUrl : function() {
			return pt.ctx + "/web/softs/HIKOCX.CAB";
		},
		GetDirectoryPath : function() {
			try {
				var result = this.ocxEl[0].GetDirectoryPath();
				if (result == 'null' || result == null) {
					return null;
				}
				if (result[result.length - 1] == '\\') {
					return result;
				}
				return result + '\\';
			} catch (e) {
				return null;
			}
		},
		GetSystemDrive : function() {
			try {
				return this.ocxEl[0].GetSystemDrive() + ':';
			} catch (e) {
				return "C:";
			}
		},
		GetUserDocument : function() {
			try {
				return this.ocxEl[0].GetUserDocument();
			} catch (e) {
				return "C:\\Program Data";
			}
		},
		SendUrl : function(xml) {
			try {
				return this.ocxEl[0].SendUrl(xml);
			} catch (e) {
				return false;
			}
		},
		checkFile : function (fileUrl) {
			var xmlhttp = null;
			if (window.XMLHttpRequest)
				xmlhttp=new XMLHttpRequest();
			else if (window.ActiveXObject)// code for IE5 and IE6
			    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			if (xmlhttp!=null){
			    xmlhttp.open("GET",fileUrl,false);
			    xmlhttp.send();
			    if (xmlhttp.readyState==4 && xmlhttp.status==404)
				   return false;//文件不存在
			}else
				jAlert("您的浏览器不支持XMLHTTP,检查文件失败!");
			return true;//检查失败，默认文件是存在的。
		},
		handleException : function(e) {
			var fileURL = this.getOcxUrl(); //文件路径（相对路径）
			var isExist  = this.checkFile(fileURL);
			var el = this.msgEl || this.el;
			if (this.ocxEl != null)
				this.ocxEl.hide();
			el.find('div[msgType="msg"]').remove();
			el.find('*').hide();
			if(isExist)
				el.append('<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt">' + '<span>控件异常！</span></div></div>');
			else{
				el.append('<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt">' + '<span>控件异常！</span>' + '<p>控件不存在，请联系管理员上传控件</p>' + '</div></div>');
			}
			if(isExist && (this.msgEl && this.msgEl.length>0)&&(typeof currentIsDialog == 'undefined'||currentIsDialog==false)){
				loader.show('最新控件正在加载中，请稍后...（加载失败请跳转到首页进行手动下载和安装）');
				setTimeout(function(){//转15秒钟后，自动隐藏
					loader.hide();
					jAlert('加载控件失败，请跳转到首页进行手动下载和安装。');
				}, 15000);
			}
			return false;
		}
	});
});