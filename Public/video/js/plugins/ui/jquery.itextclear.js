(function (jQuery) {
    jQuery.iTextClear = function (obj, options) {
        var self = this, stat = false, clearBtn = jQuery('<a class="iTextClearButton"></a>');
        self.$el = jQuery(obj);
        self.el = obj;
        self.$el.data("iTextClear", self);
        self.init = function () {
            self.options = jQuery.extend({}, jQuery.iTextClear.defaultOptions, options);
            self.$el.wrap('<span class="iTextClearButtonContainer"></span>').after(clearBtn.hide()).bind("focus.itextclear",function () {
                clearBtn.show()
            }).bind("focusout.itextclear", function () {
                stat ? stat = false : clearBtn.hide()
            });
            clearBtn.bind("mousedown.itextclear", function () {
                stat = true;
                self.$el.val("");
                setTimeout(function () {
                    self.$el.focus()
                }, 0)
            })
        };
        self.init()
    };
    jQuery.iTextClear.defaultOptions = {};
    jQuery.fn.iTextClear = function (options) {
        return this.each(function () {
            new jQuery.iTextClear(this, options)
        })
    }
})(jQuery);