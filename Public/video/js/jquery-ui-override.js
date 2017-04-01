(function() {
	$.extend($.ui.dialog._proto, {
		_createButtons : function() {
			var _createButtons = $.ui.dialog._proto._createButtons;
			return function(buttons) {
				// if (!this.options.maybeRefresh) {
				// return _createButtons.apply(this, arguments);
				// }
				var that = this, hasButtons = false, maybeRefresh = this.options.maybeRefresh;
				// if we already have a button pane, remove it
				this.uiDialogButtonPane.remove();
				this.uiButtonSet.empty();
				if (typeof buttons === "object" && buttons !== null) {
					$.each(buttons, function() {
						return !(hasButtons = true);
					});
				}
				if (hasButtons) {
					$.each(buttons, function(name, props) {
						var button, click;
						props = $.isFunction(props) ? {
							click : props,
							text : name
						} : props;
						// Default to a non-submitting button
						props = $.extend({
							type : "button"
						}, props);
						// Change the context for the click callback to be the
						// main element
							click = maybeRefresh ? props.click.toString() : props.click;
						props.click = function() {
							var callback = that.options.id == null ? window : window.frames[that.options.id];
							callback = callback || window;
							if (callback.$) {
								callback = callback.$;
								if (callback.callback) {
									callback = callback.callback;
								}
							}
							if (typeof (click) === 'string') {
								var frames = that.options.frames;
								var frame = window;
								if (frames != null) {
									for ( var i = frames.length; i > 0; i--) {
										frame = frame.frames[frames[i - 1]];
									}
								}
								(function(frame, callback) {
									var f = new frame.Function('var t = ' + click + ';return t.apply(this,arguments);');
									try{f.call(that, that, callback, that.element[0]);
									}catch (e) {}
								})(frame, callback);
							} else {
								try{
									click.call(that, that, callback, that.element[0]);
								}catch(e){}
								
							}
						};
						button = $("<button></button>", props).appendTo(that.uiButtonSet);
						if ($.fn.button) {
							button.button();
						}
					});
					this.uiDialog.addClass("ui-dialog-buttons");
					this.uiDialogButtonPane.appendTo(this.uiDialog);
				} else {
					this.uiDialog.removeClass("ui-dialog-buttons");
				}

			};
		}()
	});
	$.widget("ui.autocomplete", $.ui.autocomplete, {
		_initSource : function() {
			var array, url, that = this;
			this.maxSourceLength = this.options.maxSourceLength || 800;
			if ($.isArray(this.options.source)) {
				array = this.options.source;
				this.source = function(request, response) {
					response($.ui.autocomplete.filter(array, request.term));
				};
			} else if (typeof this.options.source === "string") {
				url = this.options.source;
				this.source = function(request, response) {
					if (that.xhr) {
						that.xhr.abort();
					}
					that.xhr = $.ajax({
						url : url,
						data : request,
						dataType : "json",
						success : function(data) {
							response(data);
						},
						error : function() {
							response([]);
						}
					});
				};
			} else if ($.isPlainObject(this.options.source)) {
				if (that.xhr) {
					that.xhr.abort();
				}
				that.xhr = $.ajax(this.options.source);
				that.xhr.done(function(data){
					if (!that.cacheData)
							that.cacheData = that.handleData(data);
					that._trigger('ajaxBack');
				});
				this.source = function(request, response) {
					that.xhr.done(function(data) {
						if (!that.cacheData)
							that.cacheData = that.handleData(data);
						var array = that.filter(that.cacheData, request.term);
						response(array);
					});
				}

			} else {
				this.source = this.options.source;
			}
		},
		_create: function () {
			this._superApply(arguments);
            this._on(this.element,{
                'click' : function(event){
                    var text = this.element.val();
                    this.search(text);
                }
            });
			this._off(this.menu.element, 'menuselect');
			this._on(this.menu.element, {
						'menuselect': function (event, ui) {
							
					// back compat for _renderItem using item.autocomplete, via #7810
					// TODO remove the fallback, see #8156
					var item = ui.item.data("ui-autocomplete-item") || ui.item.data("item.autocomplete"), previous = this.previous;

					// only trigger when focus was lost (click on menu)
					if (this.element[0] !== this.document[0].activeElement) {
						this.element.focus();
						this.previous = previous;
						// #6109 - IE triggers two focus events and the second
						// is asynchronous, so we need to reset the previous
						// term synchronously and asynchronously :-(
						this._delay(function() {
							this.previous = previous;
							this.selectedItem = item;
						});
					}
					
					if(item.value == 'loadMore'){
						this.loadMore(item.tValue);
						return;
					}
					if (false !== this._trigger("select", event, {
						item : item
					})) {
							this._value(item.value);
					}
					
					
					// reset the term after the select event
					// this allows custom select handling to work properly
					this.term = this._value();

					this.close(event);
					this.selectedItem = item;
				}
			})
		},
		_search : function(value) {
			this.term = value;
			return this._superApply(arguments);
		},
		filter : function(cacheData, term) {
			return $.ui.autocomplete.filter(cacheData, term);
		},
		loadMore : function(array){
			var that = this;
				var removed = array.splice(that.maxSourceLength, array.length - that.maxSourceLength);
				that.removedValue = removed;
				array = that._normalize(array);
				var ul = that.menu.element;
	
				ul[0].removeChild(ul.get(0).lastChild);
				$.each(array, function(index, item) {
					that._renderItemData(ul, item);
				});
				if(that.removedValue.length > 0){
					var moreItem = {label:language.text('ui.loadMore'),value:'loadMore',tValue:this.removedValue};
					that._renderItemData(ul, moreItem);
				}
				that.menu.refresh();
				that.cancelBlur = true;
				that._delay(function() {
					delete that.cancelBlur;
				});
				var menuElement = that.menu.element[0];
					if (!$(event.target).closest(".ui-menu-item").length) {
						that._delay(function() {
							var thaz = that;
							that.document.one("mousedown", function(event) {
								if (event.target !== thaz.element[0] && event.target !== menuElement
										&& !$.contains(menuElement, event.target)) {
									thaz.close();
								}
							});
						});
					}
				
		},
		__response : function(array) {
			if (this.maxSourceLength !== true) {
				if (array.length > this.maxSourceLength) {
					var removed =  array.splice(this.maxSourceLength, array.length - this.maxSourceLength);
					 this.removedValue = removed;
				}else{
					this.removedValue = [];
				}
			}
			this._superApply(arguments);
			if (this.options.showNoMatch === true && !this.options.disabled && !array.length && !this.cancelSearch) {
				this._suggest(array);
				this._trigger("open");
			}
		},
		handleData : function(data) {
			var result = [];
			
			if (this.options.sourceDataType === 'tree'){
				if(!!this.options.onlyLeaf){
					var newData = this.treeHandleData(data);
					return this.filterData(newData);
				}
				return this.treeHandleData(data);
			}
			return data;
		},
		_renderMenu : function(ul, items) {
			var that = this;
			if (items && items.length) {
				$.each(items, function(index, item) {
					that._renderItemData(ul, item);
				});
				if(this.removedValue && this.removedValue.length > 0){
					var moreItem = {label:language.text('ui.loadMore'),value:'loadMore',parentLabel:'[]',tValue:this.removedValue};
					that._renderItemData(ul, moreItem);
				}
			} else {
				if (this.options.showNoMatch === true) {
					$([ "<li><span>" + language.text('ui.mismatching')+":<em>", this.term, "</em></span></li>" ].join('')).appendTo(ul);
				}
			}
		},
		_renderItem : function(ul, item) {
			if (this.options.sourceDataType === 'tree' && item.value != 'loadMore') {
				var parentLabel = item.parentLabel.join('>');
				return $([ "<li><a title=\"", item.label, "\n", parentLabel, "\">", item.label, "<em>", parentLabel, "</em></a></li>" ].join('')).appendTo(ul);
			}
			return $([ "<li><a title=\"", item.label, "\">", item.label, "</a></li>" ].join('')).appendTo(ul);
		},
		doTreeHandleData : function(result, data) {
			if (!data.children) {
				return;
			}
			var parentLabel = data.parentLabel;
			var newLabel = parentLabel.concat([ data.label ]);
			for ( var i = 0; i < data.children.length; i++) {
				var d = data.children[i];
				d.parentLabel = newLabel;
				result.push(d);
				this.doTreeHandleData(result, d);
			}
		},
		treeHandleData : function(data) {
			var result = [];
			if (data) {
				data.parentLabel = [];
				result.push(data);
				this.doTreeHandleData(result, data);
			}
			return result;
		},
		filterData : function(data){
			var result = [];
			for(var i = 0; i < data.length; i++){
				if(!data[i].children)
					result.push(data[i]);
			}
			return result;
		}

	});


    (function( $ ) {
        $.widget( "custom.combobox", {
            options : {
                source : null
            },
            _create: function() {
                this.wrapper = $( "<span>" )
                    .addClass( "custom-combobox" )
                    .insertAfter( this.element );

                this.element.hide();
                this._createAutocomplete();
                this._createShowAllButton();
            },

            _createAutocomplete: function() {
                var selected = this.element.children( ":selected" ),
                    value = selected.val() ? selected.text() : "";

                this.input = $( "<input>" )
                    .appendTo( this.wrapper )
                    .val( value )
                    .attr( "title", "" )
                    .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
                    .autocomplete({
                        delay: 0,
                        minLength: 0,
                        source: $.proxy( this, "_source" )
                    })
                    .tooltip({
                        tooltipClass: "ui-state-highlight"
                    });

                this._on( this.input, {
                    autocompleteselect: function( event, ui ) {
                        ui.item.option.selected = true;
                        this._trigger( "select", event, {
                            item: ui.item.option
                        });
                    },

                    autocompletechange: "_removeIfInvalid"
                });
            },

            _createShowAllButton: function() {
                var input = this.input,
                    wasOpen = false;

                $( "<a>" )
                    .attr( "tabIndex", -1 )
                    .attr( "title", "Show All Items" )
                    //.tooltip()
                    .appendTo( this.wrapper )
                    .button({
                        icons: {
                            primary: "ui-icon-triangle-1-s"
                        },
                        text: false
                    })
                    .removeClass( "ui-corner-all" )
                    .addClass( "custom-combobox-toggle ui-corner-right" )
                    .mousedown(function() {
                        wasOpen = input.autocomplete( "widget" ).is( ":visible" );
                    })
                    .click(function() {
                        input.focus();

                        // Close if already visible
                        if ( wasOpen ) {
                            return;
                        }

                        // Pass empty string as value to search for, displaying all results
                        input.autocomplete( "search", "" );
                    });
            },

            _source: function( request, response ) {
                var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                response( this.element.children( "option" ).map(function() {
                    var text = $( this ).text();
                    if ( this.value && ( !request.term || matcher.test(text) ) )
                        return {
                            label: text,
                            value: text,
                            option: this
                        };
                }) );
            },

            _removeIfInvalid: function( event, ui ) {

                // Selected an item, nothing to do
                if ( ui.item ) {
                    return;
                }

                // Search for a match (case-insensitive)
                var value = this.input.val(),
                    valueLowerCase = value.toLowerCase(),
                    valid = false;
                this.element.children( "option" ).each(function() {
                    if ( $( this ).text().toLowerCase() === valueLowerCase ) {
                        this.selected = valid = true;
                        return false;
                    }
                });

                // Found a match, nothing to do
                if ( valid ) {
                    return;
                }

                // Remove invalid value
                this.input
                    .val( "" );
                   // .attr( "title", value + " 没有匹配项！" );
                    //.tooltip( "open" );
                this.element.val( "" );
                this._delay(function() {
                    this.input.tooltip( "close" ).attr( "title", "" );
                }, 2500 );
                this.input.autocomplete( "instance" ).term = "";
            },

            _destroy: function() {
                this.wrapper.remove();
                this.element.show();
            }
        });
    })( jQuery );

})();


