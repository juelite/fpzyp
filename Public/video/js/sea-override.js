(function() {
    var p = '', tp = '.', lp = '.', cp = '.', ltp = '.';

    if(typeof pt == 'undefined'){
        pt = {
            debug : false,
            ctx : '',
            lang : 'zh_cn'
        }
    }
    if (pt.debug == 'true') {
        p = '_debug';
    }

    seajs.config({
        base : pt.ctx + '/',
        alias : {
            '{web}' : 'web',
            '{hikui}' : '/Public/video/js/sea/plugins' + p
        }
    });

}());

(function($) {
    $.hikui = $.hikui || {};
    $.hikui.map = {};
    var hik = function(o) {// 在页面加载前，被回调的函数可以载人，供加载并解析完后进行回调处理。
        return new hik.fn.init(o);
    };
    window.hik = hik;
    hik.fn = hik.prototype = {
        init : function(o) {
            var selector;
            if (typeof o === "string") {
                selector = $(o);
            } else if (o.selector == null) {
                selector = $(o);
            } else {
                selector = o;
            }
            this.context = selector;
            return this;
        }
    };
    hik.fn.init.prototype = hik.fn;
    hik.call = function() {// 回调处理，这段代码没用使用
        for ( var i = 0, l = array.length; i < l; i++) {
            array[i].apply(null, arguments);
            array[i] = null;
        }
        array.length = 0;
        array = [];
    };

    hik.events = {// 事件处理机制
        _callbacks : null,
        bind : function(ev, callback) {
            var calls = this._callbacks || (this._callbacks = {});
            var list = this._callbacks[ev] || (this._callbacks[ev] = []);
            list.push(callback);
            return this;
        },
        unbind : function(ev, callback) {
            var calls;
            if (!ev) {
                this._callbacks = {};
            } else if (calls = this._callbacks) {
                if (!callback) {
                    calls[ev] = [];
                } else {
                    var list = calls[ev];
                    if (!list)
                        return this;
                    for ( var i = 0, l = list.length; i < l; i++) {
                        if (callback === list[i]) {
                            list.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            return this;
        },
        unbindAll : function() {
            for ( var callbakes in this._callbacks) {
                for ( var callback in callbakes) {
                    callbakes[callback] = null;
                    delete callbakes[callback];
                }
                callbakes = null;
                delete callbakes;
            }
        },
        trigger : function(ev) {
            var list, calls, i, l, result = true;
            if (!(calls = this._callbacks))
                return result;
            if (list = calls[ev]) {
                for (i = list.length - 1; i > -1; i--) {
                    var r = list[i].apply(this, Array.prototype.slice.call(arguments, 1));
                    result = result && r == false ? false : true;
                }
            }
            if (list = calls['all']) {
                for (i = 0, l = list.length; i < l; i++) {
                    var r = list[i].apply(this, arguments);
                    result = result && r == false ? false : true;
                }
            }
            return result;
        },
        _handleBefore : function(funName, fun) {
            var self = this;
            return _.wrap(fun, function(func) {
                var argArray = Array.prototype.slice.call(arguments, 1);
                if (self.trigger.apply(self, [ 'before' + funName ].concat(argArray))) {
                    func.apply(this, argArray);
                }
                argArray = null;
            });
        },
        handleListeners : function() {// 处理监听器
            if (!(this.listeners instanceof Object)) {
                return;
            }
            for ( var key in this.listeners) {
                this.bind(key, this.listeners[key]);
                this.listeners[key] = null;
            }
            this.listeners = null;
        }
    };
    hik.argHandle = function(objs, array) {// 页面的参数处理
        if (typeof array[0] == 'object')
            return array[0];
        for ( var i = 0, l = objs.length; i < l; i++) {
            var obj = objs[i];
            var type0 = typeof array[0];
            if (type0 == obj.type || obj.type.indexOf(type0) > -1) {
                var o = {}, args = obj.args;
                for ( var j = 0, length = args.length; j < length; j++) {
                    o[args[j]] = array[j];
                }
                return o;
            }
        }
        return {};
    };
    $.extend($.hikui, hik.events);
    function destroy() {
        try {
            $.hikui.trigger('unload');
            $.hikui.unbindAll();
        } catch (e) {
        }
    }
    $(window).bind('unload', destroy);
    var modules = {
        swf_schedule : {},
        ocx_preview : {},
        ocx_playback : {},
        ocx_download : {},
        ocx_playback_alarmcenter : {},
        ocx_draw : {},
        calendar : {},
        pdTangram:{},
        ocx_kmsfileupload:{}
    };
    function hikloader(modules) {
        var plugins = [];
        for ( var v in modules) {
            modules[v].auto != false && plugins.push('[hikui=' + v + ']');
            hik.fn[v] = function() {
                var cv = v, url = (modules[v].alias || '{hikui}/') + (modules[v].js || v);
                return function(opt) {
                    var self = this;
                    seajs.use(url, function(C) {
                        var o = opt || {};
                        o.el = self.context;
                        new C(o);
                    });
                    return this.context;
                };
            }();
        }
        return plugins.join(',');
    }
    var hikPlugins = hikloader(modules);
    $._parser = {
        auto : true,
        add : function(alias, obj) {
            seajs.config({
                alias : alias
            });
            $.extend(modules, obj);
            hikPlugins = hikPlugins + "," + hikloader(obj);
        },
        parse : function() {
            if (!$._parser.auto)
                return;
            $(hikPlugins).each(function() {
                hik(this)[this.getAttribute('hikui')]();
            });
        }
    };
    $.parser = $.parser||{};
    $.parser.add=function(alias, obj){
        $._parser.add(alias, obj);
    };
    $(function() {
        $._parser.parse();
    });
})(jQuery);
