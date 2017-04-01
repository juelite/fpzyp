define('./ocx_playback_alarmcenter', ['./ocx_playback'], function(require, exports) {
	var Ocx_playback = require('./ocx_playback');

	return Ocx_playback.extend({
		ocxNotInstall : false,
		constructor : function(opt) {
			this.base(opt, ['hikui-active'], []);
		},
		render : function() {
			this.base('clsid:D4E11A6C-245F-48FB-9D02-8C53C0AB10F6');
			// this.ocxEl[0].StopPlayback();
			this.keepLive();
		},
		throwError : function(error) {
			throw new Error(error);
		},
		SetBasicInfo : function(wIndex, xmlStatus) {
			return this.ocxEl[0].SetBasicInfo(xmlStatus);
		},
		SetPreNextBtnState : function(bHasPrevious, bHasNext) {
			return this.ocxEl[0].SetPreNextBtnState(bHasPrevious, bHasNext);
		},
		SetSearchState : function(wIndex, state, errorCode) {
			return this.ocxEl[0].SetPlayWndStateText(state + errorCode + '');
		},
		SetSearchResult : function(wIndex, isAppend, xmlStatus) {// isAppend: 是否追加，1表示追加，0表示重新设置
			return this.ocxEl[0].SetSearchResult(isAppend, xmlStatus);
		},
		StartPlayback : function(wIndex) {
			return this.ocxEl[0].StartPlayback();
		},
		StopPlayback : function(wIndex) {
			return this.ocxEl[0].StopPlayback();
		},
		setWindowStatus : function(state, errorCode, isOK) {
			if (isOK !== true) {
				this.trigger("MsgNotify", 0x99000015);
			}
			return this.SetSearchState(0, state, errorCode);
		},
		startPlayback : function(wIndex) {
			return this.StartPlayback(0);
		},
		keepLive : function() {
			var keepLive = function() {
				$.ajax({
					url : 'keepLive.action',
					type : 'POST',
					dataType : "json"
				});
			}
			setInterval(keepLive, 15 * 60 * 1000);
		},
		setResult : function(wIndex, items) {
			var xmlArr = [];
			var manufacturer = 'HIKPlay';
			xmlArr.push('<?xml version="1.0" encoding="UTF-8" ?>');
			xmlArr.push(' <SegmentList>');
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.manufacturer) {
					manufacturer = item.manufacturer;
				}
				xmlArr.push('<RecordSegment>');
				xmlArr.push('<BeginTime>');
				xmlArr.push(item.beginTime);
				xmlArr.push('</BeginTime>');
				xmlArr.push('<EndTime>');
				xmlArr.push(item.endTime);
				xmlArr.push('</EndTime>');
				xmlArr.push('<RecordType>');
				xmlArr.push(item.recordType);
				xmlArr.push('</RecordType>');
				xmlArr.push('<MediaDataLen>');
				xmlArr.push(item.mediaDataLen);
				xmlArr.push('</MediaDataLen>');
				xmlArr.push('<IsLocked>');
				xmlArr.push(item.isLocked);
				xmlArr.push('</IsLocked>');
				xmlArr.push('<PlayURL>');
				xmlArr.push(item.playURL);
				xmlArr.push('</PlayURL>');
				xmlArr.push('</RecordSegment>');
			}
			xmlArr.push('</SegmentList>');
			this.SetSearchResult(0, manufacturer, xmlArr.join(''));
		},
		startPlay : function(cameraId, startTime, stopTime, name) {
			this.cameraId = cameraId;
			this.StopPlayback();
			// var cameraId = 8008;
			// startTime ='2013-06-14T00:00:00.000Z';
			// stopTime = '2013-06-14T23:59:59.000Z';
			var _self = this;
			var xmlArr = [];
			xmlArr.push('<?xml version="1.0" encoding="UTF-8" ?>');
			xmlArr.push('<PlaybackBasicInfo>');
			xmlArr.push('<CameraID>' + cameraId + '</CameraID>');
			xmlArr.push('<CameraName>' + name + '</CameraName>');
			xmlArr.push('<BeginTime>' + startTime + '</BeginTime>');
			xmlArr.push('<EndTime>' + stopTime + '</EndTime>');
			xmlArr.push('</PlaybackBasicInfo>');
			_self.SetBasicInfo(0, xmlArr.join(''));
			_self.setWindowStatus('', "正在搜索录像", true);
			$.ajax({
				url : 'queryVideoRecord.action',
				type : 'POST',
				data : {
					selectedIds : cameraId,
					recordType : '4',// 4
					startTime : startTime,
					endTime : stopTime
				},
				dataType : "json",
				success : function(result) {
					if (_self.cameraId != cameraId) {
						return;
					}
					if (result.success && result.ret == 1) {
						if (result.recordItems && result.recordItems.length > 0) {
							var record = result.recordItems[0];
							if (record.status != '200') {
								_self.setWindowStatus('', "查询录像失败");
							} else if (record.total == 0) {
								_self.setWindowStatus('', "无录像文件");
							} else {
								_self.setWindowStatus('', "开始播放录像", true);
								_self.setResult(0, result.recordItems);
								_self.startPlayback(0);
							}
						} else {
							_self.setWindowStatus(0, "查询录像失败");
						}
					} else {
						$.sticky('查询录像失败!', {
							type : "error"
						});
					}
				}
			});

		},
		initLocalParam : function() {
			var callbackItem = [];
			callbackItem.push('<?xml version="1.0" encoding="UTF-8" ?>');
			callbackItem.push('<PlaybackOcxConfig>');
			var decoding = $.commonCookie("ocx-setting-replay-decoding");
			if (!decoding) {
				decoding = 0;
			}
			callbackItem.push('<DecodeEffect>' + decoding + '</DecodeEffect>');
			callbackItem.push('<WindowToolbar>');
			var isShow = $.commonCookie("ocx-setting-playback-bar-isshow");
			if (isShow != 1) {
				isShow = 0;
			}
			callbackItem.push('<ShowMode>' + isShow + '</ShowMode>');
			callbackItem.push('<ShowItems>');
			var funs = $.commonCookie("ocx-setting-playback-btn");
			var isInit = $.commonCookie("ocx-setting-playback-init");
			var fun = [];
			if(!isInit){
				fun = [5,7,12,13,17];
			}else if (funs) {
				fun = funs.split(',');
				if (!fun || fun.length < 1) {
					fun = [];
				}
			}
			for (var i = 0; i < fun.length; i++) {
				callbackItem.push('<BtnItem>' + fun[i] + '</BtnItem>');
			}
			callbackItem.push('</ShowItems>');
			callbackItem.push('</WindowToolbar>');

			callbackItem.push('<SnapParam>');
			var captureFormat = $.commonCookie("ocx-setting-capture-format");
			if (!captureFormat) {
				captureFormat = "0";
			} else if (captureFormat == 'BMP') {
				captureFormat = "1";
			} else {
				captureFormat = "0";
			}

			var mode = 2;
			var snapTimes = 3;
			var timeSpan = 1000;
			var splitValue = $.commonCookie("ocx-setting-capture-time");
			if (splitValue) {
				splitValue = splitValue.split(',');
				if (splitValue && splitValue.length == 2) {
					mode = 1;
					timeSpan = splitValue[1] * 1000;
				} else {
					mode = 2;
				}
			}

			 var captureCountValue = $.commonCookie("ocx-setting-capture-count");
				if(captureCountValue){
					snapTimes = captureCountValue;
				}
			 
			 var videoFileName = $.commonCookie('ocx-setting-capture-file');
			if(!videoFileName){
				videoFileName="";
			}
			
			var captureSavePath = $.commonCookie("ocx-setting-capture-path");
			if (!captureSavePath){
				var path = this.GetSystemDrive();
				captureSavePath = path+"\\Program Data\\capture";//"C:\\Hikvision\\capture\\";
			}
			captureSavePath = captureSavePath.replace(/&/g, '&amp;');
			callbackItem.push('<FileFormat>' + captureFormat + '</FileFormat>');
			callbackItem.push('<FilePath>' + captureSavePath + '</FilePath>');
			callbackItem.push('<FileCategorization>' + 0 + '</FileCategorization>');
			callbackItem.push('<FileNameFormat>' + videoFileName + '</FileNameFormat>');
			callbackItem.push('<SnapMode>' + 2 + '</SnapMode>');
			callbackItem.push('<ContinousNum>' + snapTimes + '</ContinousNum>');
			callbackItem.push('<ContinousMode>' + mode + '</ContinousMode>');
			callbackItem.push('<ContinousInterval>' + timeSpan + '</ContinousInterval>');
			callbackItem.push('</SnapParam>');
			
			callbackItem.push('<DiskWarning>');
			callbackItem.push('<EnableDiskWarning>' + 0 + '</EnableDiskWarning>');
			callbackItem.push('<WarningSpace>' + 500 + '</WarningSpace>');
			callbackItem.push('<MinimumSpace>' + 100 + '</MinimumSpace>');
			callbackItem.push('</DiskWarning>');
			callbackItem.push('</PlaybackOcxConfig>');
			this.SetLocalParam(callbackItem.join(''));
		}
	});
});