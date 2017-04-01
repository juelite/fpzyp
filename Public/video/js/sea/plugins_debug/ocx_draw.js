define('./ocx_draw', ['./ocx_preview'], function(require, exports) {
	var Ocx_preview = require('./ocx_preview');

	return Ocx_preview.extend({
		drawType : null,
		SetBarVisible : function(v) {
			this.ocxEl[0].SetBarVisible(v);
		},
		StartDrawHideAlr : function() {
			this.drawType = 2;
			this.ocxEl[0].StartDrawHideAlr();
		},
		StartDrawMotion : function() {
			this.drawType = 1;
			this.ocxEl[0].StartDrawMotion();
		},
		SetEncrypt: function(noMeaning) {
			this.ocxEl[0].SetEncrypt(noMeaning);
		},
		ClearGrid : function() {
			this.ocxEl[0].ClearGrid();
		},
		SetXML : function(v) {
			if (this.drawType == 1) {
				this.SetMotionXML(v);
			} else if (this.drawType == 2) {
				this.SetHideAlrXML(v);
			}
		},
		GetXML : function() {
			if (this.drawType == 1) {
				return this.GetMotionXML();
			} else if (this.drawType == 2) {
				return this.GetHideAlrXML();
			}
		},
		GetToGetAreaValue : function($xml) {
			if (this.drawType == 1) {
				return $xml.find('ConfigXML>MOTIONAREACFG>AREAS').xml();
			} else if (this.drawType == 2) {
				return $xml.find('ConfigXML>HIDEALARMAREACFG').xml();
			}
		},
		GetToSetAreaValue : function($xml, value) {
			if (this.drawType == 1) {
				var $areasXml = $xml.find('ConfigXML>MOTIONAREACFG>AREAS');
				var $parentXml = $areasXml.parent();
				$areasXml.remove();
				$value = $($.parseXML(value)).find('AREAS');
				$parentXml.append($value);
				return $parentXml.xml();
			} else if (this.drawType == 2) {
				$value = $($.parseXML(value)).find('HIDEALARMAREACFG');
				return $value.xml();
			}
		},
		SetMotionXML : function(v) {
			this.ocxEl[0].SetMotionXML(v);
		},
		GetMotionXML : function() {
			return this.ocxEl[0].GetMotionXML();
		},
		GetHideAlrXML : function() {
			var v = this.ocxEl[0].GetHideAlrXML();
			var $v = $($.parseXML(v));
			$v.find('HIDEALARMAREACFG>AREARECT>*').each(function(i, el) {
				var $el = $(el);
				var text = $el.text();
				if ($.isNumeric(text)) {
					$el.text(parseInt(parseInt(text) / 2));
				}
			});
			return $v.xml();
		},
		SetHideAlrXML : function(v) {
			var $v = $($.parseXML(v));
			$v.find('HIDEALARMAREACFG>AREARECT>*').each(function(i, el) {
				var $el = $(el);
				var text = $el.text();
				if ($.isNumeric(text)) {
					$el.text(parseInt(text) * 2);
				}
			});
			this.ocxEl[0].SetHideAlrXML($v.xml());
		}
	});
});
