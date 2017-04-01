(function() {
	$.extend($.ui.spinner._proto, {
		_parseValue: function() {
			var value = this.element.val();
			
			if(this.element.attr('data-type') == 'time'){
				var array = value.split(":");
				if(array.length == 3){
					value = parseInt(array[0],10)*3600 + parseInt(array[1],10)*60 + parseInt(array[2],10);
					value = value.toString();
				}	
			}
			return value ? this.options.parse(value, this.element) : null;
		},
		_setValue: function(value, suppressFireEvent) {
			var self = this;

			self.curvalue = value = self._validate(value);
			
			var trueValue = (value != null ?self.options.format(value, self.places, self.element) :'');
			
			
			if(this.element.attr('data-type') == 'time'){
				if(trueValue == ''){
					self.element.val('00:00:00');
					self.element.attr('data-value',0);
				}else{
					var num = parseInt(trueValue,10);
					var hour = Math.floor(num / 3600);
					var minutes =Math.floor(( num % 3600 ) / 60);
					var seconds = num - 3600*hour - 60*minutes;
					
					var str = '';
					if(hour.toString().length < 2){
						str += '0' + hour + ":";
					}else{
						str += hour.toString() + ":";
					}
					if(minutes.toString().length < 2){
						str += '0' + minutes + ":";
					}else{
						str += minutes.toString() + ":";
					}
					if(seconds.toString().length < 2){
						str += '0' + seconds;
					}else{
						str += seconds.toString();
					}
					self.element.val(str);
					self.element.attr('data-value',num);
				}
			}else{
				self.element.val(trueValue);
			}
			if (!suppressFireEvent) {
				self.selfChange = true;
				self.element.change();
				self.selfChange = false;
			}
	}
	});
	

})();
