;(function ($, context) {
    function gridTemplate(id,options){
        this.init(id , options||{});
    };
    context['gridTemplate'] = gridTemplate;

    var defaults = {
        sortTd : 'table thead td[sort=true]',
        sortTdCss : "sortCol",
        sortUpCss : 'headerSortUp',
        sortDownCss : 'headerSortDown',
        trSelectCss : 'thisRow',
        page : true,
        pageProperty : {pageType : 'page-type',pageNo : 'pageNo', totalPage : 'totalPage'},
        pageCss : '.pagination' ,
        jumpCss : 'input.jumpTo'

    };

    //var utils = _model.require('utils');
    gridTemplate.prototype = {
        constructor :  gridTemplate,
        init : function(id,options){
            this.el = (typeof id == "string") ? $(id):id;
            this.setOptions(options);
            this.render(this.el);
            return this;
        },
        setOptions : function(options){
            this.options = $.extend(defaults,options);
        },
        sort : function(e,context){
            var targetEl = context,mapping = targetEl.attr('mapping');
            if (!mapping)
                return;
            targetEl.find('.auto-sort a').attr('disabled', 'disabled');
            var value = 'DESC',opt = this.options,sortDownCss=opt.sortDownCss,orderMap = null;
            if (targetEl.hasClass(sortDownCss)) {
                value = 'ASC';
            }
            orderMap = mapping + ':' + value;
            $.cookie($.getLocationPath() + '@sort', orderMap);
            $.history(document.location.href);
        },
        render : function(el){
            var opt = this.options,sortCss = opt.sortTd,sortObj = el.find(sortCss);
            if (!sortObj.length) {
                return;
            }
            var sortValue = $.cookie($.getLocationPath() + '@sort'),sortSplit = [],
                sortTdCss = opt.sortTdCss,sortUpCss = opt.sortUpCss,sortDownCss = opt.sortDownCss;
            if (sortValue) {
                sortSplit = sortValue.replace(/[ ]/g, "").split(':');
                sortObj.$each(function(index, tdEl) {
                    var mapping = tdEl.attr('mapping'),htmlArray = [];
                    tdEl.addClass(sortTdCss);
                    if (mapping == sortSplit[0]) {
                        if (sortSplit[1].toUpperCase() == 'ASC') {
                            tdEl.addClass(sortUpCss);
                        } else {
                            tdEl.addClass(sortDownCss);
                        }
                        var idx = $('table thead td', el).index(tdEl);
                        sortObj.parents('table').find('tbody tr').each(function() {
                            $(this).find('td:eq(' + idx + ')').addClass(sortTdCss);
                        });
                    }
                    htmlArray.push('<div>');
                    htmlArray.push($.trim(tdEl.text()));
                    htmlArray.push('<span></span></div>');
                    tdEl.html(htmlArray.join(''));
                });
            }

            if(opt.page){
                this.renderPage(el);
            }
        },
        renderPage : function(el){
            var opt = this.options,jump = opt.jumpCss;
            el.find(jump).each(function(){
                if(!this.maxLength ||  this.maxLength >= 10) {
                    this.maxLength = 10;
                }
            });
        },
        toPage : function(e,context){
            var targetEl = context,opt = this.options,pType=opt.pageProperty.pageType,
                pNo = opt.pageProperty.pageNo, pTotal = opt.pageProperty.totalPage,pCss = opt.pageCss;
            var type = targetEl.attr(pType);
            var pageEl = targetEl.closest(pCss);
            var pageNo = parseInt(pageEl.attr(pNo));
            var totalPage = parseInt(pageEl.attr(pTotal));
            var startEl = pageEl.find('input[_name=start]');
            var formEl = startEl.closest('form');
            if (!formEl.length)
                return;
            var start = 0;
            if (e === true) {
                start = pageNo;
            } else {
                switch (type) {
                    case ('first'):
                        start = 1;
                        break;
                    case ('prev'):
                        start = pageNo - 1;
                        break;
                    case ('next'):
                        start = pageNo + 1;
                        break;
                    case ('last'):
                        start = totalPage;
                        break;
                    case ('jump'):
                        var value = startEl.val();
                        if ($.isNumeric(value)) {
                            value = parseInt(value, 10);
                            if(!$.isNumeric(value)){
                                value = pageNo;
                            }else{
                                if (value <= 1) {
                                    value = 1
                                } else if (value > totalPage) {
                                    value = totalPage;
                                } else {
                                    value = value;
                                }
                            }

                        } else {
                            value = pageNo;
                        }
                        start = value;
                        break;
                    case ('page-size'):
                        var value = targetEl.val();
                        var useLimitCookie = targetEl.attr('useLimitCookie');
                        if (useLimitCookie === 'false') {
                            pageEl.find('input[name=limit]').val(value);
                        } else {
                            $.cookie('limit', value, {
                                expires: 180,
                                path: '/'
                            });
                        }
                        break;
                }
            }
            pageEl.find('input[name=start]').val(start);
            formEl.submitHistory();
        },
        onSelect : function(el){
            var opt = this.options,trSel = opt.trSelectCss;
            if(el.attr('checked')){ //取消选中
                el.parents('tr').addClass(trSel);
                var allChecks =  this.el.find('table tbody tr td:first-child input:checkbox');
                var realChecks =  this.el.find('table tbody tr td:first-child input:checkbox:checked');
                if(allChecks.length === realChecks.length)
                    this.el.find('table thead tr td:first-child input:checkbox').attr('checked','checked');
            }else{
                el.parents('tr').removeClass(trSel);
                this.el.find('table thead tr td:first-child input:checkbox').removeAttr('checked');
            }
        },
        onAllSelect : function(el){
            var realChecks =  this.el.find('table tbody tr td:first-child input:checkbox'),opt = this.options,trSel = opt.trSelectCss;
            if(el.attr('checked')){
                realChecks.attr('checked','checked');
                realChecks.parents('tr').addClass(trSel);
            }else{
                realChecks.removeAttr('checked');
                realChecks.parents('tr').removeClass(trSel);
            }
        }
    }
})(jQuery, this);




