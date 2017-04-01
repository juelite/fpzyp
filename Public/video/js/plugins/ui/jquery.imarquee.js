/**
 * jQuery Pause plugin
 */
(function () {
    var e = jQuery, f = "jQuery.pause", d = 1, b = e.fn.animate, a = {};

    function c() {
        return new Date().getTime()
    }

    e.fn.animate = function (k, h, j, i) {
        var g = e.speed(h, j, i);
        g.complete = g.old;
        return this.each(function () {
            if (!this[f]) {
                this[f] = d++
            }
            var l = e.extend({}, g);
            b.apply(e(this), [k, e.extend({}, l)]);
            a[this[f]] = {run: true, prop: k, opt: l, start: c(), done: 0}
        })
    };
    e.fn.pause = function () {
        return this.each(function () {
            if (!this[f]) {
                this[f] = d++
            }
            var g = a[this[f]];
            if (g && g.run) {
                g.done += c() - g.start;
                if (g.done > g.opt.duration) {
                    delete a[this[f]]
                } else {
                    e(this).stop();
                    g.run = false
                }
            }
        })
    };
    e.fn.resume = function () {
        return this.each(function () {
            if (!this[f]) {
                this[f] = d++
            }
            var g = a[this[f]];
            if (g && !g.run) {
                g.opt.duration -= g.done;
                g.done = 0;
                g.run = true;
                g.start = c();
                b.apply(e(this), [g.prop, e.extend({}, g.opt)])
            }
        })
    }
})();
/**
 * jQuery iMarquee
 * Nick liufc
 * 2013-01-23
 */
(function (jQuery) {
    jQuery.fn.imarquee = function (settings) {

        var settings = $.extend({}, $.fn.imarquee.defaults, settings);
        //保存当前对象
        var scrtime;

        var $ul = $(this);
        var liFirstHeight = $ul.find(settings.charElement + ":first").height();//第一个li的高度
        $ul.css({ top: "-" + liFirstHeight - 10 + "px" });//利用css的top属性将第一个li隐藏在列表上方	 因li的上下padding:10px所以要-20

        function scrolllist() {
            //动画形式展现第一个li
            $ul.animate({ top: 0 + "px" }, 1500, function () {
                //动画完成时
                $ul.find(settings.charElement + ":last").prependTo($ul);//将ul的最后一个剪切li插入为ul的第一个li
                liFirstHeight = $ul.find(settings.charElement + ":first").height();//刚插入的li的高度
                $ul.css({ top: "-" + liFirstHeight - 10 + "px" });//利用css的top属性将刚插入的li隐藏在列表上方  因li的上下padding:10px所以要-20
            });
        }

        $ul.hover(function () {
            $ul.pause();//暂停动画
            clearInterval(scrtime);
        },function () {
            $ul.resume();//恢复播放动画
            scrtime = setInterval(scrolllist, 3300);

        }).trigger("mouseleave");//通过trigger("mouseleave")函数来触发hover事件的第2个函
    };

    /*  Default Settings  */
    $.fn.imarquee.defaults = {
        ShowTime: 3300, //显示时间
        moveTime: 1500, //移动时间
        charElement: "li" //子节点
    };
})(jQuery);
