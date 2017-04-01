$(function() {
	(function() {
		var framesArray = null;
		$.hideNav = function() {
			$('#content>.breadLine').hide();
		};
		function getMenu(menuCode) {
			var $menu;
			if (menuCode == null || menuCode === 0) {
				$menu = $('#navbar li.active a:first');
			} else {
				$menu = $('#navbar a[menucode="' + menuCode + '"]:first');
				if (!$menu.length) {
					$menu = getMenu(0);
				}
			}
			return $menu;
		}

		$.topNav = function(menuCode, $html, frames) {
            if(eventsManage){
                try {
                eventsManage.trigger('positions',menuCode.html(),menuCode.attr('menu-code'),$html);
                } catch(e) {}
                return;
            }
			setTimeout(function() {
				try {
					if (menuCode != null && menuCode.context != null) {
						$.topNav(menuCode.attr('menu-code'), menuCode, $html);
						return;
					}
					if ($html == null || $html == '') {
						$html = '<UL class="breadcrumbs"></UL>';
					}
					if ($html.context == null) {
						$html = $($html);
					}
					framesArray = frames;
					$html.find('a').each(function(i, a) {
						a.setAttribute('_href', a.getAttribute('href'));
						a.setAttribute('href', 'javascript:void(0);');
						a.setAttribute('frames', frames.join(','));
					});
					var $menu = getMenu(menuCode);
					if ($menu.length) {
						var $liEl = $menu.parent('li');
						
						while ($liEl.length) {
							if (!$html.find('li').length) {
								var $cloneEl = $liEl.clone();
								if(!$cloneEl.html($cloneEl.find('a').html())[0].outerHTML){
									$html.html($cloneEl.html($cloneEl.find('a').html()));
								}else{
									$html.html($cloneEl.html($cloneEl.find('a').html())[0].outerHTML);
								}
								
							} else {
								if(!$liEl.clone()[0].outerHTML){
									$html.prepend($liEl.clone());
								}else{
									$html.prepend($liEl.clone()[0].outerHTML);
								}
							}
                            $html.find('.ddmenu').remove();
							$liEl = $liEl.parent('ul').closest('li');
						}
					}
					var $top = $('#top .topNav>li.active');
					if ($top.length) {
						if(!$top.clone()[0].outerHTML){
							$html.prepend($top.clone());
						}else{
							$html.prepend($top.clone()[0].outerHTML);
						}
						
					}
					var $lastLiEl = $html.find('li:last');
					if ($lastLiEl.length > 0 && $lastLiEl.find('a').length > 0) {
						$lastLiEl.html($lastLiEl.find('a').html());
					}
					
					if(pt && (pt.lang === 'zh_cn')){
					$html.find('li span').each(function(idx, item){
                        var text = $(item).text();
                        if(text.length > 14) {
                            $(item).text(text.substring(0,14) + "…");
                        }
                    });
					}
					if(!$html[0].outerHTML){
						$('#content>.breadLine').html($html).show();
					}else{
						$('#content>.breadLine').html($html[0].outerHTML).show();
					}
					
					//这里实现面包屑修改后，同时修改菜单的选中状态。
					//为了解决点击ie回退按钮的时候，菜单同步修改
					//by huanghuafeng
					var $mainNav = $('#navbar .mainNav');
					$mainNav.find('.nav > li').removeClass('active');
					var ddmenu = $menu.parents('.ddmenu');
					if(ddmenu.length){
						$menu.parents('.ddmenu').parent().addClass('active');
					}else{
						$menu.parent().addClass('active');
					}
				} catch (e) {
				}
			}, 0);
		};

		$('#content>.breadLine>ul.breadcrumbs>li>a').live('mousedown', function() {
			var href = this.getAttribute('_href');
			if (!href) {
				return true;
			}
			var frame = window;
			
			var forceFrame = this.getAttribute('forceFrame');
			var strframes = null;
			var force = false;
			if(forceFrame){
				frame =  frame.frames[forceFrame];
				if(!frame){
					frame = window.frames['mainFrame'].frames[forceFrame];
				}
			}else{
				strframes= this.getAttribute('frames');
			}
			
			if (strframes) {
				var framesArray = this.getAttribute('frames').split(',');
				if (framesArray != null) {
					for ( var i = framesArray.length; i > 0; i--) {
						if(!frame.frames[framesArray[i - 1]]) //防止页面缓存不存在的iframe
							continue;
						frame = frame.frames[framesArray[i - 1]];
					}
				}
			}

			var target = this.getAttribute('target');
			target && (frame.location.target = target);
			frame.location.href = href;
			frame.location.target = null;
			return false;
		});

	})();

    var scrollFunc = function(e) {
        e = e || window.event;

        if ((e.wheelDelta || e.detail) && e.ctrlKey) {// firefox支持e.detail，其他e.wheelDelta
            e.preventDefault();
            e.returnValue = false;
        }
    };
    /*
     * firefox 支持DOMMouseScroll事件，其他支持mousewheel
     */
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollFunc, false);
    }
    window.onmousewheel = document.onmousewheel = scrollFunc;

	// Breadcrumbs
	$('.breadcrumbs').xBreadcrumbs();

	// 下拉菜单状态更新
	(function() {
		var $mainNav = $('#navbar .mainNav'), $secNav = $('#navbar .secNav');
		toggleNavbar($mainNav);
		toggleNavbar($secNav);
		function toggleNavbar(container) {
			if (container.length) {
                if($.browser.msie < 8) {
				container.delegate('.nav > li', 'mouseenter', function(){
                        $(this).addClass('hover');
                    })
                    .delegate('.nav > li', 'mouseleave', function(){
                        $(this).removeClass('hover');
                    });
                }
                container.delegate('.nav > li > a', 'click', function() {
                        if ($(this).attr('autoactive') != "false") {
                            active(container, $(this));
                        }
				});
				container.delegate('.ddmenu li a', 'click', function() {
					if ($(this).attr('autoactive') != "false") {
						active(container, $(this).parents('.ddmenu'));
					}
				});
				// 框架下拉菜单的bgiframe
				if ($.fn.bgiframe) {
					$('.ddmenu', container).bgiframe();
				}
			}
		}
		function active(container, element) {
			container.find('.nav > li').removeClass('active');
			element.parent().addClass('active');
		}
	})();

	// Tooltips
	/*$('.tipS').tipsy({
		gravity : 's',
		html : true
	});*/

	if ($('#subNav').length > 0) {
		$('#subNav a').click(function() {
			var url = $(this).attr('href'), target = $(this).attr('target');
			$('iframe[name="' + target + '"]').attr('src', url);
			$('#subNav li').removeClass('active');
			$(this).parent().addClass('active');
			return false;
		});
	}
});

