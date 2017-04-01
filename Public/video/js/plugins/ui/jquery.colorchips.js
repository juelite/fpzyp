/*
 * 颜色选择器
 * created by Nick.liufc 2013-11-11
 * @colors: array, 颜色数组，包含4个值：color,textColor,backgroundColor,borderColor
 * @color: string, 初始颜色，需要与colors中的值匹配
 * @amount: int, 颜色变亮（或变暗）的差值，textColor,backgroundColor,borderColor相对于color的值
 * */
(function($) {
	var defaults = {
		colors: [{color:"#660000",textColor:"#FFFFFF"},{color:"#990000",textColor:"#FFFFFF"},{color:"#cc0000",textColor:"#FFFFFF"},{color:"#cc3333",textColor:"#FFFFFF"},{color:"#ea4c88",textColor:"#FFFFFF"},{color:"#993399",textColor:"#FFFFFF"},{color:"#663399",textColor:"#FFFFFF"},{color:"#333399",textColor:"#FFFFFF"},{color:"#0066cc",textColor:"#FFFFFF"},{color:"#0099cc",textColor:"#FFFFFF"},{color:"#66cccc",textColor:"#FFFFFF"},{color:"#d7e8c4",textColor:"#39670F",borderColor:"#C9E3B3"},{color:"#77cc33",textColor:"#FFFFFF"},{color:"#669900",textColor:"#FFFFFF"},{color:"#336600",textColor:"#FFFFFF"},{color:"#666600",textColor:"#FFFFFF"},{color:"#999900",textColor:"#FFFFFF"},{color:"#cccc33",textColor:"#FFFFFF"},{color:"#ffff00",textColor:"#663300",borderColor:"#FFCC33"},{color:"#ffcc33",textColor:"#663300",borderColor:"#FF9900"},{color:"#ff9900",textColor:"#663300",borderColor:"#FF9900"},{color:"#ff6600",textColor:"#FFFFFF"},{color:"#cc6633",textColor:"#FFFFFF"},{color:"#996633",textColor:"#FFFFFF"},{color:"#663300",textColor:"#FFFFFF"},{color:"#333333",textColor:"#FFFFFF",backgroundColor:"#333333",borderColor:"#000000"},{color:"#999999",textColor:"#FFFFFF",borderColor:"#666666"},{color:"#cccccc",textColor:"#333333",borderColor:"#999999"},{color:"#ffffff",textColor:"#333333",borderColor:"#cccccc"}],
		color: "#E7FFD1",
		amount: 20
	};
	function colorChips(element, config) {
		var options = $.extend({}, defaults, config);

		var colors = options.colors;
		var color = options.color;
		var amount = options.amount;
		if($.isArray(colors) && colors.length > 0) {
			var $element = $(element);
			if($element.is('ul')) {
				if(!$element.hasClass('color-chips')) {
					$element.addClass('color-chips clearfix');
				}
			} else {
				$element = $element.append('<ul></ul>').addClass('color-chips clearfix');
			}
			var html = [];
			$.each(colors, function(idx, item){
				item.textColor = typeof(item.textColor) == "string" ? item.textColor : LightenDarkenColor(item.color, -amount);
				item.backgroundColor = typeof(item.backgroundColor) == "string" ? item.backgroundColor : LightenDarkenColor(item.color, amount);
				item.borderColor = typeof(item.borderColor) == "string" ? item.borderColor : LightenDarkenColor(item.color, -amount);
				html.push('<li class="color', ((color !== null && color == item.color) ? " active" : ""),'"><a href="javascript:void(0);" style="background-color:', item.color, '; border-color:', typeof(item.borderColor) == "string" ? item.borderColor : LightenDarkenColor(item.color, item.borderColor), '" title="', item.color, '"');
				html.push(' color="', item.color, '"');
				html.push(' textColor="', item.textColor, '"');
				html.push(' backgroundColor="', item.backgroundColor, '"');
				html.push(' borderColor="', item.borderColor, '"');
				html.push('></a><s class="ico"></s></li>');
			});
			$element.append(html.join(''));
			$element.find('li').$each(function(idx, oli) {
				oli.on("mouseover", function() {
					if ($(this).hasClass("active")) {
						return;
					}
					$(this).addClass("hover");
				})
				.on("mouseout", function() {
					$(this).removeClass("hover");
				})
				.on("click", function() {
					var $this = $(this);
					if($this.hasClass('active')) {
						$this.removeClass('active');
					}else{
						$element.find('li').removeClass('active');
						$this.addClass('active');
					}
				});
			});
		}
	}
	function getColor(element, type) {
		var rtype = type || "object";
		var $element = $(element[0]).find('li.active a');
		if($element.length < 1) {
			$element = $(element[0]).find('li a[color=' + defaults.color + ']');
		}
		var color = $element.attr('color');
		var textColor = $element.attr('textColor');
		var backgroundColor = $element.attr('backgroundColor');
		var borderColor = $element.attr('borderColor');
		var obj = {};
		switch(rtype) {
			case "object" :
				obj.color = color;
				obj.textColor = textColor;
				obj.backgroundColor = backgroundColor;
				obj.borderColor = borderColor;
				break;
			case "string" :
				obj = "";
				obj += color + ",";
				obj += textColor + ",";
				obj += backgroundColor + ",";
				obj += borderColor;
				break;
			case "array" :
				obj = [];
				obj.push(color);
				obj.push(textColor);
				obj.push(backgroundColor);
				obj.push(borderColor);
				break;
		}
		return obj;
	}
    //对颜色进行亮度调节
	function LightenDarkenColor(col, amt) {
		var usePound = false;
		if (col[0] == "#") {
			col = col.slice(1);
			usePound = true;
		}
		var num = parseInt(col,16);
		var r = (num >> 16) + amt;

		if (r > 255) r = 255;
		else if  (r < 0) r = 0;

		var b = ((num >> 8) & 0x00FF) + amt;

		if (b > 255) b = 255;
		else if  (b < 0) b = 0;

		var g = (num & 0x0000FF) + amt;

		if (g > 255) g = 255;
		else if (g < 0) g = 0;

		var val = (g | (b << 8) | (r << 16)).toString(16);
		var len = val.length;
		if(len < 6) {
			for(var i = 0; i < 6 - len; i++) {
				val = "0" + val;
			}
		}
		return (usePound?"#":"") + val;
	}
	$.fn.colorChips = function(config) {
			if(typeof(config) == "string") {
				if(config == "color") {
					return getColor(this);
				}else if(config == "colorString") {
					return getColor(this,"string")
				}else if(config == "colorArray") {
					return getColor(this,"array")
				}
			} else {
                return this.each(function(){
                    colorChips(this, config);
                });
            }
	};
})(jQuery);