define('./swf_schedule', ['./active_x_swf'], function(require, exports, module) {
	var Active_x_swf = require('./active_x_swf');

	return Active_x_swf.extend({
		mode : 3,
		version : 2,
		num : 7,
		maxBoard : 4,
		useMinTimeCell : false,
		minTimeCell : 30,
		constructor : function(opt) {
			this.base(opt, ['hikui-schedule'], [{
							name : 'mode',
							type : 'int'
						}, {
							name : 'num',
							type : 'int'
						}, {
							name : 'maxBoard',
							type : 'int'
						}, {
							name : 'useMinTimeCell',
							type : 'boolean'
						}, {
							name : 'minTimeCell',
							type : 'int'
						}]);
			var self = this;
			self._resize = function(e, a, c, d, v) {
				self._value = self.getValue();
				self.width = self.el.width();
				self.height = self.el.height();
				$('#_flash_' + self.id).width(self.width);
			};
			this.el.resize(self._resize);
		},

		alert : function(type) {
			var copyUnSelect = 'copyUnSelect';
			var deleteUnSelect = 'deleteUnSelect';
			var canDayDuplicated = 'canDayDuplicated';
			if (type == copyUnSelect)
				jAlert(language.text('shedule.copy'), language.text('dialog.info'), 'attention');
			else if (type == canDayDuplicated) {
				jAlert(language.text('shedule.special.error'), language.text('dialog.info'), 'attention');
			} else {
				jAlert(language.text('shedule.delete'), language.text('dialog.info'), 'attention');
			}
		},
		setTypeColor : function(type, color) {
			return this.findSWF().setTypeColor(type, color);
		},

		getLibPath : function() {
			return Active_x_swf.SWF_URL + '/schedule';
		},
		getBarVisibled : function() {
			return false;
		},
		getStyleName : function() {

			return 'style_' + (typeof pt != 'undefined' ? pt.lang||'zh_cn'  : 'zh_cn') + '.css';
		},
		init : function() {
			
			if (this.mode == 1 || this.mode == 2) {
				this.num = 1;
			}
			if (this.useMinTimeCell) {
				this.findSWF().setMinTimeCell(this.minTimeCell);
			}
            var oldValue = '<data/>';
            try{
                oldValue = this.findSWF().getValue()
            }catch(e){
                console.info('schedule getValue wrong:' + this._value);
            }
			this.setModleMode(this.mode, this.num);
			if (!this._tirggerInit) {
				this.el.trigger('init', this);
				this.trigger('init', this);
			} else {
                try{
                    if(oldValue != '' &&  oldValue != '<data/>')
                        this.setValue(oldValue);
                    else
                        this.setValue(this._value);
                }catch(e){
                    console.info('schedule setValue wrong:' + this._value);
                }
			}
			this._tirggerInit = true;

		},
		render : function() {
			this.params = {
				bgcolor : "#F7F9E8"
			}
			this.base(this.getLibPath() + '/main.swf?date=' + new Date());
			if ($.browser.msie && this.ocxEl.attr('classid') == null) {
				throw new Error('no classid');
			}

		},
		setModleMode : function(mode, num) {
			this.mode = mode || this.mode;
			this.num = num || this.num;
			return this.findSWF().setModleMode(this.mode, this.num);
		},
		setValue : function(value) {
			this._value = value;
			return this.findSWF().setValue(value);
		},
		btnHandle : function(name) {
			var result = this.findSWF().btnHandle(name);
			this._value = this.findSWF().getValue();
			return result;
		},
		getValue : function() {
			return this.findSWF().getValue();
		},
		setSpecialDayChecked : function(value) {
			return this.findSWF().setSpecialDayChecked(value);
		},
		getCheckedDay : function() {
			return this.findSWF().getCheckedDay();
		},
		setStickStyle : function(style) {
			return this.findSWF().setStickStyle(style);
		},
		selectTimes : function(id, sTime, eTime) {
			this._selectId = this._selectId || {};
			this._selectId.id = id;
			function toString(n) {
				n = parseInt(n);
				if (n < 10) {
					return "0" + n;
				}
				return n.toString();
			}

			var mod = 60 / 1;
			function handleT(n) {
				return toString(n / mod) + ':' + toString((1) * (n % mod));
			}
			var self = this;
			var startTime = handleT(sTime);
			$('#startTime_value').text(startTime);
			var startH = parseInt(sTime / mod);
			var startm = parseInt((1) * (sTime % mod));

			var endTime = handleT(eTime);
			$('#endTime_value').text(endTime);
			var endH = parseInt(eTime / mod);
			var endm = parseInt((1) * (eTime % mod));

			function handleDv(text, _) {
				var split = text.split(':');
				var h = parseInt(split[0]), m = parseInt(split[1]);
				if (_ == 0) {
					if (m == 0) {
						h--;
						m = 59;
					} else {
						m--;
					}
				} else if (_ == 1) {
					if (m == 59) {
						h++;
						m = 0;
					} else {
						m++;
					}
				}
				return h + ":" + m;
			}
			function startChange(sdp) {
				$('#startTime_value').text(sdp.cal.getNewDateStr());
				var dp = self.endDp;
				var cal = dp.cal;
				var minDate = $('#startTime_value').text();
				minDate = handleDv(minDate, 1);
				cal.minDate = cal.doCustomDate(minDate, minDate != dp.defMinDate ? dp.realFmt : dp.realFullFmt, dp.defMinDate);

				startH = sdp.cal.date.H;
				startm = sdp.cal.date.m;
				self._startSv('H', startH);
				self._startSv('m', startm);
			}
			function endChange(edp) {
				$('#endTime_value').text(edp.cal.getNewDateStr());
				var dp = self.startDp;
				var cal = dp.cal;
				var maxDate = $('#endTime_value').text();
				maxDate = handleDv(maxDate, 0);
				cal.maxDate = cal.doCustomDate(maxDate, maxDate != dp.defMaxDate ? dp.realFmt : dp.realFullFmt, dp.defMaxDate);
				endH = edp.cal.date.H;
				endm = edp.cal.date.m;
				self._endSv('H', endH);
				if (endH == 24) {
					self._endSv("m", 0);
					self._endD["mI"].disabled = true;
				} else {
					self._endD["mI"].disabled = false;
				}
				self._endSv('m', endm);
			}
			function doInit() {
				if (self == null || self._startSv == null) {
					return;
				}
				self._startSv('H', startH);
				self._startSv('m', startm);

				var cal = self.startDp.cal;
				var dp = self.startDp;
				var minDate = startTime;
				cal.minDate = cal.doCustomDate(minDate, minDate != dp.defMinDate ? dp.realFmt : dp.realFullFmt, dp.defMinDate);

				startChange(dp);
				self._endSv('H', endH);
				if (endH == 24) {
					self._endSv("m", 0);
					self._endD["mI"].disabled = true;
				} else {
					self._endD["mI"].disabled = false;
				}
				self._endSv('m', endm);
				var maxDate = endTime;
				var cal = self.endDp.cal;
				var dp = self.endDp;
				endChange(dp);
				cal.maxDate = cal.doCustomDate(maxDate, maxDate != dp.defMaxDate ? dp.realFmt : dp.realFullFmt, dp.defMaxDate);

				self.startDp.cal.hideDDivChildren();
				self.endDp.cal.hideDDivChildren();
			}

			if ($('#schedule_time_select').data('dialog') != null) {
				doInit();
				$('#schedule_time_select').dialog('open');
			} else {
				seajs.use('{hikui}/calendar/wdatepicker', function(WdatePicker) {
					self.useWdatepicker = true;
					WdatePicker(null, true);
					$dp.$Text = function(n, _) {
						var el = this.el;
						if (el == null)
							return null;
						var nEl = $(n);
						var text = nEl.text();
						return handleDv(text, _);
					};
					var isAllOk = 0;
					WdatePicker({
						eCont : 'startTime',
						el : 'startTime',
						dateFmt : 'HH:mm',
						maxDate : '#F{$dp.$Text(\'#endTime_value\',0);}',
						alwaysUseStartDate : true,
						notShowSS : true,
						init : function(dp, d, sv) {
							isAllOk++;
							self.startDp = dp;
							self._startSv = sv;
							if (isAllOk == 2) {
								doInit();
							}
						},
						autoShowQS : false,
						onpicked : startChange,
						Hchanged : startChange,
						mchanged : startChange
					});
					WdatePicker({
						eCont : 'endTime',
						el : 'endTime',
						dateFmt : 'HH:mm',
						notShowSS : true,
						minDate : '#F{$dp.$Text(\'#startTime_value\',1);}',
						autoShowQS : false,
						init : function(dp, d, sv) {
							isAllOk++;
							self.endDp = dp;
							self._endSv = sv;
							self._endD = d;
							if (isAllOk == 2) {
								doInit();
							}
						},
						schedule_24 : true,
						alwaysUseStartDate : true,
						onpicked : endChange,
						Hchanged : endChange,
						mchanged : endChange
					});
				});
				function toInteger(v) {
					if (v.indexOf('0') == 0) {
						v = v.substring(1, 2);
					}
					return parseInt(v);
				}

				function handle(n) {
					if (n.length < 5)
						return 0;
					return toInteger(n.substring(0, 2)) * 60 / 1 + toInteger(n.substring(3, 5)) / 1;
				}

				var self = this;
				$('#schedule_time_select').dialog({
					autoOpen : true,
					modal : true,
					width : 450,
					height : 400,
					buttons : [{
							text :language.text('dialog.ok'),
							'class' : 'bPrimary',
							click : function() {
								var startTimeV = $('#startTime_value').text();
								if (startTimeV == '' || startTimeV.length < 5) {
									jAlert(language.text('shedule.starttime.empty'), language.text('dialog.info'), 'attention');
									return;
								}
								var endTimeV = $('#endTime_value').text();
								if (endTimeV == '' || endTimeV.length < 5) {
									jAlert(language.text('shedule.endtime.empty'), language.text('dialog.info'), 'attention');
									return;
								}
								var startTime = handle(startTimeV);
								var endTime = handle(endTimeV);
								if (startTime < 0) {
									jAlert(language.text('shedule.starttime.invalid'), language.text('dialog.info'), 'attention');
									return;
								}
								if (endTime > 24 * 60) {
									jAlert(language.text('shedule.endtime.invalid'), language.text('dialog.info'), 'attention');
									return;
								}
								if (startTime >= endTime) {
									jAlert(language.text('shedule.time.error'), language.text('dialog.info'), 'attention');
									return;
								}
								var id = self._selectId.id
								if (self.findSWF().setTimeSelector(id, startTime, endTime) < 0) {
									jAlert(language.text('shedule.time.repeat'), language.text('dialog.info'), 'attention');
									return;

								}
								this.close();
								$.sticky(language.text('shedule.config.sunccess'), {
									type : "ok"
								});
							}
						}, {
							text : language.text('dialog.close'),
							click : function() {
								this.close();
							}
						}]
				});
			}
		},
		destroy : function() {
			this.el.unbind('resize');
			if (this.useMinTimeCell) {
				$('#startTime').remove();
				$('#endTime').remove();
			}
			if (this.useWdatepicker) {
				top.$('#_my97DP').remove();
				top.$dp = null;
				if (typeof($dp) != 'undefined') {
					$dp=null;
					top.$dp.hide();
					top.$dp = null;
					top.$('#_my97DP').remove();
				}
			}
			return this.base();
		},
		getMaxBoard : function() {
			return this.maxBoard;
		}
	});
});