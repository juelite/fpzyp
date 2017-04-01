/**
 * Created with JetBrains WebStorm.
 * User: yangyu3
 * Date: 14-12-1
 * Time: 上午10:26
 * To change this template use File | Settings | File Templates.
 */
/**
 * 模块管理
 */
var _model = (function () {
    var global = {
        VERSION: '0.0.1'
    },
    issuper = /xyz/.test(function () {
        var xyz
    }) ? /_super/ : /.*/,
    hasOwn = Object.prototype.hasOwnProperty,
    storage;

    function Class() {}
    Class.prototype = {
        batch: function (reg) {
            for (var i in this) {
                if (hasOwn.call(this, i) && reg.test(i)) {
                    this[i].call(this);
                }
            }
        },
        setOptions: function (obj) {
            if (typeof obj == 'object' && this.options) {
                $.extend(true, this.options, obj);
            }
            return this;
        },
        getmodel: function (name) {
            if (hasOwn.call(this, name)) {
                return this[name]
            }
        },
        addmodel: function (names, iscreate) {
            var names = names.split('.'),
                model = this,
                name;

            for (var i=0; name=names[i]; i++) {
                model = model.getmodel(name);

                if (!model) {
                    if (iscreate === false) {
                        return ;
                    }
                    model = this[name] = new Class();
                }
            }
            return model;
        }
    };
    storage = new Class();

    function mixin(sub, sup) {
        for (var name in sup) {
          if (hasOwn.call(sup, name)) {
              sub[name] = (typeof sup[name] === 'function' && typeof sub[name] == 'function' && issuper.test(sup[name]))
                          ? (function (i, supfn, subfn) {
                                return function () {
                                    var tmp = this._super,
                                        ret;

                                    this._super = subfn;
                                    ret = supfn.apply(this, arguments);
                                    this._super = tmp;
                                    return ret;
                                }
                          })(name, sup[name], sub[name]) : sup[name];
          }
        }
    }

    function define () {
        var args = Array.prototype.slice.call(arguments),
            callback = args.pop(),
            names = args.shift(),
            depences = typeof args[0] === 'string' ? args : args[0] || [],
            model = storage.addmodel(names),
            params = [model],
            i = 0, len = depences.length, depence, rmodel;

        for (; i < len; i++) {
            depence = depences[i];
            params.push(storage.addmodel(depence, false));
        }

        if (typeof callback === 'function') {
            rmodel = callback.apply(null, params);

            if (rmodel) {
                mixin(model, rmodel)
            }
        } else {
            mixin(model, callback);
        }

        if (!model.__initialize) {
            eventsManage.make(model);
            model.__initialize = true;
        }

        if (model.domready && !model.__domready) {
            $(function () {model.domready();})
            model.__domready = true;
        }

        if (model.init) {
            model.init();
        }
        return model;
    }

    function require(name) {
        return storage.addmodel(name, false);
    }

    return {
        define: define,
        require: require
    }
}());

var eventsManage = (function () {
    return {
        _events: $({}),
        bind: function (type, handler, context) {
            handler = context ? $.proxy(handler, context) : handler;
            this._events.bind(type, handler);
        },
        trigger: function (name) {
            var param = Array.prototype.slice.call(arguments, 1);
            return this._events.trigger(name, param);
        },
        unbind: function (name, handler) {
            this._events.unbind(name, handler);
        },
        make: function (obj) {
            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    obj[i] = this[i];
                }
            }
            obj._events = $({});
        }
    };
})();

/**
 * changelog:
 * 15.2.10 Class增加setOptions, model初始化为Subject
 */





























































