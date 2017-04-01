define('./ocx_download', [ './active_x' ], function(require, exports) {
	var Active_x = require('./active_x');

	return Active_x.extend({
		ocxNotInstall : false,
		constructor : function(opt) {
			this.base(opt, [ 'hikui-active' ], []);
		},
		render : function(clsid) {
			if (clsid) {
				this.base(clsid);
			} else {
				this.base('clsid:7374A018-7393-431E-9F1F-E9CD0C9F50FB');
				this.ocxEl[0].ClearResult();
			}
		},
		throwError : function(error) {
			throw new Error(error);
		},
		SetStartEndTime : function(startTime, endTime) {
			this.ocxEl[0].SetStartEndTime(startTime, endTime);
		},
		SetCamlist : function(camlist) {
			this.ocxEl[0].SetCamlist(camlist);
		},
		UpdateResult : function(result, camId) {
			this.ocxEl[0].UpdateResult(result, camId);
		},
		ClearResult : function() {
			this.ocxEl[0].ClearResult();
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
		handleException : function(e) {
			var el = this.msgEl || this.el;
			if (this.ocxEl != null)
				this.ocxEl.hide();
			el.find('div[msgType="msg"]').remove();
			el.find('*').hide();
			el.append('<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt">' + '<span>'+language.text('ocx.error')+'</span>' + '<p>'+language.text('ocx.load')+'</p>' + '</div></div>');
			return false;
		}
	});
});