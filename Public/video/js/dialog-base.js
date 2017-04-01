;
(function($) {
    var processingClass = 'disable';
    $.dialog = function(options) {
        this.init = function(options) {
            options = $.extend({
                title : '', // 标题
                icon : true, // 图标
                html : '', // 内容
                url  :'',//对话框的地址和html属性止咳选择其中一个，url中支持loading.
                mask : true, // 是否使用蒙板
                overflow : 'hidden', // 是否显示滚动条
                draggable : true, // 是否支持拖动
                position: 'center',//弹框的位置,可选值:center、 leftTop、leftBottom、rightTop、rightBottom、near(只有箭头的会用到near)
                objId:null,//参照物的id.不设置，参照物是整个屏幕;有此值弹框一次只能弹出一个，即上个对话框未关闭，下个对话框不能弹出。
                adaptable:null,
                arrow:false,
                direction:'',
                eventType:'click',
                label : {
                    ok : '保存', // ok按钮默认名称
                    cancel : '取消'// cancel按钮默认名称
                },
                onclose : function() {// 关闭事件
                },
                renderer: ''// 渲染对话框内容的回调方法，具体实现由用户自定义
            }, options);
            var tk = tk||{};

            if($('#'+options.objId).hasClass(processingClass)){
                return false;
            }else{
                $('#'+ options.objId).addClass(processingClass);
            }
            tk.genId = function(id) {
                return (id || '') + ($.now() + Math.random() + '').replace('.', '-');
            };
            tk.setUrlParam = function(url, param, v) {
                var re = new RegExp("(\\\?|&)" + param + "=([^&]+)(&|$)", "i");
                var match = url.match(re);
                if (match) {
                    return (url.replace(re, function($0, $1, $2) {
                        return ($0.replace($2, v));
                    }));
                } else {
                    if (url.indexOf('?') == -1)
                        return (url + '?' + param + '=' + v);
                    else
                        return (url + '&' + param + '=' + v);
                }
            };
            options.id = options.id || tk.genId('dialog');
            if ($('body>.blockUI.blockOverlay').length) {
                options.mask = false;
            }
            options.foot = options.foot || [];
            if (options.ok) {
                options.foot.push({
                    title : options.label.ok,
                    action : options.ok,
                    cls : 'ny-button-save'
                });
            }
            if (options.cancel) {
                options.foot.push({
                    title : options.label.cancel,
                    action : function() {
                        options.close();
                        if (typeof options.cancel == 'function') {
                            options.cancel.call();
                        }
                    },
                    cls : 'ny-button-cancel'
                });
            }
            if (options.maskTarget) {
                options.maskTarget.mask({
                    overlayCSS : {
                        cursor : 'default'
                    }
                });
            } else if (options.mask) {
                $.blockUI({
                    message : null,
                    bindEvents : false,
                    overlayCSS : {
                        cursor : 'default'
                    }
                });
            }
            var titleId = tk.genId('dialog-header');
            if (options.arrow == true) {
                var html = '<div id="' + options.id + '"  class="c-dialog arrow  "  style="width:' + options.width + 'px;overflow:'+ options.overflow +';">';
                /*html +='<div class="arrow-'+options.direction+'">  </div>';*/
                 html +='<div class="outTriangle "><div class="inTriangle "></div></div>';
                if(options.icon){
                    html +='<a href="javascript:void(0)" class="close-btn"><span class=" i-delete"></span></a>';
                };
            } else{
                var html = '<div id="' + options.id + '" class="c-dialog " style="width:' + options.width + 'px;overflow:'+ options.overflow +';">';
            }
            html += '<iframe class="bgiframe" frameborder="0" src="javascript:false;"></iframe>';
            if(options.title){
                html += '<div id="' + titleId + '" class="dialog-titlebar" >';
                html += '<span class="dialog-title">';
                html += options.title;
                html += '</span>'
                 if(options.icon){
                 html +='<a href="javascript:void(0)" class="close-btn"><span></span></a>';
                 };               
                html += '</div>';
            };
            html += '<div class="dialog-content" style="height:' + options.height + 'px;">';
            html += '<div class="loading-overlay"><div class="loading" style="margin-top:' + (options.height / 2 - 20)
                + 'px"></div></div>';
            html += '</div>';
            if (options.foot.length) {
                html += '<div class="dialog-buttonpane">';
                for (var i = options.foot.length - 1; i >= 0; i--) {
                    var item = options.foot[i];
                    item.cls = item.cls || 'ny-button-save';
                    html += '<a actionIndex="' + i + '" class="ny-button ' + item.cls + '" href="javascript:void(0);">'
                        + item.title + '</a>';
                }
                html += '</div>';
            }
            html += '</div>';
            $(document.body).append(html);
            var dialog = $('#' + options.id);
            var foot = dialog.find('.dialog-buttonpane');
            var body = dialog.find('.dialog-content');
            if (options.html) {
                body.html(options.html);
            } else if (options.url) {
                options.url=tk.setUrlParam(options.url,'dlgId',options.id);//设置url参数
                html = '<iframe src="' + options.url
                    + '" frameborder="0" scrolling="auto" style="display:none;width:100%;height:98%" class="autoIframe dialog-frame"></iframe>';
                body.append(html).find('.autoIframe').load(function() {
                    body.find('.loading-overlay').remove();
                    $(this).show();
                });
                body.find('.dialog-frame').load(function(){
                    if(typeof(options.onload) != 'undefined'){
                        var msg = this.contentWindow.msg;
                        if(msg != null && msg != 'null' && msg != 'undefined'){
                            if(msg.indexOf('OK') >= 0){
                                options.onload.call(options,dialog);
                            }
                        }
                    }
                });
            } else if (options.renderer) {// 渲染对话框内容的回调方法，具体实现由用户自定义
                var renderer = options.renderer;
                var type = typeof(renderer);
                var html = '';
                if (type == 'string') {// 事件以字符串方式传递一个方法名
                    try {
                        if (renderer.indexOf('(') != -1) {
                            return eval(renderer);
                        } else {
                            var items = renderer.split('.');
                            var length = items.length;
                            if (length == 0) {
                                html = '';
                            }
                            var fun = window;
                            for (var i = 0; i < length; i++) {
                                fun = fun[items[i]];
                            }
                            html = fun.call(options, body, foot);
                            // 此处三个参数用于在回调中方便地渲染对话框的内容和下方工具栏
                        }
                    } catch (ee) {
                    }

                } else if (type == 'function') {// 事件以方法方式直接传递
                    html = renderer.call(options, body, foot);
                }
                if (html) {
                    body.html(html);
                }
            };

            switch (options.position){
                case 'center':
                    $.popCenter(dialog);
                    break;
                case 'leftTop':
                    $.popLeftTop(dialog);
                    break;
                case 'leftBottom':
                    $.popLeftBottom(dialog);
                    break;
                case 'rightTop':
                    $.popRightTop(dialog);
                    break;
                case 'rightBottom':
                    $.popRightBottom(dialog);
                    break;
                case 'near':
                    $.popNear({
                        layer : dialog,
                        id  : options.objId,
                        position :options.position,
                        width :options.width+20,
                        height :options.height+20,
                        adaptable:options.adaptable,
                        direction:options.direction
                    });
                    break;
            }
       
       /!* 当窗口变化时，保证弹框也移动。 *!/
            $(window).resize(function () {
                switch (options.position){
                    case 'center':
                        $.popCenter(dialog);
                        break;
                    case 'leftTop':
                        $.popLeftTop(dialog);
                        break;
                    case 'leftBottom':
                        $.popLeftBottom(dialog);
                        break;
                    case 'rightTop':
                        $.popRightTop(dialog);
                        break;
                    case 'rightBottom':
                        $.popRightBottom(dialog);
                        break;
                    case 'near':
                        $.popNear({
                            layer : dialog,
                            id  : options.objId,
                            position :options.position,
                            width :options.width+20,
                            height :options.height+20,
                            adaptable:options.adaptable
                        });
                        break;
                }
            });


            var obj = $.bindMsgEvent(dialog, options);
            if (options.draggable) {
                dialog.easydrag() ;  /*.setHandler(titleId);*/
            }

           // body.bindDefCss();
            return obj;
       };

        return this.init(options);
    };


    /**
     * 绑定对话框事件
     */
    $.bindMsgEvent = function(layer, options) {
        var obj = {
            config : options,
            close : close,
            dialog : layer
        };
        options.close = close;
        function close(opt) {
            opt = opt || {};
            if (options.closeTimer) {
                clearTimeout(options.closeTimer);
            }
            layer.animate({
                height : 0,opacity:'normal'
            }, {
                speed : 'fast',
                complete : function() {
                    $(this).remove();
                }
            });
            var oncls = function() {
                if (opt.beforeClose) {
                    if (opt.beforeClose.call(obj) === false) {
                        return;
                    }
                }
                options.onclose.call(obj);
                if (opt.afterClose) {
                    opt.afterClose.call(obj);
                }
            };
            var unblockOpt = {
                onUnblock : oncls
            };
            if (options.mask) {
                $.unblockUI(unblockOpt);
            } else if (options.maskTarget) {
                options.maskTarget.unblock(unblockOpt);
            } else {
                oncls();
            }
            $('#'+ options.objId).removeClass(processingClass);
        };
        layer.find('.close-btn').click(function() {
            close();
        });//4种弹出框和对话框点击X按钮，关闭对话框
        layer.find('.ny-icon-close').click(function() {
            close();
        });//提示框点击X按钮，关闭对话框

       /* if (options.timeout) {
            options.closeTimer = setTimeout(function() {
                close();
            }, options.timeout);
            layer.mouseenter(function() {
                clearTimeout(options.closeTimer);
            }).mouseleave(function() {
                options.closeTimer = setTimeout(function() {
                    close();
                }, options.timeout);
            });
        }*/
        layer.find('.dialog-buttonpane>a').click(function() {
            options.foot[$(this).attr('actionIndex')].action.call(obj);
        });
        return obj;
    };


    $.msg = function(options) {
        var ok = options.ok;
        var msg = options.msg;
        var type = options.type;
        var title = '';
        var cancel = true;
        switch (type) {
            case 'info' :
                title = '提示';
                options.ok = function() {
                    this.close();
                    if (ok) {
                        ok.call();
                    }
                };
                break;
            case 'err' :
                title = '错误';
                break;
            case 'warn' :
                title = '警告';
                break;
            case 'confirm' :
                title = '确认';
                options.ok = function() {
                    this.close();
                    if (ok) {
                        ok.call();
                    }
                };
                break;
        };
        if(msg!=null && typeof(msg)!="undefined" ){
            var html = '<span class="icon-dialogs ' + type + '"></span>';
            if(msg.length<16){
               html +='<span class="dialog-msg lh40">' + msg + '</span>'
            }else{
               html +='<span class="dialog-msg-small mt40 pl30">' + msg + '</span>'
            }
        };
       /* $('.dialog-msg').closest('.c-dialog').each(function() {
            var top =  $(this).offset().top - $(this).height();
            $(this).animate({
                top : top < 0 ? 0 : top
            }, 'fast');
            $(this).animate({
                top : top
            }, 'fast');
        });*/
        var options = $.extend({
            title : title,
            html : html,
            mask : true,
            overflow : 'hidden',
            width : 350,
            height :127,
            position : 'center',
            draggable : true,
            label : {
                ok : '确定',
                cancel : '关闭'
            },
            cancel : cancel
        }, options);
        $.dialog(options);
    };
    $.tips = function(msgTip){
        msgTip = $.extend({
            msg:'操作成功！',//提示文字
            timeout:3000, //自动关闭的时间
            type :'success',//可选值：sucess/err/info/confirm
            position:'center'//可选值：center/ leftTop/leftBottom/rightTop/rightBottom
        }, msgTip);
        if(msgTip.msg!=null && typeof(msgTip.msg)!="undefined" ){
            var html = '<div  class="dialog-success"><a class="ny-icon-close no-text"></a> ' ;
            if(msgTip.msg.length<10){
                html +='<span class="icon-dialogs ' + msgTip.type + '"></span><span class="dialog-msg dialog-tip">' +msgTip.msg + '</span>';
            }else{
                html +='<span class="icon-dialogs-small ' + msgTip.type + '"></span><span class="dialog-msg-small dialog-tip">' +msgTip.msg + '</span>';
            }
            html+='</div>';
        };
        
        /*$('.dialog-msg').closest('.c-dialog').each(function() {
            var top =  $(this).offset().top - $(this).height();
            $(this).animate({
                top : top < 0 ? 0 : top
            }, 'fast');
            $(this).animate({
                top : top
            }, 'fast');
        });*/
        var options = $.extend({
            html : html,
            mask : false,
            overflow : 'hidden',
            width : 270,
            height :120,
            timeout:msgTip.timeout,
            position:msgTip.position,
            draggable : false,
            cancel:false
        }, options);
        $.dialog(options);
        var $content = $('.dialog-success').parent('.dialog-content').css('background','none');
        $content.parent('.c-dialog').css('background','none');
      
    };
    $.info = function(options,ok) {
        options= $.extend({
            position:'center',
            msg:''
        }, options);
        $.msg({
            type : 'info',
            msg : options.msg,
            position:options.position,
            ok : ok
        });
    };
    $.warn = function(options) {
        options= $.extend({
            position:'center',
            msg:''
        }, options);
        $.msg({
            type : 'warn',
            msg : options.msg,
            position:options.position,
        });
    };
    $.err = function(options) {
        options= $.extend({
            position:'center',
            msg:''
        }, options);
        $.msg({
            type : 'err',
            msg :  options.msg,
            position:options.position
        });
    };
    $.confirm = function(options,ok) {
        options= $.extend({
            position:'center',
            msg:'',
            mask:false,
            close:function(){}
            	
        }, options);
        $.msg({
            type : 'confirm',
            msg : options.msg,
            position:options.position,
            ok : ok,
            mask:options.mask,
            onclose:options.close
        });
    };
    $.arrow = function(options){
        options = $.extend({
            title : '',
            html : ' ',
            mask : false,
            icon:true,
            overflow : 'visible',
            width : '',
            height :'',
            position : 'near',
            arrow:true,
            draggable : true,
            cancel : false,
            direction:' '
        }, options);
        $.dialog(options);
    };
})(jQuery);

