// 创建一个闭包
(function($) {
	// 插件的定义
	$.fn.captcha = function(options, callback) {

		var opts = $.extend({}, $.fn.captcha.defaults, options);

		if($.isFunction(callback)) { callback = callback; } else { callback = null; }
		return this.each(function() {
			Captcha(this, opts.url, callback);
		});
	};

	function Captcha(obj, url, callback) {
		$(obj).click(function(){
			getimg(obj, url, callback);
		});
		return obj;
	}
	// 私有函数：获取图片
	function getimg(obj, url, callback) {
		$.ajax({
			type: "GET",
			url: url,
			success: function(data) {
				changeimg(obj,data.src);
				if(callback)callback(data);
			}
		});
	}
	// 私有函数：刷新图片
	function changeimg(imgObj,imgSrc) {
		var imgObj = $(imgObj);
		imgObj.attr("src", chgUrl(imgSrc));
		//时间戳
		//为了使每次生成图片不一致，即不让浏览器读缓存，所以需要加上时间戳  
		function chgUrl(url) {
			var timestamp = (new Date()).valueOf();
			urlurl = url.substring(0, 17);
			if ((url.indexOf("?") >= 0)) {
				urlurl = url + "&t=" + timestamp;
			} else {
				urlurl = url + "?t=" + timestamp;
			}
			return urlurl;
		}
	}

	//默认属性
	$.fn.captcha.defaults = {
		url: ""
	};


// 闭包结束
})(jQuery);