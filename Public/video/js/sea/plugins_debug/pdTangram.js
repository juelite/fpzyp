define('./pdTangram', [ './component' ], function(require, exports) {
    var Component = require('./component');
    return Component.extend({
        $tip : null,
        constructor : function(opt) {
            this.base(opt);
        },
        render : function() {
            var self = this;
            this.el.bind('keyup change', function() {
                self.checkPasswd();
            })
        },
        checkPasswd: function () {
            var addVal = this.getAdditionalVal();
            return this.authPasswd.apply(this, [this.el.val()].concat(addVal));
        },
        getAdditionalVal: function () {
            return []
        },
        destroy : function() {
            this.base();
        },
        noticeAssign : function(num) {
            this.trigger('noticeAssign', num);
        },
        authPasswd: function(str, arr, lstr) {
            var len = str.length,
                pas = '',
                sgrade;

            /\d/.test(str) && (pas = pas + 1);
            /[a-z]/.test(str) &&(pas = pas + 2);
            /[A-Z]/.test(str) &&(pas = pas + 3);
            /[^\da-zA-Z]/.test(str) &&(pas = pas + 4);


            if (len < 8 || pas.length==1 || (arr && arr.split(',').indexOf(str) >= 0) || (lstr && (str === lstr || str === lstr.split('').reverse().join('')))) {
                this.noticeAssign(0);
                return 0
            }

            if (pas.length == 2) {
                if (/^14|23|24|34$/.test(pas)) {
                    sgrade = 2
                } else {
                    sgrade = 1
                }
            } else {
                sgrade = 3
            }
            this.noticeAssign(sgrade);
            return sgrade;
        }
    });
});
