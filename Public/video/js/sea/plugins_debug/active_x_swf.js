define('./active_x_swf', ['./active_x', './active_x_swf/swfobject'], function(require, exports, module) {
	var Xctive_x = require('./active_x');// ,
	var swfobject = require('./active_x_swf/swfobject');

	var result = Xctive_x.extend({
		destroy : function() {
			$('#_flash_' + this.id).remove();
			this.base();
		},
		findSWF : function() {
			return window['_flash_' + this.id] || document['_flash_' + this.id];
		},
		getOcxUrl : function() {
			return result.SWF_URL + '/install_flash_player_10_active_x.exe';
		},
		render : function(flash_url) {
			this.el.html(Xctive_x.ACTIVE_DOWN_HTML);
			this.width = this.width || this.el.width();
			this.height = this.height || this.el.height();
			if (!this.el.attr('id')) {
				this.el.attr('id', 'schedule' + this.no());
			}
			this.id = this.el.attr('id');
			this.flashvars = $.extend({
//				"width" : this.width,
//				"height" : this.height,
				'id' : "$.hikui.map." + this.no()
			}, this.flashvars);
			this.params = $.extend({
				wmode : "Opaque",
				salign : "l",
				AllowScriptAccess : "always"
			}, this.params);
			this.attributes = $.extend({}, this.attributes);
			this.el.html('<div id="_flash_' + this.id + '"></div>');
			swfobject.embedSWF(flash_url, '_flash_' + this.id, this.width, this.height, "9.0.0", "expressInstall.swf",
					this.flashvars, this.params, this.attributes);
			this.ocxEl = $('#_flash_' + this.id);
		}
	});

	result.BASE_URL = Xctive_x.BASE_URL;
	result.SWF_URL = Xctive_x.BASE_URL + '/../swf';
	return result;
});
