// JavaScript Document

(function () {
	if (!$.grid) {
		return;		
	}
	
	$.extend(($.grid.lag = {}), {
		pager: {
			pgtext: '{0} \u5171 {1} \u9875',
			recordtext: "{0} \u5171 {1} \u6761"
		},
		loading: '正在加载中...'
	})
})()