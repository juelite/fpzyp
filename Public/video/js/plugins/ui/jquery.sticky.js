(function($) {
    var valToObj = function(message, title, level, callback, options) {
        if ($.isPlainObject(message)) {
            return message;
        }
        var obj = {};
        obj.message = message;
        if ($.isPlainObject(title)) {
            options = title;
        } else if ($.isPlainObject(level)) {
            options = level;
            if ($.isFunction(title)) {
                callback = title;
            } else {
                level = title;
            }
            title = null;
        } else if ($.isFunction(title)) {
            callback = title;
            title = null;
        } else if ($.isFunction(level)) {
            options = callback;
            callback = level;
            level = title;
            title = null;
        } else if (level == null && typeof title == 'string') {
            level = title;
            title = null;
        } else if ($.isPlainObject(callback)) {
            options = callback;
            callback = options.afterclose;
        }
        obj.title = ((typeof title == 'string') && title) || (options ? options.title : null);
        obj.level = ((typeof level == 'string') && level) || (options ? options.level : null);
        obj.afterclose = callback || (options ? (options.callback || options.afterclose) : null);
        obj.afteropen = options ? (options.afteropen || null) : null;
        obj.options = options;
        (options && options.type) && (obj.type = options.type);
        return obj;
    };

    var handleTitle = function(obj, defaultLevel) {
        if (obj.level == null) {
            obj.level = obj.type || defaultLevel;
        }

    };

    $.sticky = function(message, title, level, callback, options) {
        if (typeof(message) == "object") {
            return sticky(message);
        } else {
            var obj = valToObj(message, title, level, callback, options);
            handleTitle(obj, 'attention');
            return sticky(obj);
        }
    };

    var types = ['ok', 'error', 'stop', 'question', 'notice', 'attention', 'tips', 'alarm'];
    function sticky(param) {
        param = $.extend({}, defaults, param);
        var message = param.message, title = param.title, result = "", callback = param.afterclose;
        var options = $.extend({}, settings, param.options);
        if ((title == null || title == '') && !options.html) {
            title = message;
            message = '';
        }
        var display = !0, duplicate = "no", uniqID = options.id || ('_stk' + Math.floor(99999 * Math.random()));
        $(".sticky-note").each(function() {
            var self = $(this);
            self.html() == message && self.is(":visible") && (duplicate = "yes", options.duplicates || (display = !1));
            self.attr("id") == uniqID && (uniqID = options.id || Math.floor(9999999 * Math.random()))
        });
        var stic = $('<div class="sticky-queue ' + options.position + '"></div>').appendTo('body');
        if ($.fn.bgiframe) {
            $(".sticky-queue").bgiframe();
        }

        if(options.html){
            result = message;
        } else if (param.level && new RegExp(param.level).test(types.join(','))) {
            result = '<div class="msg-b-weak msg-b-' + param.level + '"><i></i><div class="msg-cnt">';
            if (title != "" && title != null)
                result += '<h5>' + title + '</h5>';
            if (message != "" && message != null)
                result += '<p>' + message + '</p>';
            result += '</div></div>';
        } else {
            if (title != "" && title != null)
                result += '<h5>' + title + '</h5>';
            if (message != "" && message != null)
                result += '<p>' + message + '</p>';
        }
        display
        && ($("#" + uniqID).html()
            || (stic.prepend('<div class="sticky border-' + options.position
            + " " + (param.type ? param.type : "") + '" id="' + uniqID + '"></div>')), $("#" + uniqID).empty()
            .append('<span class="close sticky-close" rel="' + uniqID + '" title="'+ language.text('dialog.close')+'">&times;</span>'), $("#"
            + uniqID).append('<div class="sticky-note" rel="' + uniqID + '">' + result + '</div>'), height = $("#"
            + uniqID).height(), $("#" + uniqID).css("height", height), $("#" + uniqID).slideDown(options.speed,
            function() {
                $(".sticky").ready(function() {
                    function slideUpSticky() {
                        var that = $("#" + uniqID), queue = that.closest(".sticky-queue"), sticky = queue.find(".sticky");
                        that.remove();
                        1 == sticky.length && queue.hide();
                        try {
                            callback && callback();
                        } catch (e) {
                        }
                    }
                    options.autoclose && $("#" + uniqID).delay(options.autoclose).slideUp(options.speed, function() {
                        slideUpSticky();
                    }).on('mouseenter', function() {
                            $(this).dequeue().stop();
                        }).on('mouseleave', function() {
                            $(this).delay(options.autoclose).slideUp(options.speed, function() {
                                slideUpSticky();
                            });
                        });
                });
                $(".sticky-close").click(function() {
                    $("#" + $(this).attr("rel")).dequeue().slideUp(options.speed, function() {
                        var self = $(this);
                        var queue = self.closest(".sticky-queue"), sticky = queue.find(".sticky");
                        self.remove();
                        1 == sticky.length && queue.hide();
                        try {
                            callback && callback();
                        } catch (e) {
                        }
                    })

                });

            }), display = !0);
        if (param.afteropen) {
            param.afteropen(options);
        }

        return {
            id : uniqID,
            duplicate : duplicate,
            displayed : display,
            position : options.position,
            level : options.level,
            options : options
        };
    }
    var settings = {
        speed : "fast",
        duplicates : 1,
        autoclose : 2E3,
        position : "center-center",
        html: false,
        id : ""
    };
    var defaults = {
        message : '',
        title : '',
        level : "",
        afteropen : null,
        afterclose : null
    };

    window.jSticky = function(note, title, options, callback) {
		setTimeout(function() {
			top.$.sticky(note, title, options, callback);
		}, 0);
    };
})(jQuery);