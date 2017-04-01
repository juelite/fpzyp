/**
 * @fileOverview 表单验证控件
 * @description
 * 表单验证控件
 */
(function () {

    /**
     * @class
     * @description 用户表单提交统一处理的方法
     * @example
     *
     * $('form').ajaxForm();
     * */
    $.fn.ajaxForm = function (options) {
        var subForm = $.data(this[0], 'subForm');

        if (subForm) {
            return this;
        }
        this.data('subForm', new ajaxForm(options, this));
        return this;
    };

    $.ajaxForm = {
        /**
         * @lends $.fn.ajaxForm
         * @property {boolean} validate 是否需要验证，默认true
         * @property {boolean} ajaxSubmit 是否需要提交
         * @property {object} ajaxopts 配置ajax的参数
         */
        defaults: {
            validate: true,
            ajaxSubmit: true,
            ajaxopts: {
                type: 'POST',
                dataType: 'json'
            }
        }
    };

    function ajaxForm(options, content) {
        this.content = content;
        this.settings = $.extend(true, {}, $.ajaxForm.defaults, options);
        if (this.content.is('form')) {
            this.form = this.content;
        } else {
            this.form = this.content.closet('form');
        }
        this.init();
    }

    ajaxForm.prototype = {
        bindSubmit: function () {
            var that = this,
                settings = this.settings;

            this.form.bind('submit.ajaxForm', function (event) {
                var ret;

                if (that.form.data('ajaxsubmiting') != true) {
                    if (that.form.trigger('beforeSubmit', that.form) !== false) {
                        if (settings.validate) {
                            that.form.trigger('validate.valid', [
                                function (val) {
                                    ret = val
                                },
                                true
                            ]);
                            if (ret) {
                                return that.subform();
                            }
                            return false;
                        } else {
                            return that.subform();
                        }
                    }
                }
                return false
            })
        },
        subform: function () {
            var that = this,
                isajax = this.settings.ajaxSubmit == true,
                ajaxopt = this.settings.ajaxopts, now = $.now(), success, error;

            if (isajax) {
                this.form.data('ajaxsubmiting', true);

                success = ajaxopt.success ? ajaxopt.success : function () {};
                error = ajaxopt.error ? ajaxopt.error : function () {};
                ajaxopt = $.extend({}, this.settings.ajaxopts, {
                    url: this.form.attr('action'),
                    type: this.form.attr('method'),
                    data: this.form.serializeArray(),
                    success: function (data) {
                        this.form.removeData('ajaxsubmiting');
                        success.call(that.form, data, that.form);
                    },
                    error: function (data) {
                        that.form.removeData('ajaxsubmiting');
                        error.call(that.form, data, that.form)
                    }
                });

                ajaxopt.url += (!~ajaxopt.url.indexOf('?') ? '?' : '&') + '_time=' + now;
                $.ajax(ajaxopt);
                return false;
            }
            return true;
        },
        init: function () {
            var that = this,
                validate;

            this.btnSub = this.form.find('[type="submit"]');
            this.btnSub.bind('click', function () {
                var elem = $(this);
                /**
                 * 当btnSub为以下两种情况时停止提交
                 */
                if (elem.data('disable') == 'disable' || elem.attr('disable') == 'disable') {
                    return false;
                } else {
                    that.form.submit();
                }
            });
            if (validate = this.settings.validate) {
                if (!$.isPlainObject(validate)) {
                    validate = {}
                }
                validate.bindSubmit = false;
                this.form.valid(validate, this.form);
            }
            this.bindSubmit();
        }
    };

    function validate(options, elem) {
        this.settings = $.extend(true, {}, $.valid.defaults, options);
        this.content = elem;
        this.init();
        return this;
    }

    var tips = (function () {
        function getTargetAttr(target) {
            var pos = target.position();
            return {
                width: target.outerWidth(),
                height: target.outerHeight(),
                left: pos.left,
                top: pos.top
            }
        }
        // 显示类型
        var showType = {
            tip: function (elem, data) {
                var target = data.target;
                target.parent().css('position', 'relative');

                var tarPos = getTargetAttr(target),
                    pos = data.position || 'topLeft',
                    width = elem.outerWidth(),
                    height = elem.outerHeight(),
                    left, top;

                switch (pos) {
                    case 'topLeft':
                    default :
                        left = tarPos.left;
                        top = tarPos.top - height - 3;
                        elem.css('max-width', tarPos.width);
                        break;
                }
                elem.find()
                elem.addClass(data.type)
                    .css({
                        left: left,
                        top: top,
                        position: 'absolute'
                    }).show()
            }
        };
        return {
            show: function (elem) {
                var data = elem.data('tips'),
                    type = data.type;
                showType[type](elem, data);
            }
        }
    }());

    $.fn.extend({
        valid: function (options) {
            var fn,valid = $.data(this[0], 'valid');
            if (valid) {
                if(typeof options == 'string'){
                    fn = valid[options];
                    if(!fn){
                        throw new Error('Valid has no Function: ' + options);
                    }else{
                        fn.call(valid,this);
                    }
                }
                return this;
            }
            this.data('valid', new validate(options, this));
            return this;
        },

        rules: function () {
            var rules = this.data('rules'),
                elem, settings, setRules,name;
            if (rules) {
                return rules;
            } else {
                elem = this.get(0);
                name = elem.name;
                setRules = $.data(elem.form ? elem.form : this.closest('form'), 'valid').settings.rules[name];
                rules = {};
                $.extend(true, rules, setRules, $.valid.getElementRules(this));
                this.data('rules', rules);
                return rules;
            }
        }
    });

    $.valid = {
        defaults: {
            errorClass: 'error',
            validClass: 'valid',
            successClass : 'success',
            infoClass: 'info',
            errorElement: 'label',
            infoElement: 'label',
            successElement: 'label',
            iskeyup: false,
            bindSubmit: true,
            errorContainer: $([]),
            isinfo: true,
            validateTag: 'input, textarea, select',
            notvalidateTag: '.notvalidate,[type=submit]',
            rules: {},
            message: {},
            focusClean: true,
            
            onfocusin: function (element, event) {
                var setts = this.settings,isTip = element.attr('tips');

                if (setts.focusClean) {
                    setts.unhighlight(element, setts.errorClass, setts.validClass);
                }

                if (setts.isinfo) {
                    var info = this.getInfo(element);
                    var label = this.createLabel(element, info, 'info');
                    this.showInfo(element,isTip);
                }
            },

            onfocusout: function (element, event) {
                this.execute(element);
            },

            onkeyup: function (element, event) {
                var setts = this.settings;
                if (setts.iskeyup) {
                    this.element(element, event);
                }
            },

            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
            },

            highlight: function (element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
            }
        },
        parseStr: function () {
            var str = (typeof arguments[0] == 'function') ? arguments[0]() : arguments[0] ,
                arg = Array.prototype.slice.call(arguments, 1);

            return str.replace(/{(\d+)}/g, function (m, i) {
                return arg[i];
            });
        },
        getElementRules: function (element) {
            var rules = {},
                mthods = $.valid.method,
                vtype = element.attr('vtype'),
                len = 0,
                val;

            if(vtype){
                vtype = vtype.split(',');
                len = vtype.length;
            }
            for (var i=0; i < len; i++) {
                if (vtype[i] in mthods) {
                    rules[vtype[i]] = element.attr(vtype[i]) || true;
                }
            }
            return rules;
        },
        addMethod: function (vtype) {
            $.valid.method[name] = vtype;
        },
        method: $.extend(true, {}, $.vtype || {}, {
        })
    };

    $.validate = validate.prototype = {
        init: function () {
            var that = this,
                content = this.content;

            this.errorContext = $(this.content);
            this.pending = {};
            this.pendingRequest = 0;
            this.reset();
            this.interface = {};

            var delegate = function (event) {
                var eventType = 'on' + event.type,
                    valid = that;

                if (valid.settings[eventType]) {
                    valid.settings[eventType].call(valid, this, event)
                }
            };

            var handler = function (event, callback) {
                var valid = that,
                    ret = true;
                if (valid.execute()) {
                    if (valid.pendingRequest !== 0) {
                        ret = false;
                    }
                } else {
                    ret = false;
                }
                callback && callback(ret);
            };
            this.validDelegate(this.settings.validateTag, 'focusin focusout', delegate);
            this.content.bind('validate.valid', function (event, callback, issubmit) {
                that.formSubmited = issubmit ? true : false;
                handler(event, callback);
            });

            if (this.settings.bindSubmit) {
                this.content.bind('submit.valid', function (event) {
                    var elem = $(this),
                        ret;
                    event.preventDefault()
                    elem.trigger('validate.valid', [
                        function (check) {
                            ret = check
                        },
                        true
                    ]);
                    return ret;
                });
            }
        },

        reset: function () {
            this.errorList = [];
            this.errorMap = {};
            this.currentElements = $([]);
        },

        validDelegate: function (delegate, type, handle) {
            var that = this;
            return this.content.bind(type, function (event) {

                var target = $(event.target);
                if (!target.is(that.settings.notvalidateTag)  && target.is(delegate)) {
                    handle.call(target, event)
                }
            })
        },
        getLabel: function (element, type) {
            return element.siblings('#tooltip.'+type);
        },

        check: function (element) {
            var rules = element.rules(),
                value = this.getValue(element),
                result;
            if (value || ('required' in rules)) {
                for (var key in rules) {
                    var rule = {
                        method: key,
                        param: rules[key]
                    };

                    try {
                        result = $.valid.method[key].valid.call(this, value, rules[key], element, this.startRequest, this.stopRequest);
                        if (result == 'ajax') {
                            return true;
                        }
                        if (result != true && result != 'true') {
                            this.formatErrorResult(element, rule, result);
                            return false;
                        } else {
                            this.formatSuccessResult(element);
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }
            return true;
        },

       getValue: function (element) {
            var type = $(element).attr('type'),
                val = $(element).val();

            if (type == 'radio' || type == 'checkbox') {
                return $('input[name="' + element[0].name + '"]:checked', this.content).val()
            }
            return val;
        },

        /**
         * 获取info或error时的HMTL元素
         * 增加vdata的属性
         */
        createLabel: function (element, message, type) {
            var settings = this.settings,
                classes = type + 'Class',
                elem = type + 'Element',
                label = this.getLabel(element,type),
                vdata, icon;

            if (!label.length) {
                label = $('<div id="tooltip" style="display:inline-block;"></div>');
                label.appendTo( element.parent());
                label.html('<span class="ico i-del" style="display:none;"></span><' + settings[elem] + ' for="' + element[0].name + '" class='+settings[classes]+'>');
                icon = element.attr('vicon');
                vdata = {
                    type: type,
                    target: element,
                    icon: icon
                };
                label.addClass(settings[classes]).data('vdata', vdata);
                label.find(settings[elem]).addClass(settings[classes]).html((icon ? '' : message) + '<i class="arrow ' + (icon ? 'ico i-del' : '') + '"><b></b></i>');

                if(element.attr('data-icon') && type !== 'info'){
                    label.find(settings[elem]).css('display','none');
                    if(type == 'success'){
                        label.find('span.ico')[0].className = "ico i-ok";
                        label.find('span.ico').css('display','inline-block');
                    }else{
                        label.find('span.ico')[0].className = "ico i-del";
                        label.find('span.ico').css('display','inline-block');
                    }

                }
            }
            return label
        },

        elementShow: function (element) {
            var that = this;
            element.each(function () {
                var elem = $(this);

                var vdata = elem.data('vdata') || {};
                var tipdata = that.getPos(elem);
                if (!tipdata.type) {
                    elem.show();
                } else {
                    tips.show(elem);
                }
            })
        },

        getPos: function (element) {
            var tips = element.data('tips'),
                vdata = element.data('vdata'),
                elem = vdata.target;

            if (!tips) {
                tips = {
                    type: elem.attr('tips'),
                    position: elem.attr('tips-pos'),
                    target: vdata.target
                };
                element.data('tips', tips)
                if (vdata.type == 'error' && vdata.icon) {
                    delete tips.type
                }
            }
            return tips
        },
        /**
         * @description 获取用户的错误信息1.后台返回。2.用户自定义整体。3.单个验证失败的信息
         * @param element
         * @param rule
         * @param msg
         */
        formatErrorResult: function (element, rule, msg) {
            var name = element[0].name,
                message = (msg != false) ? msg : this.getMessage(element, rule.method),isExist = false;

            message = $.valid.parseStr(message, rule.param);

            for(var i= 0,len = this.errorList.length;i++;i<len){
                if(element === this.errorList[i]['element'] || name == this.errorList[i]['element'][0].name) {
                    isExist = true;
                    this.errorList[i]['message'] = message;
                    this.errorMap[i][name] = message;
                   break;
                }
            }
            if(!isExist){
                this.errorList.push({
                    message: message,
                    element: element
                });
                this.errorMap[name] = message;
            }
        },

        formatSuccessResult : function(element){
            var name = element[0].name,isExist=false;

            for(var j= 0,lenj= this.errorList.length; j < lenj;j++){
                if(element === this.errorList[j]['element'] || name == this.errorList[j]['element'][0].name) {
                    this.errorList.splice(j,1);
                    delete this.errorMap[name];
                    return;
                }
            }
        },

        domElement: function (element) {
            return $(element)[0]
        },

        getMessage: function (element, key) {
            var message = this.settings.message,
                name = element[0].name,
                dataMessage = element.attr('vm'+key);

            return dataMessage || (message[name] && message[name][key]) || $.valid.method[key].errormsg
        },

        getInfo: function (element) {
            var info = element.data('vinfo') || element.attr('vinfo'),
                rules, method, i;

            if (!info) {
                info = [];
                rules = element.rules();
                method = $.valid.method;
                for (i in rules) {
                    if (i !== 'required') {
                        info.push($.valid.parseStr(method[i].info, rules[i]))
                    }
                }
                element.data('vinfo', info.join(','));
            }
            return info;
        },

        execute: function (element) {
            var i, length,flag=true,vElement,result;
            vElement = element || this.content.find(this.settings.validateTag).not(this.settings.notvalidateTag);
            for (i = 0, length = vElement.length; i < length; i++) {
                this.currentElements = vElement.eq(i);
                result = this.check(this.currentElements);
                this.showValidate(this.currentElements,result);
            }
            return flag;
        },
        /**
         * @lends $.fn.ajaxForm
         * @method
         * 显示验证信息
         * */
        showValidate : function(element,result){
            var settings = this.settings,
                i, length,name = element[0].name,isTip = element.attr('tips');

            if(result== true || result == 'true'){ //验证通过
                if(element.attr('data-icon')){
                    this.createLabel.call(this, element, '', 'success');
                }
                this.showSuccess(element, isTip);

            }else{ //验证失败
                if (settings.highlight) {
                    settings.highlight(element, settings.errorClass, settings.validClass);
                }
                this.createLabel.call(this, element, (result != false && result != 'false') ? result : this.errorMap[name], 'error');
                this.showError(element,isTip);
            }

        },
        showError : function(element, isTip){
            this.getLabel(element,'info').hide();
            this.getLabel(element,'success').hide();
            //this.getLabel(element,'error').show();
            var showElement =  this.getLabel(element,'error');
            if(isTip && !element.attr('data-icon')){
                var tipdata = this.getPos(showElement);
                if (!tipdata.type) {
                    showElement.show();
                } else {
                    tips.show(showElement);
                }
            }else{
                showElement.show();
            }
        },
        /**
         * @lends $.fn.ajaxForm
         * @method
         * 显示提示信息
         * */
        showInfo : function(element,isTip){
            this.getLabel(element, 'error').hide() ;
            this.getLabel(element,'success').hide();
            var showElement = this.getLabel(element,'info');
            if(isTip){
                var tipdata = this.getPos(showElement);
                if (!tipdata.type) {
                    showElement.show();
                } else {
                    tips.show(showElement);
                }
            }else{
                showElement.show();
            }
        },
        showSuccess : function(element,isTip){
            this.getLabel(element,'error').hide();
            this.getLabel(element,'info').hide();
            var showElement = this.getLabel(element,'success');
            showElement.show();
        },
        isEmpty: function (obj) {
            for (var prop in obj) {
                if(obj.hasOwnProperty(prop)){
                    return false;
                }
            }
            return true;
        },
        startRequest: function (element) {
            if (!this.pending[element[0].name]) {
                this.pending[element[0].name] = true;
                this.pendingRequest++;
            }
        },

        focusInvalid: function () {
            this.errorList[0].element.focus();
        },

        stopRequest: function (element, valid) {
            this.pendingRequest--;
            if (this.pendingRequest < 0) {
                this.pendingRequest = 0;
            }
            delete this.pending[element.name];

            if (valid && (this.pendingRequest == 0) && this.formSubmited && this.execute()) {
                this.content.submit();
                this.formSubmited = false;
            } else {
                this.currentElements.triggerHandler('evInvalid', [this]);
            }
        }
    }

    $.extend($.validate ,{
        /**
         * @lends $.fn.ajaxForm
         * @method
         * 清除验证信息
         * */
        clearValidate : function(element){
            if(typeof element == 'string')
                element = $(element);
            var cElement = element.find(this.settings.validateTag).not(this.settings.notvalidateTag), i,len;
            for(i=0,len = cElement.length; i < len;i++ ){
                this.getLabel(cElement.eq(i),'error').hide();
                this.getLabel(cElement.eq(i),'success').hide();
                cElement.eq(i).removeClass('error');
            }
        }
    })
})();