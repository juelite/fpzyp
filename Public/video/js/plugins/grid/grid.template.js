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
    	pageCss : 'pagination' ,
        jumpCss : 'input.jumpTo'
    	
    };
    
    var utils = _model.require('utils');
    gridTemplate.prototype = {
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
            var value = 'DESC',opt = this.options,sortUpCss=opt.sortUpCss,orderMap = null;
            if (targetEl.hasClass(sortUpCss)) {
                value = 'ASC';
            }
            orderMap = mapping + ':' + value;
            $.cookie(utils.getLocationPath() + '@sort', orderMap);
            utils.history(document.location.href);
        },
        render : function(el){
        	var opt = this.options,sortCss = opt.sortTd,sortObj = el.find(sortCss);
            if (!sortObj.length) {
                return;
            }
            var sortValue = $.cookie( utils.getLocationPath() + '@sort'),sortSplit = [],
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
            	pNo = opt.pageProperty.pageNo, pTotal = opt.pageProperty.totalPage,pCss = opt.pageProperty.pageCss;
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
            utils.submitHistory(formEl);
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


$(function(){
    var grid = new gridTemplate('.datatable'),opt = grid.options,sortTd = opt.sortTd ;
    grid.el.delegate(sortTd, 'click',function(e){
    	grid.sort(e,$(this));
   	});

    grid.el.find('.pagination[autoJump!="false"]').delegate('a[disabled!="disabled"]','click', function(e){
        grid.toPage(e,$(this))
    }).delegate('select', 'change', function(e){grid.toPage(e,$(this))}).delegate(
                'input[type="text"]', 'keypress',function (e) {
                    if (e.which == 13) {
                        grid.toPage.call($(this),e);
                    }
                }).delegate('input[type="button"]', {
                    'click': function(e){grid.toPage(e,$(this))},
                    'reload': function (e) {
                       grid.toPage.call($(this), e);
                    }
                });

    grid.el.find('table.checkAll').delegate('tr td:first-child input:checkbox','change',function(){
       if($(this).parents('thead').length > 0 || $(this).attr('id') === 'checkAll')
            grid.onAllSelect($(this));
       else
            grid.onSelect($(this));
   });

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
            $.removeCookie( utils.getLocationPath() + '@sort');
            formEl.find('[type="submit"]').trigger('click');
        return false;
    });
});