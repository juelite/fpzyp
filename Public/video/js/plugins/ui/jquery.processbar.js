/**
* jQuery Processbar
* Nick liufc
* 2013-01-24
*/
(function(jQuery){
    // def values
    var iCms = 1000;
    var iMms = 60 * iCms;
    var iHms = 3600 * iCms;
    var iDms = 24 * 3600 * iCms;

    jQuery.fn.progressbar = function(settings) {
        var settings = $.extend({}, $.fn.progressbar.defaults, settings);
        var pbar = this,
            html = [];
        pbar.each(
            function() {
                $(pbar).hasClass("progressbar") ? "" : ($(pbar).addClass("progressbar"));
                if(settings.cls.length>0) $(pbar).addClass(settings.cls);
                html.push('<div class="progress');
                if(settings.size.length>0) html.push(' progress-'+settings.size);
                if(settings.type.length>0) html.push(' progress-'+settings.type);
                if(settings.striped) html.push(' '+settings.cls);
                if(settings.stripedActive) html.push(' '+settings.cls);
                html.push('">');
                html.push('<div class="filler"><div class="bar"',(settings.value > 0 ? 'style="width:' + settings.value + '%"' : ''),'> </div>')
                if((settings.inside)) html.push('<div',(settings.inside > 0 ? ' style="margin-left:' + settings.inside + '%"' : ''),'>',settings.inside,'%</div>')
                html.push('</div></div>');
                if(settings.percent && !settings.inside) html.push('<div class="percent"><b>',settings.value,'%</b></div>');
                if(settings.elapsed) html.push('<div class="elapsed">',settings.tips,'</div>');
                $(pbar).empty().append(html.join(''));
            }
        );

        if(settings.animate){
            // each progress bar
            pbar.each(
                function() {
                    var iDuration = settings.finish - settings.start,
                        percent = $(pbar).find('.percent'),
                        elapsed = $(pbar).find('.elapsed'),
                        bar = $(pbar).find('.bar');

                    // looping process
                    var vInterval = setInterval(
                        function(){
                            var iLeftMs = settings.finish - new Date(); // left time in MS
                            var iElapsedMs = new Date() - settings.start, // elapsed time in MS
                                iDays = parseInt(iLeftMs / iDms), // elapsed days
                                iHours = parseInt((iLeftMs - (iDays * iDms)) / iHms), // elapsed hours
                                iMin = parseInt((iLeftMs - (iDays * iDms) - (iHours * iHms)) / iMms), // elapsed minutes
                                iSec = parseInt((iLeftMs - (iDays * iDms) - (iMin * iMms) - (iHours * iHms)) / iCms), // elapsed seconds
                                iPerc = (iElapsedMs > 0) ? iElapsedMs / iDuration * 100 : 0; // percentages

                            // display current positions and progress
                            $(percent).html('<b>'+iPerc.toFixed(1)+'%</b>');
                            $(elapsed).html(iDays+language.text('ui.day')+iHours+ language.text('ui.hour')+iMin+ language.text('ui.minute') +iSec+ language.text('ui.second') + '</b>');
                            $(bar).css('width', iPerc+'%');

                            // in case of Finish
                            if (iPerc >= 100) {
                                clearInterval(vInterval);
                                $(percent).html('<b>100%</b>');
                                $(elapsed).html(language.text('ui.finished') );
                            }
                        } ,settings.interval
                    );

                }
            );
        }
    };

    /*  Default Settings  */
    $.fn.progressbar.defaults = {
        value: 0,// 初始化值，默认为0
        cls: "",// 自定义样式，用于个性化设置，默认为空
        size: "",// 进度条的大小，包括：default、medium、small、mini，默认为空
        type: "",// 进度条的类型，包括：info、success、warning、danger，默认为空
        percent: false,// 是否显示百分比
        elapsed: false,// 是否显示倒计时
        tips: "",// 显示在elapsed位置的提示内容，在没有倒计时时，可以用来显示字节数、加载数等信息，
        striped: false,// 是否显示条带
        stripedActive: false,// 是否显示动态条带

        animate: false,// 是否动态显示进度，默认关闭
        /* 以下是 animate = true 的相关属性 */
        start: new Date(), // now
        finish: new Date().setTime(new Date().getTime() + 60 * iCms), // now + 60 sec
        interval: 1
    };

})( jQuery );
  