// jQuery Alert Dialogs Plugin
//
// Version 1.1
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 14 May 2009
//
// Visit http://abeautifulsite.net/notebook/87 for more information
//
// Usage:
// jAlert( message, [title, callback] )
// jConfirm( message, [title, callback] )
// jPrompt( message, [value, title, callback] )
// 
// History:
//
// 1.00 - Released (29 December 2008)
//
// 1.01 - Fixed bug where unbinding would destroy all resize events
//
// License:
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC.
//
(function($) {

	$.alerts = {

		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time

		verticalOffset : -75, // vertical offset of the dialog from center screen, in pixels
		horizontalOffset : 0, // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize : true, // re-centers the dialog on window resize
		overlayOpacity : .5, // transparency level of overlay
		overlayColor : '#000', // base color of overlay
		draggable : false, // make the dialogs draggable (requires UI Draggables plugin)
		okButton :  language.text('dialog.ok'), // text for the OK button
		cancelButton : language.text('dialog.cancel'), // text for the Cancel button
		dialogClass : null, // if specified, this class will be applied to all dialogs

		// Public methods

		alert : function(message, title, level, callback) {
			var obj = valToObj(message, title, level, callback);
			obj.type = null;
			handleTitle(obj, 'attention');
			$.alerts._show(obj);
		},

		confirm : function(message, title, callback) {
			var obj = valToObj(message, title, "question", callback);
			obj.type = 'confirm';
			obj.level = "question";
			if (obj.title == null)
				obj.title =  language.text('dialog.confirm');
			$.alerts._show(obj);
		},

		prompt : function(message, value, title, callback) {
			var obj = valToObj(message, title, "attention", callback);
			obj.value = value;
			obj.type = 'prompt';
			if (obj.title == null)
				obj.title =language.text('dialog.info') ;
			$.alerts._show(obj);
		},

		// Private methods

		_show : function(title, msg, value, type, level, callback) {
			if ($.isPlainObject(title)) {
				msg = title.message;
				value = title.value;
				type = title.type;
				level = title.level;
				callback = title.callback;
				title = title.title;
			}
			type = type || 'alert';
			$.alerts._hide();
			$.alerts._overlay('show');

			var html = [], levels = ['ok', 'error', 'stop', 'question', 'notice', 'attention', 'tips', 'alarm'];
			if (level != "" && level != null && type != "prompt") {
				html.push('<div class="msg-b-weak msg-b-' + level + '"><i></i><div class="msg-cnt">');
				html.push('<div id="popup_message">');
				html.push('</div>');
				html.push('</div></div>');
			} else {
				html.push('<div id="popup_message"></div>');
			}
			$("BODY").append('<div id="popup_container"><div id="popup_wrapper">'
					+ '<h5 id="popup_title"></h5>' + '<div id="popup_content">' + html.join('') + '</div>' + '</div></div>');

			if ($.alerts.dialogClass)
				$("#popup_container").addClass($.alerts.dialogClass);

			// IE6 Fix
			var pos = ($.browser.msie && parseInt($.browser.version) <= 6) ? 'absolute' : 'fixed';

			$("#popup_container").css({
				position : pos,
				zIndex : 99999,
				margin : 0
			});
			$("#popup_title").text(title);
			$("#popup_content").addClass(type);
			$("#popup_message").text(msg);
			$("#popup_message").html($("#popup_message").text().replace(/\n/g,
					'<br />'));

			$("#popup_container").css({
				minWidth : $("#popup_container").outerWidth(),
				maxWidth : $("#popup_container").outerWidth(),
				width : $("#popup_container").outerWidth(),
                maxHeight : 400,
                overflow : 'auto'
			});
            if($.browser.msie && parseInt($.browser.version) <= 6) {
                $("#popup_container").css({
                    width :400
                });
                if( $("#popup_container").outerHeight() > 400){
                    $("#popup_container").css({
                        height : 400
                    });
                }
            }
			$.alerts._reposition();
			$.alerts._maintainPosition(true);

			switch (type) {
				case 'alert' :
					$("#popup_wrapper")
							.append('<div id="popup_panel"><input type="button" class="buttonM bBlue" value="'
									+ $.alerts.okButton + '" id="popup_ok" /></div>');
					$("#popup_ok").click(function() {
						$.alerts._hide();
						if (callback)
							callback(true);
					});
					$("#popup_ok").focus().keypress(function(e) {
						if (e.keyCode == 13 || e.keyCode == 27)
							$("#popup_ok").trigger('click');
					});
					break;
				case 'confirm' :
					$("#popup_wrapper")
							.append('<div id="popup_panel"><input type="button" class="buttonM bBlue" value="'
									+ $.alerts.okButton
									+ '" id="popup_ok" /> <input type="button" class="buttonM bDefault" value="'
									+ $.alerts.cancelButton + '" id="popup_cancel" /></div>');
					$("#popup_ok").click(function() {
						$.alerts._hide();
						if (callback)
							callback(true);
					});
					$("#popup_cancel").click(function() {
						$.alerts._hide();
						if (callback)
							callback(false);
					});
					$("#popup_ok").focus();
					$("#popup_ok, #popup_cancel").keypress(function(e) {
						if (e.keyCode == 13)
							$("#popup_ok").trigger('click');
						if (e.keyCode == 27)
							$("#popup_cancel").trigger('click');
					});
					break;
				case 'prompt' :
					$("#popup_message").append('<br /><input type="text" size="20" id="popup_prompt" />')
							.parent()
							.after('<div id="popup_panel"><input type="button" class="buttonM bBlue" value="'
									+ $.alerts.okButton
									+ '" id="popup_ok" /> <input type="button" class="buttonM bDefault" value="'
									+ $.alerts.cancelButton + '" id="popup_cancel" /></div>');
					$("#popup_ok").click(function() {
						var val = $("#popup_prompt").val();
						$.alerts._hide();
						if (callback)
							callback(val);
					});
					$("#popup_cancel").click(function() {
						$.alerts._hide();
						if (callback)
							callback(null);
					});
					$("#popup_prompt, #popup_ok, #popup_cancel").keypress(function(e) {
						if (e.keyCode == 13)
							$("#popup_ok").trigger('click');
						if (e.keyCode == 27)
							$("#popup_cancel").trigger('click');
					});
					if (value)
						$("#popup_prompt").val(value);
					$("#popup_prompt").focus().select();
					break;
			}

			if ($.fn.bgiframe) {
				$('#popup_container').bgiframe();
			}

			// Make draggable
			if ($.alerts.draggable) {
				try {
					$("#popup_container").draggable({
						handle : $("#popup_title")
					});
					$("#popup_title").css({
						cursor : 'move'
					});
				} catch (e) { /* requires jQuery UI draggables */
				}
			}
		},

		_hide : function() {
			$("#popup_container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},

		_overlay : function(status) {
			switch (status) {
				case 'show' :
					$.alerts._overlay('hide');
					$("BODY").append('<div id="popup_overlay"></div>');
					$("#popup_overlay").css({
						position : 'absolute',
						zIndex : 99998,
						top : '0px',
						left : '0px',
						width : '100%',
						height : $(window.top.document).height(),
						background : $.alerts.overlayColor,
						opacity : $.alerts.overlayOpacity
					});
					break;
				case 'hide' :
					$("#popup_overlay").remove();
					break;
			}
		},

		_reposition : function() {
			var top = (($(window.top).height() / 2) - ($("#popup_container").outerHeight() / 2))
					+ $.alerts.verticalOffset;
			var left = (($(window.top).width() / 2) - ($("#popup_container").outerWidth() / 2))
					+ $.alerts.horizontalOffset;
			if (top < 0)
				top = 0;
			if (left < 0)
				left = 0;

			// IE6 fix
			if ($.browser.msie && parseInt($.browser.version) <= 6)
				top = top + $(window.top).scrollTop();

			$("#popup_container").css({
				top : top + 'px',
				left : left + 'px'
			});
			$("#popup_overlay").height($(window.top.document).height());
		},

		_maintainPosition : function(status) {
			if ($.alerts.repositionOnResize) {
				switch (status) {
					case true :
						$(window.top).bind('resize', $.alerts._reposition);
						break;
					case false :
						$(window.top).unbind('resize', $.alerts._reposition);
						break;
				}
			}
		}

	};
	var valToObj = function(message, title, level, callback) {
		if ($.isPlainObject(message)) {
			return message;
		}
		var obj = {};
		obj.message = message;
		if ((title == null && level == null) || $.isFunction(title)) {
			level = 'attention';
			callback = title;
			title = null;
		} else {
			if ($.isFunction(level)) {
				callback = level;
				level = title;
				title = null;
			} else if (level == null) {
				level = title;
				title = null;
			}
		}
		obj.title = title;
		obj.level = level;
		obj.callback = callback;
		return obj;
	};

	var handleTitle = function(obj, defaultLevel) {
		if (obj.level == null) {
			obj.level = defaultLevel;
		}
		if (obj.title == null) {
			switch (obj.level) {
				case 'ok' :
					obj.title = language.text('dialog.success');
					break;
				case 'error' :
					obj.title = language.text('dialog.error') ;
					break;
				case 'stop' :
					obj.title = language.text('dialog.forbid') ;
					break;
				case 'question' :
					obj.title = language.text('dialog.confirm');
					break;
				case 'notice' :
					obj.title = language.text('dialog.attention');
					break;
				case 'attention' :
					obj.title = language.text('dialog.info');
					break;
				case 'tips' :
					obj.title =  language.text('dialog.info');
					break;
				case 'alarm' :
					obj.title =  language.text('dialog.warn') ;
				default :
					obj.title = language.text('dialog.confirm');
					obj.level = 'question';
					break;
			}
		}

	};
})(jQuery);