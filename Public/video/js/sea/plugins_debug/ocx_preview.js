define('./ocx_preview', [ './active_x' ], function(require, exports) {
	var Active_x = require('./active_x');
	var CameraIndexCodeMap = {};
	var CameraWIndexMap = {};
	return Active_x.extend({
		ocxNotInstall : false,
		params : null,
		constructor : function(opt) {
			this.base(opt, [ 'hikui-active' ], []);
		},
		checkFile : function (fileUrl) {
			var xmlhttp = null;
			if (window.XMLHttpRequest)
				xmlhttp=new XMLHttpRequest();
			else if (window.ActiveXObject)// code for IE5 and IE6
			    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			if (xmlhttp!=null){
			    xmlhttp.open("HEAD",fileUrl,false);
			    xmlhttp.send();
			    if (xmlhttp.readyState==4 && xmlhttp.status==404)
				   return false;//文件不存在
			}else
				jAlert(language.text('ocx.supportXmlHTTP'));
			return true;//检查失败，默认文件是存在的。
		},
		render : function() {
            if($.detectOS() === 'Linux')  {
                if(window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
                    this.base('application/hwp-webpreview-plugin');
                }else
                    return;
            }else{
                if($.browser.msie){
                    this.base('clsid:E55C9850-D54F-4DF2-A7B4-B8C3B687BE2F');
                }else{
                    this.base('application/hik-singlepreview-plugin');
                }

            }

            try {
                var href = location.href;
                if (href.indexOf('http://') == 0) {
                    href = href.substring(7);
                } else if (href.indexOf('https://') == 0) {
                    href = href.substring(8);
                }
                href = href.substring(0, href.indexOf('/'));
                var result = this.ocxEl[0].AddSecuriteZone(href);
                if ('false' == result || false == result) {
                    jAlert(language.text('ocx.trustedSite'));
                }
            } catch (e) {
            }
            this.ocxEl[0].StopPreview();

        },
		addIndexCodeMap : function(wIndex, xmlStatus, indexCode) {
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
		SetVagServerInfo : function(ip, port) {
			this.ocxEl[0].SetVagServerInfo(ip, port);
			},
		SetWindowId : function(lWndId) {
			this.ocxEl[0].SetWindowId(lWndId);
		},
		StartPreview : function(szPlayUrl) {
			this.ocxEl[0].StartPreview(szPlayUrl);
		},
		StartPreviewEx : function(szPlayUrl) {
			this.ocxEl[0].StartPreviewEx(szPlayUrl);
		},
		StopPreview : function() {
			this.ocxEl[0].StopPreview();
		},
		SetPerCfgInfo : function(xml) {
			this.ocxEl[0].SetPerCfgInfo(xml);
		},
		SetToolBar : function(xml) {
			this.ocxEl[0].SetToolBar(xml);
		},
		Set3DZoomMode : function(nMode) {// 0关闭 1开启
			this.ocxEl[0].Set3DZoomMode(nMode);
		},
		SetVideoParam : function(lBrightValue, lContrastValue, lSaturationValue, lHueValue) {
			this.ocxEl[0].SetVideoParam(lBrightValue, lContrastValue, lSaturationValue, lHueValue);
		},
		GetVideoParam : function() {
			return this.ocxEl[0].GetVideoParam();
		},
		SnapShot : function(nMode, nType) {
			this.ocxEl[0].SnapShot(nMode, nType);
		},
		StartRecord : function() {
			this.ocxEl[0].StartRecord();
		},
		OpenFolder : function(szFolder) {
			return this.ocxEl[0].OpenFolder(szFolder);
		},
		OpenFile : function(szFile, szExecFile, nMode) {
			return this.ocxEl[0].OpenFile(szFile, szExecFile, nMode);
		},
		SetRecordParam : function(szRecordParam) {
			this.ocxEl[0].SetRecordParam(szRecordParam);
		},
		SetSnapParam : function(szSnapParam) {
			this.ocxEl[0].SetSnapParam(szSnapParam);
		},
		SetOverLapMode : function(nMode) {
			this.ocxEl[0].SetSnapParam(nMode);
		},
		SetAutoSize : function(nMode) {// lAuto:1 自适应 0铺满
			this.ocxEl[0].SetAutoSize(nMode);
		},
		SetToken : function(lParam, token) {
			this.ocxEl[0].SetToken(lParam, token);
		},
		SetEncrypt : function(szCode) {
			this.ocxEl[0].SetEncrypt(szCode);
		},
		SetToolBarAlwaysShow : function(lShow) {
			this.ocxEl[0].SetToolBarAlwaysShow(lShow);
		},
		SetInstPlayCfg : function(lTimer) {
			this.ocxEl[0].SetInstPlayCfg(lTimer);
		},
		SetRightCode : function(szCode) {
			try {
				this.ocxEl[0].SetRightCode(szCode);
			} catch (e) {

			}
		},
		SetSnapMultiType : function(mode) {
			try {
				this.ocxEl[0].SetSnapMultiType(mode);
			} catch (e) {

			}
		},
		SetDecode : function(mode) {
			try {
				this.ocxEl[0].SetDecode(mode);
			} catch (e) {

			}
		},
		PlaySound : function(open) {
			try {
				this.ocxEl[0].PlaySound(open);
			} catch (e) {

			}
		},
		EnterFishEye : function() {
			try {
				this.ocxEl[0].EnterFishEye();
			} catch (e) {

			}
		},
		ExitFishEye : function() {
			try {
				this.ocxEl[0].ExitFishEye();
			} catch (e) {

			}
		},
		SetLayoutType : function(layout) {
			try {
				this.ocxEl[0].SetLayoutType(layout);
			} catch (e) {

			}
		},
		SetFishEyeParam : function(xml) {
			try {
				this.ocxEl[0].SetFishEyeParam(xml);
			} catch (e) {

			}
		},
		GetFishEyeParam : function() {
			try {
				return this.ocxEl[0].GetFishEyeParam();
			} catch (e) {

			}
		},
		GetVersion : function() {
			try {
				return this.ocxEl[0].GetVersion();
			} catch (e) {

			}
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
				return "c:";
			}
		},
		GetUserDocument : function() {
			try {
				return this.ocxEl[0].GetUserDocument();
			} catch (e) {
				return "C:\\Program Data";
			}
		},
		EnableMenu : function(value) {
			try {
				this.ocxEl[0].EnableMenu(value);
			} catch (e) {
			}
		},
		SetBarVisible : function(v) {
			try {
				this.ocxEl[0].SetBarVisible(v);
			} catch (e) {

			}
		},
		getOcxUrl : function() {
			return pt.ctx + "/web/softs/HIKOCX.CAB";
		},
		NotifyBSEvent : function(szInfo) {
			this.ocxEl[0].NotifyBSEvent(szInfo);
		},
		checkFile : function (fileUrl) {
			var xmlhttp = null;
			if (window.XMLHttpRequest)
				xmlhttp=new XMLHttpRequest();
			else if (window.ActiveXObject)// code for IE5 and IE6
			    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			if (xmlhttp!=null){
			    xmlhttp.open("HEAD",fileUrl,false);
			    xmlhttp.send();
			    if (xmlhttp.readyState==4 && xmlhttp.status==404)
				   return false;//文件不存在
			}else
				jAlert(language.text('ocx.supportXmlHTTP'));
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
				el.append('<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt"><span>'+language.text('ocx.unload')+'</span></div></div>');
			else{
				el.append('<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt"><span>'+language.text('ocx.unload')+'</span><p>'+language.text('ocx.nonExist')+'</p></div></div>');
			}
			if(isExist && (this.msgEl && this.msgEl.length>0)&&(typeof currentIsDialog == 'undefined'||currentIsDialog==false)){
				loader.show(language.text('ocx.loading'));
			}
			return false;
		}
	});
});
