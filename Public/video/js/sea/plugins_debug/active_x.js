define('./active_x', ['./component'], function(require, exports, module) {
	var Component = require('./component');

	var addTryCatch = function(obj, fun) {
		for (var key in obj) {// 每个方法增加try catch 并处理
			if (typeof(obj[key]) != 'function') {
				continue;
			}
			if (key == 'handleException') {
				continue;
			}
			obj[key] = _.wrap(obj[key], function(func) {
				try {
					return func.apply(obj, Array.prototype.slice.call(arguments, 1));
				} catch (e) {
					return fun.call(obj, e);
				}
			});
		}
	}

	var result = Component.extend({
		el : null,
		ocxEl : null,
		constructor : function(opts, cls, copy_el_array) {
			var no = opts.el.attr('id');
			if (no) {
				this.no = function() {
					return 'ocx_' + no;
				}
			}

			if (cls == null) {
				cls = ['hikui-active'];
			} else {
				cls.push('hikui-active');
			}
			addTryCatch(this, function(e) {
				if (this.handleException) {
					return this.handleException(e);
				}
				var el = this.msgEl || this.el;
				if (this.ocxEl != null)
					this.ocxEl.hide();
				el.find('div[msgType="msg"]').remove();
				el.find('*').hide();
				var array = ['<div class="msg-b msg-b-stop"><i></i><div class="msg-cnt">'];
				array.push('<span>' + language.text('ocx.error') +'</span>');
				if (this.getOcxUrl != null) {
					var ocxUrl = null;
					if (typeof(this.getOcxUrl) == 'function') {
						ocxUrl = this.getOcxUrl();
					} else if (typeof(this.getOcxUrl) == 'string') {
						ocxUrl = this.getOcxUrl;
					}
					if(this.id.indexOf('swf_schedule') > - 1){
						array.push('<p>');
                        array.push( language.text('flash.error') );
						array.push('</p>');
					}else{
						if (ocxUrl != null) {
							array.push('<p>');
                            array.push(language.text('ocx.load'));
							array.push('</p>');
						}
					}
					
				}
				array.push('</div></div>');
				el.append(array.join(''));
				return false;
			});
			this.base(opts, cls, copy_el_array);
		},
		render : function(classId,ctx) {
            if (loader) {
                loader.change = function (that) {
                    if (that.readyState == 4 && loader) {
                        loader.hide();
                        delete loader.change;
                    }
                }
            }
            if($.browser.msie)
                this.ocxEl = this.el.find('object');
            else
                this.ocxEl = this.el.find('embed');
            if (this.ocxEl.length) {
                return;
            }
            var array = ['<object classid="', classId, '" width="100%" onreadystatechange="loader.change(this)" height="100%" id="', this.no(), '" name="', this.no(),
                '"'];
            if (this.codebase) {
                array.push(['CODEBASE="', ctx || '', '/web/softs/HIKOCX.CAB#version=', this.codebase, '"'].join(""));
            }
            array.push(' >');
            if (this.params) {
                $.each(this.params, function (name, value) {
                    array.push('<param name="');
                    array.push(name);
                    array.push('" value="');
                    array.push(value);
                    array.push('">');
                })
            }

            var ind =  this.no().split('_'),len = ind.length;
            array.push(['<embed type="'+ classId+ '" width="100%" height="100%" onreadystatechange="loader.change(this)" id="embed_'+ this.no()+ '" name="'+ this.no()+ '"windowid="' + ind[len-1] +
                '"']);
            array.push('>');
            array.push('</object>');
            this.el.html(array.join(''));
            if($.browser.msie)
                this.ocxEl = this.el.find('object');
            else
                this.ocxEl = this.el.find('embed');
        },
		throwError : function(error) {
			throw new Error(error);
		},
		destroy : function() {
			if (this.ocxEl != null) {
				this.ocxEl.hide();
				this.ocxEl.remove();
			}
			// $('script[eventNo="' + this.no() + '"]').remove();
			this.base();
		}
	});
	result.BASE_URL = Component.BASE_URL;
	return result;
});
