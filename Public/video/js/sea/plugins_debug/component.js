define('./component', [], function(require, exports, module) {
	var NO = 1;
	var url = module.id;
	var base_url = url.substring(0, url.lastIndexOf("/"));

	var result = Base.extend({
		vision : 'V6',
		el : null,
		constructor : function(opts, cls, copy_el_array) {
			if (!opts.el || opts.el.length < 1) {
				throw new Error('hikui:none el');
			}
			this.no || (this.no = function() {
				var no = null;
				return function() {
					if (no)
						return no;
					no = '_hik_' + (NO++) + '_';
					return no;
				}
			}());
			if (typeof cls == 'string') {
				opts.el.addClass(cls);
			} else if (typeof cls == 'object') {
				for (var index = 0; index < cls.length; index++) {
					opts.el.addClass(cls[index]);
				}
			}

			$.hikui.map[this.no()] = this;
			opts.el.attr('hikmap', this.no());
			this.el = opts.el;
			if (copy_el_array) {
				for (var i = 0, length = copy_el_array.length; i < length; i++) {
					var name = copy_el_array[i];
					var type = null;
					if (typeof name == 'object') {
						type = name.type;
						name = name.name;
					}
					var value = this.el.attr(name);
					if ('ajax' != type && value == null) {
						continue;
					}
					if (type == 'boolean') {
						if (value == 'true') {
							this[name] = true;
						} else if (value == 'false') {
							this[name] = false;
						}
					} else if ('ajax' == type) {
						var tempName = null;
						if ('ajax' == name) {
							tempName = '';
						} else if (name.indexOf('Ajax') == (name.length - 4)) {
							tempName = name.substring(0, name.length - 4);
						}
						var url = this.el.attr((tempName == '' ? '' : tempName + '-') + 'url');
						if (url != null) {
							this[name] = {
								url : url,
								type : this.el.attr((tempName == '' ? '' : tempName + '-') + 'mothod')
							}
						}
					} else if (type == 'int') {
						this[name] = parseInt(value);
					} else if (value != null) {
						this[name] = value;
					}
				}
			}
			$.extend(this, opts);
			this.listeners = opts.listeners;
			this.handleListeners();
			this.beforeRender && this.beforeRender();
			this.render();
			var self = this;
			this._destroy = function() {
				self.destroy();
			};
			$.hikui.bind('unload', this._destroy);
			this.el.trigger('create', this);
			this.trigger('create', this);
		},
		destroy : function() {
			if (!this.el.attr('destroying')) {
//				this.el.destroy();
//				return;
			}
			this.trigger('destroy');
			$.hikui.unbind('unload', this._destroy);
			$.hikui.map[this.no] = null;
			delete $.hikui.map[this.no];
			for (var name in this) {
				this[name] = null;
				delete this[name];
			}
		},
		getResult : function(data, resultMap, defaultValue) {
			if (resultMap == null) {
				return data == null ? defaultValue : data;
			}
			var mapList = resultMap.split('.');
			var result = data;
			for (var index = 0; index < mapList.length; index++) {
				if (result == null)
					return defaultValue;
				result = result[mapList[index]];
			}
			return result == null ? defaultValue : result;
		},
		call : function(callBack) {
			return callBack.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}).extend(hik.events);
	result.BASE_URL = base_url;
	result.body = $('body');
	result.window = $(window);
	result.doc = $(document);
	return result;
});