/*(function () {

	var _dialog = function (options, _href) {
        var options = options || {},
            base = $('base').attr('href') || '',
            el, src, iSrc, ajax, suc;

        !options.id && (options.id = Math.round(Math.random() * 100000));

        // opionts有iframeSrc参数时, 弹出层生成iframe
        if (iSrc = options.iframeSrc) {
            src = (/^\/|^https?:\/\//i.test(iSrc) ? '' : base) + iSrc;
            options.iframeSrc = src;
            el = $(_dialog.parseStr(_dialog.defalut.ifrHTML, {
                id: options.id,
                href: _href,
                src: src
            })).appendTo('body');

            el.find('iframe').bind('load', function () {
                el.find('.loading-overlay').hide();
                options.load && options.load();
            });

        // options有ajax时, 通过load调用弹出层内容
        } else if (ajax = options.ajax){
            src = (/^\/|^https?:\/\//i.test(ajax.url) ? '' : base) + ajax.url;
            el = $(_dialog.parseStr(_dialog.defalut.ifrHTML, {
                id: options.id
            })).appendTo('body');

            suc = ajax.success;
            el.load($.extend(true, ajax, {
                url: src,
                success: function () {
                    suc && suc.apply(this, Array.prototype.slice(arguments));
                    options.load && options.load();
                }
            }));

        // options有el时，clone元素
        } else if (options.el) {
            el = $(options.el).appendTo('body');
        } else {
            return
        }
        options.el = el;
        _dialog.run(options)
    };

   
    _dialog.run = function (options) {
    	
        var close = options.close, el = options.el;

        options = $.extend(true, {
            autoOpen : true,
            modal : true,
            resizable : false,
            width : 500,
            height : 500
        }, options, {
            close: function () {
                top.iframeOn_El = null;
                close && close.apply(this, arguments);
                el.remove();
            }
        });

        top.iframeOn_El = el;
        return el._dialog(options);
    };

   _dialog.parseStr = function (str, obj) {
        return str.replace(/{([^}]*)}/g, function (a, b) {
            return obj[b] || '';
        })
    };

   _dialog.defalut = {
        'ifrHTML': '<div class="dialog" name="{id}" parentSrc="{href}" style="padding:0;overflow:hidden;">' +
                             '<div class="loading-overlay">' +
                                '<div class="loading-m"><i></i><span>\u6b63\u5728\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u540e\u002e\u002e\u002e</span>' +
                                '</div><div class="shadow"></div>' +
                             '</div>' +
                             '<iframe src="{src}" dialogIframe="true" id="{id}" name = "{id}" frameborder="0" scrolling="auto" class="autoIframe dialog-frame"></iframe>' +
                        '</div>',
       'ajaxHTMl': '<div class="dialog" id="{id}"></div>'
    };

	// 当$.dialog(opt)调用时，调用根页面的_dialog
    $.dialog = function (opt) {
        opt = opt || {};
        top.dialog(opt, location.href);
    };
	
	// 当$(el).dialog(opt)调用时，调用根页面的_dialog在opt中加入el属性
    $.fn.dialog = function (opt) {
        opt = opt || {};
        opt.el = this.get(0).outerHTML;

        top.dialog(opt);
    };
	
    window.dialog = _dialog;
})()*/