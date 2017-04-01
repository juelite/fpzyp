$(function() {
	(function() {
		if (!top.$.topNav) {
			return;
		}
		if ($('body').hasClass('hide-navigation')) {
			top.$.hideNav && top.$.hideNav();
			return;
		}
		var frames = $.getCurrentFrames();
		var $an = $('.auto-navigation');
		if ($an.length) {
			top.$.topNav($an.clone(), frames);
		}
	}());
	$('a[type=submit]').live('click', function(e) {
		var targetEl = $(e.target);
		var disabled = targetEl.attr('disabled');
		if (disabled == 'disabled' || disabled == 'true') {
			return;
		}
		('true' == targetEl.attr('doDisable')) && targetEl.attr('disabled', 'disabled');
		var formEl = targetEl.closest('form');
        if(!formEl.length){
            return false;
        }
        if(!$.data(formEl[0], 'subForm'))
            formEl.submit();
		return false;
	});

	
	function updatealert() {
			var self = $(this);
			self.attr('_ischanged', 'true');
			self.find('.form-actions>.bBack').bind('mousedown.updatealert', function(event) {
				var self = $(this);
				var href = self.attr('href');
				var target_ = self.attr('target');
				self.attr('href', 'javascript:void(0);');
				var events = jQuery._data(this).events;

				for ( var i = 0; events.click && i < events.click.length; i++) {
					var click = events.click[i];
					if (click.handleIndex != null) {
						continue;
					}
					click.handleIndex = 1;
					click.oldHandler = click.handler;
					click.handler = function() {
						var handleIndex = 0;
						var handler = click.handler;
						click.setHandleIndex = function(index) {
							handleIndex = index;
						};
						return function() {
							if (handleIndex > 0) {
								handleIndex = handleIndex - 1;
								return handler.apply(this, arguments);
							}
						}
					}();
				}
				jConfirm(language.text('form.change'), language.text('dialog.confirm'), function(result) {
					if (result) {
						if (href && href != 'javascript:void(0);' && href != 'javascript:void(0)' && href != '#' && href != '###') {
							if (target_ == '_top') {
								top.location.href = href;
							} else if (target_ == '_parent') {
								parent.location.href = href;
							} else {
								location.href = href;
							}
						} else {
							for ( var i = 0; events.click && i < events.click.length; i++) {
								var click = events.click[i];
								click.setHandleIndex(1);
							}
							self.trigger('click', true);
						}
					} else {
						self.attr('href', href);
						for ( var i = 0; events.click && i < events.click.length; i++) {
							var click = events.click[i];
							click.setHandleIndex(0);
						}
					}
					events = null;
					delete events;
				});

			});
			
			self.unbind('.updatealert');
		}
	$.updatealert = updatealert;
	$(function() {
		$('form.form-input').bind('change.updatealert', updatealert).bind('keyup.updatealert', updatealert);
		
	});

	function getLocationPath() {
		if ($.trim(pt.cookieKey)) {
			return pt.cookieKey;
		}
		var href = document.location.pathname.split('?')[0];
		return decodeURI(href.substring(href.lastIndexOf('/') + 1));

	}

    $.getLocationPath =  getLocationPath;
	var filterHidevalue = $.cookie(getLocationPath() + 'filter-hide');
	$('.auto-filter').delegate('input[type="checkbox"]', 'change', function(e) {
		var targetEl = $(e.target);
		var index = targetEl.attr('index');
		var groupId = targetEl.attr('groupId');
		var formEl = targetEl.parents('.filterForm:first');
		var liEl = formEl.find('ul.formRow li.auto-by-filter:eq(' + index + ')');
		var liGroup = formEl.find('ul.formRow li.auto-by-filter[data-group="' + groupId + '"]');
		var value = filterHidevalue;// $.cookie('filter-hide');
		var list = [];
		if (value && value != 'none') {
			list = value.split(',')
		}
		var i = list.indexOf(index);
		if (targetEl.attr('checked')) {
			if (i > -1) {
				list.splice(i, 1);
			}
			if (groupId) {
				liGroup.show();
			} else {
				liEl.show();
			}
		} else {
			if (i < 0) {
				list.push(index);
			}
			if (groupId) {
				liGroup.hide();
			} else {
				liEl.hide();
			}
			var inputEl = liEl.find('input,select');
			var type = inputEl.attr('type');
			type = type||'';
			type = type.toLowerCase();
			var defaultValue = liEl.attr('defaultValue')||'';
			if(type=='checkbox'){
				inputEl.removeAttr('checked');
				var dvl = defaultValue.split(',');
				for(var i=0; i<dvl.length; i++){
					dvl[i]&&defaultValue&&inputEl.filter('[value="'+$.trim(dvl[i])+'"]').attr('checked','checked');
				}
			}else if(type == 'radio'){
				inputEl.removeAttr('checked');
				defaultValue&&inputEl.filter('[value="'+defaultValue+'"]').attr('checked','checked');
			}else{
                if (!defaultValue && $.nodeName(inputEl.get(0), 'select')) {
                    inputEl.get(0).selectedIndex = 0;
                } else {
                    inputEl.val(defaultValue);
                }
			}
		}
		filterHidevalue = list.join(',');
		if (filterHidevalue == '')
			filterHidevalue = 'none';
		$.cookie(getLocationPath() + 'filter-hide', filterHidevalue, {
			expires : 180
		});
	}).each(function(i, el) {
		var el = $(el);
		var formEl = el.parents('.filterForm:first');
		var array = [];
		var groups = [];
		var value = filterHidevalue;
		var showlist = [];
		var hidelist = [];
		formEl.find('ul.formRow li.auto-by-filter').$each(function(index, liEl) {
			var groupId = liEl.attr('data-group'), groupLabel = liEl.attr('data-label');
			if (value && value != 'none') {
				hidelist = value.split(',');
				if (hidelist.indexOf(index) < 0) {
					showlist.push(index);
				}
			} else if (value == 'none') {
				hidelist = [];
				showlist.push(index);
			} else {
				if (liEl.css('display') != "none") {
					showlist.push(index);
				} else {
					hidelist.push(index);
				}
			}
			if (groupId) {
				if ($.inArray(groupId, groups) >= 0) {
					return;
				} else {
					groups.push(groupId);
					liEl.addClass('clear');
				}
			}
			array.push('\n<li><a href="javascript:void(0);" data-stopPropagation="true">');
			
			array.push('<span class="check"><label><input defaultValue="'+(liEl.attr('defaultValue')||'')+'" type="checkbox"');
			if (liEl.css('display') != "none") {
				array.push(' checked="checked"');
			}
			array.push(' index="');
			array.push(index);
			array.push('"');
			if (groupId) {
				array.push(' groupId="');
				array.push(groupId);
				array.push('"');
			}
			array.push('><span>');
			var text = liEl.find('label').text();
            var lastIndexOf = text.lastIndexOf(':') < 0 ? text.lastIndexOf('：') : text.lastIndexOf(':');;
			if (lastIndexOf) {
				text = text.substring(0, lastIndexOf);
			}
			if (groupId) {
				array.push($.trim(groupLabel));
			} else {
				array.push($.trim(text));
			}
			array.push('</span></label></span></a></li>');
		});
		el.append(array.join(''));
		for ( var index = 0; index < showlist.length; index++) {
			el.find('input[type="checkbox"]:eq(' + showlist[index] + ')').attr('checked', 'checked').trigger('change');
		}
		for ( var index = 0; index < hidelist.length; index++) {
			el.find('input[type="checkbox"]:eq(' + hidelist[index] + ')').removeAttr('checked').trigger('change');
		}
	});
    var memory = window.sessionStorage || (window.UserDataStorage && new UserDataStorage()) || new CookieStorage();
	$('form[history=true]').live('submit doSubmit', function() {
		//var historyMap = getHistoryMap();
		var self = $(this);
		var action = $.absURL(self.attr('action') || location.href);
		//historyMap[action] = self.formToArray();
        memory.clear();
        memory.setItem(action,JSON.stringify(self.formToArray()));
		self.append('<input name="_history" type="hidden" value="true" />');
	});
	if (pt && pt.history) {
		paramToForm();
	} else {
		//var historyMap = getHistoryMap();
		$('form[history=true]').$each(function(i, $form) {
			var action = $.absURL($form.attr('action') || location.href);
			//historyMap[action] = null;
            memory.clear();
		});
	}

	/*function getHistoryMap() {
		top.pt = top.pt || {};
		top.pt.historyMap = top.pt.historyMap || {};
		return top.pt.historyMap;
	}
	$.getHistoryData = function(action) {
		if (action == null) {
			action = $.absURL(location.href);
		}
		return getHistoryMap()[action];
	};*/
	function paramToForm() {
		//var historyMap = getHistoryMap();
		$('form[history=true]').$each(function(i, $form) {
			var action = $.absURL($form.attr('action') || location.href);
			var datas = JSON.parse(memory.getItem(action));/*historyMap[action];*/

			if (datas == null) {
				return;
			}
			for ( var i = 0; i < datas.length; i++) {
				var data = datas[i];
                if(!$.isPlainObject(data) || data.value == null ||data.value == 'null')
                    continue;
				var $field = $form.find('[name="' + data.name + '"]');
				var type = $field.attr('type'), tag = $field.length ? $field[0].tagName.toLowerCase() : '';
				if (tag != 'input') {
					$field.val(data.value);
					continue;
				}
				type = type.toLowerCase();
				if (type == 'checkbox' || type == 'radio') {
					$form.find('[name="' + data.name + '"][value="' + data.value + '"]').attr('checked', 'checked');
				} else {
					$field.val(data.value);
				}
			}
		});

	}

	$.fn.submitHistory = function() {
		var $form = this;
		var action = $.absURL($form.attr('action') || location.href);
		//var historyMap = getHistoryMap();
		var datas =  JSON.parse(memory.getItem(action));/*historyMap[action]; */
		if (datas == null) {
			$form.append('<input name="_history" type="hidden" value="true" />');
			//historyMap[action] = $form.formToArray();
            memory.setItem(action,JSON.stringify($form.formToArray()))
			$form[0].submit();
			return;
		}
		var fieldsArray = [];
		for ( var i = 0; i < datas.length; i++) {
			var data = datas[i];
			if (data.name != '_history' && !$form.find('[name="' + data.name + '"]').length) {
				fieldsArray.push('<input type="hidden" name="' + data.name + '" value="' + data.value + '" >')
			}
		}
		$form.append(fieldsArray.join(''));
		$form.append('<input name="_history" type="hidden" value="true" />');
		//historyMap[action] = $form.formToArray();
        memory.setItem(action,JSON.stringify($form.formToArray()))
		$form[0].submit();
	};

	$.history = function(href, params, target) {
		if (target == null) {
			target = "_self";
		}
		var formEl = $([ '<form style="display:none;" action="', href, '" target="', target, '"', '" method="post"></form>' ].join(''));
		params = params || {};
		$.each(params, function(name, obj) {
			if (obj == null) {
				return
			}
			if ($.isArray(obj)) {
				for ( var index = 0; index < obj.length; index++) {
					formEl.append('<input name=' + name + ' value=' + obj[index] + ' >');
				}
			} else {
				formEl.append('<input name=' + name + ' value=' + obj + ' >');
			}
		});
		formEl.appendTo('body');
		formEl.submitHistory();
	}
});