$(function () {

    (function(){
        var table = $('.datatable'),len = table.length;
        if(len > 0){
           table.each(function () {
              var grid = new gridTemplate($(this)),opt = grid.options,sortTd = opt.sortTd ;
               grid.el.delegate(sortTd, 'click',function(e){
                   grid.sort(e,$(this));
               });

               grid.el.find('.pagination[autoJump!="false"]').delegate('a[disabled!="disabled"]','click', function(e){
                   grid.toPage(e,$(this))
               }).delegate('select', 'change', function(e){grid.toPage(e,$(this))}).delegate(
                   'input[type="text"]', 'keypress',function (e) {
                       if (e.which == 13) {
                           grid.toPage(e,$(this));
                       }
                   }).delegate('input[type="button"]', {
                       'click': function(e){grid.toPage(e,$(this))},
                       'reload': function (e) {
                           grid.toPage(e,$(this));
                       }
                   });

               grid.el.find('table.checkAll').delegate('tr td:first-child input:checkbox','change',function(){
                   if($(this).parents('thead').length > 0 || $(this).attr('id') === 'checkAll')
                       grid.onAllSelect($(this));
                   else
                       grid.onSelect($(this));
               });
           })
        }

    }())

    $('input#checkAll').show();
    $('.filterForm .formRow input[type="text"]').each(function(){
        if(!$(this)[0].maxLength || $(this)[0].maxLength >= 1024)
            $(this)[0].maxLength = 1024;
    });

    $('.dropdown-toggle').dropdown();
    $("ul.dropdown-menu").on("click", "[data-stopPropagation]",
        function (e) {
            e.stopPropagation();
        });

    $('[data-toggle]').live(
        'click',
        function (e) {
            var self = $(this);
            var dataToggle = self.attr("data-toggle");
            if (dataToggle == 'dropdown') {
                return;
            } else if (dataToggle == 'filter') {
                $('html, body').animate({
                    scrollTop: 0
                }, 200, 'linear');
            }
            if ($.browser.msie&&($.browser.version == "6.0")&&!$.support.style){
                if($('.' + dataToggle + 'Form').css('display') == 'block')
                    $('.datatable').css('margin-top','32px');
                else{
                    $('.datatable').css('margin-top','0');
                }
            }

            $('.' + dataToggle + 'Form').toggle().next('hr').toggle();

            var ico = $('span:last', self);
            ico.attr('class', ico.hasClass('i-down') ? 'ico i-up'
                : 'ico i-down');
            ico.hasClass('i-up') ? self.addClass('active') : self
                .removeClass('active');
            return false;
        }).each(
        function (idx, el) {
            var self = $(el);
            var ico = $('span:last', self);
            ico.hasClass('i-up') ? self.addClass('active') : self
                .removeClass('active');
        });

    $('a[type=reset]').live('click', function(e) {
        var targetEl = $(e.target),disabled = targetEl.attr('disabled'),formEl = targetEl.closest('form');

        if (disabled == 'disabled' || disabled == 'true') {
            return;
        }
        targetEl.attr('disabled', 'disabled');
        formEl.resetForm();
        formEl.trigger('reset');
        $.removeCookie($.getLocationPath() + '@sort');
        formEl.find('[type="submit"]').trigger('click');
        return false;
    });
	$('.filterForm .formRow input[type="text"]').each(function(){
			if(!$(this)[0].maxLength || $(this)[0].maxLength >= 1024)
				$(this)[0].maxLength = 1024;
	});

    // 屏蔽Ctrl+鼠标滚轮的放大功能
    var scrollFunc = function (e) {
        e = e || window.event;
        if (e.wheelDelta && event.ctrlKey) {// IE/Opera/Chrome
            event.returnValue = false;
        } else if (e.detail) {// Firefox
            event.returnValue = false;
        }
    };
    /* 注册事件 */
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollFunc, false);
    }// W3C
    window.onmousewheel = document.onmousewheel = scrollFunc;// IE/Opera/Chrome/Safari

    /* 保持browser组件的内容高度自适应 */
    $('.browser .wrapper > .col-main').resize(
        function () {
            var m = $('.main-wrap', this), mp = m.parent(), s = mp.siblings(
                '.col-sub'), e = mp.siblings('.col-extra'), height;
            $(this).css('height', 'auto');
            m.css("minHeight", 0);
            s.css("minHeight", 0);
            e.css("minHeight", 0);
            height = m.height();
            var maxheight = height > 400 ? height : 400;
            m.css("minHeight", 400);
            s.css("height", maxheight);
            e.css("height", maxheight);

            var hasTitle = s.find('h3').length > 0,
                $folder = s.find('.folder'),
                $scroller = s.find('.scrollable'),
                $container = $scroller.length > 0 ? $scroller : $folder.wrap('<div></div>').parent().addClass('scrollable'),
                $li = $folder.find('li.active'),
                idx = $folder.find('li').index($li),
                top = $li.length > 0 ? ($li.outerHeight() * idx) : 0;
            var realHeight = 0;
            if($li.length > 0){
            	for(var i =0 ;i < idx;i++){
            		realHeight += $folder.find('li')[i].clientHeight;
            	}
            	top = realHeight;
            }

            if(hasTitle) {
                $container.css({
                    'margin-top' : 30,
                    'height' : maxheight - 30
                });
            } else {
                $container.css({
                    'margin-top' : 0,
                    'height' : maxheight
                });
            }
            if($.fn.niceScroll) {
                var scroller = $container.niceScroll($folder,{horizrailenabled:false});
                scroller.lazyResize(0);
                setTimeout(function(){
                    scroller.doScrollPos(0, top);
                },0);
            } else {
                s.scrollTop(top);
            }
        }).trigger('resize');
    $('.autoIframe').resize(
        function () {
            var that = $(this).parents('.wrapper:first'), m = $(
                '.main-wrap', that), s = m.parent()
                .siblings('.col-sub'), e = m.parent().siblings(
                '.col-extra');
            m.css("minHeight", 0);
            s.css("minHeight", 0);
            e.css("minHeight", 0);
        });

    // ===== Breadcrumbs =====//
    $('.breadcrumbs').xBreadcrumbs();
   
    // Accordion
    $('.accordion[auto-parse!=false]').each(function (idx, acc) {
        setTimeout(function () {
            $('dl:not(.open) dd', acc).css({
                display: "none"
            });
            $('dd', acc).css({
                height: "auto"
            });
        }, 0);
        $('dt', acc).click(function () {
            $(this).parent().toggleClass('open');
            $(this).next('dd').toggle();
            return false;
        });
    });

    // 列表复选框操作
    function checkDataTable() {
        setTimeout(function () {
            $('table.checkAll').each(function (idx, table) {
                var ckaE = $('thead tr td:first-child input:checkbox', table);
                // CheckAll
                $('thead', table).delegate('tr td:first-child input:checkbox', 'change', function () {
                    var ckE = $('tbody tr td:first-child input:checkbox', table).not(':disabled');
                    $(this).attr('checked') == 'checked' ? ckE.attr('checked', 'checked').parents('tr').addClass('thisRow') : ckE.removeAttr('checked').parents('tr').removeClass('thisRow');
                });
                // CheckOne
                $('tbody', table).delegate('tr td:first-child input:checkbox', 'change', function () {
                    var trE = $(this).parents('tr'), ckE = $('tbody tr td:first-child input:checkbox', table), ckdE = $('tbody tr td:first-child input:checkbox:checked', table);
                    $(this).attr('checked') == 'checked' ? trE.addClass('thisRow') : trE.removeClass('thisRow');
                    if (ckE.length == ckdE.length) {
                        ckaE.attr('checked', 'checked');
                    } else {
                        ckaE.removeAttr('checked');
                    }
                });
                // Append
                $('tbody', table).bind('append',
                    function () {
                        ckaE.removeAttr('checked');
                    });
                // Remove
                $(table).bind('resize', function () {
                    if ($('tbody tr', table).length < 1)
                        ckaE.removeAttr('checked');
                });
            });
        }, 0);
    }

    if ($.browser.msie && parseInt($.browser.version) <= 8) {
        // 解决ie下，按钮中有span和i标签式，无法响应:active样式的替代方法（即：鼠标按下的效果）
        $('a[class*="button"],.controller a').live('mousedown mouseup mouseenter mouseleave', function (e) {
            if (e.type == "mousedown") {
                $(this).addClass('active');
            } else if (e.type == "mouseup" || e.type == "mouseleave") {
                $(this).removeClass('active');
            }
        });
    }
    // 美化datatable相关的代码，可以重用于Ajax加载的table
   function activeDataTable() {
        // IE Hacks
        if ($.browser.msie && parseInt($.browser.version) <= 8) {
            // 解决ie下，表格奇偶行样式
            function fixTableLine(ct) {
                var ctn = ct || ".datatable,.rows";
                var $ct = $(ctn);
                $('tr,.row', $ct).removeClass('even last');
                $('tr:nth-child(even),.rows .row:nth-child(odd)', $ct).addClass('even');
                $('tr:last-child', $ct).addClass('last');
            }

            fixTableLine();

            // 对table和rows的增、删动作的监听，调整奇偶行样式
            $('.datatable table tbody, .rows').unbind('resize.datatable').bind('resize.datatable', function () {
                fixTableLine(this);
            });
            // 解决ie下，省略号的宽度问题
            $('.datatable tbody .maxwidth').$each(function (idx, ellipsis) {
                if (ellipsis.hasClass('small') && ellipsis.width() >= 70)
                    ellipsis.css('width', '70');
                if (ellipsis.width() >= 200)
                    ellipsis.css('width', '200');
            });

        }
    }
    $.checkDataTable = checkDataTable;
    $.activeDataTable = activeDataTable;
    $.checkDataTable();
    if (!$('[data-noactive]').length) {
    	$.activeDataTable();
    }
});