/*window.dialog = function(option, frames,_href) {
	option = option || {};
	var el = null;
	if (option.iframeSrc) {
		if (option.iframeSrc.indexOf('/') != 0 && option.iframeSrc.indexOf('http://') != 0) {
			var baseEl = $('base');
			var baseHref = baseEl.length ? baseEl.attr('href') : '';
			option.iframeSrc = baseHref + option.iframeSrc;
		}
		el = $([
				'<div class="dialog" name="', option.id,'" parentSrc="',_href,'" style="padding:0;overflow:hidden;"><div class="loading-overlay"><div class="loading-m"><i></i><span>'+language.text("loading")+'</span></div><div class="shadow"></div></div><iframe src="',
				option.iframeSrc, '" dialogIframe="true" frameborder="0" scrolling="auto" class="autoIframe dialog-frame"></iframe></div>' ].join(''));
		if (option.id) {
			el.find('iframe').attr({
				id : option.id,
				name : option.id
			});
		}
		el.appendTo('body');
		el.find('iframe')[0].contentWindow.name = option.id;
		el.find('iframe').on('load', function() {
			el.find('.loading-overlay').hide();
			option.load && option.load(window.frames[option.id].$.callback);
		});
	} else if (option.ajax) {
		el = $('<div class="dialog"></div>').appendTo('body');
		if (option.id) {
			el.attr('id', option.id);
		}
		if (option.ajax.url.indexOf('/') != 0 && option.ajax.url.indexOf('http://') != 0) {
			var baseEl = $('base');
			var baseHref = baseEl.length ? baseEl.attr('href') : '';
			option.ajax.url = baseHref + option.ajax.url;
		}
		var success = option.ajax.success;
		option.ajax.success = function() {
			var result = success && success.apply(this, arguments);
			option.load && option.load();
			return result;
		};

		el.load(option.ajax.url);
	} else if (option.el) {
        /*
        * TODO: 临时的解决办法，应该找出不能使用$(option.el).clone的原因
        * 初步排查的原因为option.el不是当前页面jquery的对象
        */
        //el = $($(option.el).get(0)).clone();
        /*el = option.el[0] ? $(option.el[0].outerHTML) : $([]);
        el.appendTo('body');
	} else {
		return;
	}

	var close = option.close;
	option.close = null;
	delete option.close;
	option = $.extend({
		autoOpen : true,
		modal : true,
		frames : frames,
		resizable : false,
		width : 500,
		height : 500,
		close : function() {
			top.iframeOn_El = null;
			el.find('iframe').attr('src', /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank');
			if (close && option.maybeRefresh) {
				var frames = option.frames;
				var frame = window;
				for ( var i = frames.length; i > 0; i--) {
					if(!frame.frames[frames[i - 1]]) //防止页面缓存不存在的iframe
							continue;
					frame = frame.frames[frames[i - 1]];
				}
				var callback = window.frames[option.id];
				if (callback.$) {
					callback = callback.$;
					if (callback.callback) {
						callback = callback.callback;
					}
				}
				(function(frame, callback) {
					var f = new frame.Function('var t = ' + close.toString() + ';return t.apply(this,arguments);');
					f.call(this, callback);
				}(frame, callback));
			} else {
				close && close.apply(this, arguments);
			}
			el.remove();
			el = null;
		}
	}, option);
	top.iframeOn_El = el;
	return el.dialog(option);
};     */

