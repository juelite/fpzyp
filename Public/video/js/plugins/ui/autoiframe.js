// 跨域iframe自适应高度解决方案
(function() {
	var adaptFrame = new function() {
		var doc = document, body = doc.body, self = this,
		// 获取url中的参数
		getRequest = function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"), r = window.location.search.substr(1).match(reg);
			return (r != null) ? unescape(r[2]) : null;
		},
		// 获取配置，script的优先级大于url中的参数
		getConfig = function() {
			// scripts对象一定要在这里赋值，不然取不到正确的script对象
			var scripts = doc.getElementsByTagName('script'), script = scripts[scripts.length - 1];
			return function(param) {
				var p = script.getAttribute(param);
				return p ? p : getRequest(param);
			};
		}(),
		// 代理高度
		proxyheight = 0,
		// top页frame的id
		frameid = getConfig("data-frameid"),
		// 监听实时更新高度间隔
		timer = getConfig("data-timer"),
		// 获取代理的url
		getProxyuUrl = getConfig("data-proxy"),
		// 创建代理的iframe
		proxyframe = function() {
			var el = doc.createElement("iframe");
			el.style.display = "none";
			el.name = "proxy";
			return el;
		}();
		// 重置高度
		this.resize = function() {
			proxyheight = $('.wrapper:first').css('height','auto').height();
			proxyframe.src = getProxyuUrl + "?data-frameid=" + frameid + "&data-frameheight=" + (proxyheight);
		};
		this.init = function() {
			var init = function() {
				body.appendChild(proxyframe);
				self.resize();
				// 是否update
				if (!isNaN(timer)) {
					timer = timer < 200 ? 200 : timer;
					window.setInterval(function() {
						if ($('.wrapper:first').css('height','auto').height() != proxyheight) {
							self.resize();
						}
					}, timer);
				}
			};
			// 如果引入KISSY，建议改成：KISSY.ready(function(){init();});
			if (doc.addEventListener) {
				window.addEventListener("load", init, false);
			} else {
				window.attachEvent("onload", init);
			}
		}
	};
	adaptFrame.init();
})();