// Loader 动态加载组件
var loader = (function($,loader) {
	return {
		show : function(title, callback) {
			var text = title || language.text('loading');
			var html = $('<div id="loaderTop" class="loading-overlay"><div class="loading-m"><i></i><span>' + text + '</span></div><div class="shadow"></div></div>');
			if ($('#loaderTop').length > 0)
				$('#loaderTop').remove();
			$('body').append(html);
			if ($.fn.bgiframe) {
				$("#loaderTop").bgiframe();
			}
			var w = $('.loading-m', html).outerWidth(), ml = parseInt(w) / 2, h = $('.loading-m', html).outerHeight(), mt = parseInt(h) / 2;
			$('.loading-m', html).css({
				marginTop : '-' + mt + 'px',
				marginLeft : '-' + ml + 'px'
			});
			try {
				if (callback)
					callback();
			} catch (e) {
			}
		},
        update : function(title){
            $('#loaderTop .loading-m span').text(title);
        },
		hide : function(callback) {
			$('#loaderTop').fadeOut('fast', function() {
				$(this).remove();
				try {
					if (callback)
						callback();
				} catch (e) {
				}
			});
		}
	}
})(jQuery, loader || {});

// Progress 动态加载组件
var progress = (function($,progress) {
	return {
		show : function(percent, elapsed, callback) {
			var elapsed = elapsed || language.text('loading');
			var percent = percent || 0;
			var html = $('<div id="progressTop" class="progress-overlay"><div class="progress-m"><div class="progressbar"><div class="progress progress-small progress-info"><div class="filler"><div class="bar" style="width:'
					+ percent
					+ '%"> </div></div></div><div class="percent"><b>'
					+ percent
					+ '%</b></div><div class="elapsed">'
					+ elapsed
					+ '</div><div class="actions clear" style="display:none;"><a id="btn_progress_hide" href="javascript:void(0);" class="buttonS bBlue">'+ language.text('ui.progress.runBack')+'</a></div></div></div><div class="shadow"></div></div>');
			if ($('#progressTop').length > 0)
				$('#progressTop').remove();
			$('body').append(html);
			if ($.fn.bgiframe) {
				$("#progressTop").bgiframe();
			}
			if (callback)
				callback();
		},
		update : function(percent, elapsed, callback) {
			$('#progressTop .bar').css('width', percent + '%');
			$('#progressTop .percent b').text(percent + '%');
			$('#progressTop .elapsed').text(elapsed);
			if (callback)
				setTimeout(function() {
					callback();
				}, 1000);
		},
		showButton : function(callback) {
			var self = this;
			$('#progressTop .actions').show('fade');
			$('#btn_progress_hide').on('click', function() {
				self.hide(callback);
			});
		},
		hide : function(callback) {
			$('#progressTop').fadeOut('slow', function() {
				$(this).remove();
				if (callback)
					callback();
			});
		}
	}
})(jQuery, progress || {});