/**
 * @fileOverview 时间计划控件
 * @description
 * 时间计划控件
 */
;(function ($) {
	$.planTemplateChangeScale = {
		setScaleWidth: function () {
				var scaleWidth = this.settings.width - 80;
				var aliquotTime = parseInt(24/this.settings.aliquots) || 1;
				var aliquots = 24/aliquotTime;
				var aliquotWidth = parseInt(scaleWidth/aliquots);
				var v = parseInt(10*aliquotTime*60/(aliquotWidth*30));
				var mMin = (v%2 == 0 ? v==0 ? 1 : v : v+1)*30;
				var mWidth = parseInt(aliquotWidth*mMin/(aliquotTime*60));
				aliquotWidth = (aliquotTime*60/mMin)*mWidth;
				scaleWidth = parseInt(24*60*mWidth/mMin);
				
				this.scaleWidth = {
					swidth: scaleWidth,
					aTime: aliquotTime,
					mMin:mMin,
					aliquots: aliquots,
					aliquotWidth: aliquotWidth,
					mWidth: mWidth
				}		
				this.resetOptions();
		},
		resetOptions: function () {
			var scaleWidth = this.scaleWidth;
			
			this.$context.width(this.scaleWidth.swidth + 80)
		
			this.barWidth = scaleWidth.swidth;
			this.settings.stepMinutes = ((60*24)/this.barWidth*this.settings.stepWidth);
		},
        scaleAliqot : function(s,isview){
            var html = [];
            html.push( '<div class="planTemplate'+(isview ? 'View' : '')+'-scale' +  '" style="width:'+s.swidth+'px">');
            for (var i=0; i < s.aliquots; i++) {
                html.push("<span class='more-hight' style='left:"+i*s.aliquotWidth+"px;'></span>");
                html.push("<font style='left:"+i*s.aliquotWidth+"px;'>"+('000' + i*s.aTime).slice(-2)+"</font>");

                for (var j=0, len=s.aTime*60/s.mMin; j < len; j++) {
                    html.push("<span class='small-hight' style='left: "+(s.mWidth*(j+1) + i*s.aliquotWidth)+"px;'></span>");
                }
            }
            html.push("<span class='more-hight' style='right:-1px;'></span>");
            html.push("<font style='right:0px;'>"+24+"</font>");
            html.push('</div>');
            return html.join('');
        },
		scaleHTML: function(index,len,addable) {
            var that = this;
			if(this.scaleWidth) { 
				var s = this.scaleWidth;
				var isview = this.settings.planmodel && this.settings.planmodel === 'view',html = [];
                if(index == 0 ){
				    html.push( '<div class="planTemplate'+(isview ? 'View' : '')+'-scale' + (index===0 ? ' planTemplate-first':'')+'" style="width:'+s.swidth+'px">');
				    html.push(this.scaleAliqot(s,isview));
				    html.push('</div>');
                }
                //added by wqy   started
                if(addable){
                    var startId = 'planTemplate_label_' + index + '_starttime_' + $.now(); // 创建唯一的id
                    var endId = 'planTemplate_label_' + index + '_endtime_' + $.now();
                    html.push( '<div class="planTemplate-bar" data-index="' + index +'" style="width:'+(this.scaleWidth.swidth-1)+'px;height:'+(this.settings.barHeight)+'px;"></div>',
                        '<div class="planTemplate-label planTemplate-label-date">',
                        '<span><input type="text" readonly id="' + startId + '" value="开始时间" ></span>',
                        '<span><input type="text" readonly id="' + endId + '" value="结束时间" ></span>',
                        '</div>');

                    seajs.use('{hikui}/calendar/wdatepicker', function(WdatePicker) {
                        var end = $dp.$(endId);
                        that.$context.on('click', '#' + startId, function() {
                            WdatePicker({
                                el : startId,
                                onpicked: function() {
                                    end.click();
                                    $('#' + endId, that.$context).focus();
                                },
                                maxDate:'#F{$dp.$D(' + endId + ')}'
                            }) ;
                        });

                        that.$context.on('click', '#' + endId, function() {
                            WdatePicker({
                                el : endId,
                                minDate:'#F{$dp.$D(' + startId + ')}'
                            })

                        });

                    });



                }else{
                    html.push('<div class="planTemplate-bar" data-index="' + index +'" style="width:'+(this.scaleWidth.swidth-1)+'px;height:'+ (this.settings.barHeight)+'px;"></div>',
                        '<div class="planTemplate-label">' + this.settings.label[index] + '</div>');
                }
                //added by wqy   ended
                html.push('<div class="planTemplate'+(isview ? 'View' : '')+'-scale-bottom'+((index + 1)>=len ? ' planTemplate-last':'')+'" style="width:'+s.swidth+'px;">');
                for (var i=0; i < s.aliquots; i++) {
                    html.push("<span class='more-hight' style='left:"+i*s.aliquotWidth+"px;'></span>");
                    if((index + 1)>=len){
                        html.push("<font style='left:"+i*s.aliquotWidth+"px;'>"+('000' + i*s.aTime).slice(-2)+"</font>");
                    }
                    for (var j=0, leng=s.aTime*60/s.mMin; j < leng; j++) {
                        html.push("<span class='small-hight' style='left: "+(s.mWidth*(j+1) + i*s.aliquotWidth)+"px;'></span>");
                    }
                }
                html.push("<span class='more-hight' style='right:-1px;'></span>");
                if((index + 1) >= len){
                    html.push("<font style='right:0px;'>"+24+"</font>");
                }
                html.push(this.scaleAliqot(s,isview));
                html.push('</div>');
				return html.join('');
			} else {
				return '<div class="planTemplate-scale"></div>'
			}
		}	
	}			
}(jQuery))

;(function($) {

    /**
     *
     * @lends $.fn.planTemplate
     * @property {string} type -计划类型，内置了week，holiday,默认week,类型可以根据需要做扩展
     * @property {boolean} addable -时间条是否可增加,一般用于holiday类型
     * @property {number} maxSliderNum -默认8，表示一天只能有8个时间条
     * @property {number} maxbarNum -显示的最多bar的数量，默认16
     * @property {boolean} showButtons -是否显示按钮，如果为true，需要与下面的button属性一起使用
     * @property {boolean} buttons -当showButtons为true的时候配置
     * @property {number} width -设置时间计划控件的宽度
     * @property {number} aliquots -显示多少个大刻度，默认12
     * @property {number} editable 时间计划控件是否可编辑
     * @property {array} actionButtons 配置右边的事件
     * @property {object} typeMap 映射等级与颜色的关系，还不支持直接#ccc这样的配置
     */
    var defaults = {
        type: 'week',
        label: [language.text('monday'), language.text('tuesday'), language.text('wednesday'), language.text('thursday'),language.text('friday'), language.text('saturday'), language.text('sunday')],
        barHeight: 28,      // 拖动条高度
        scaleHeight: 16,    // 刻度高度
        stepWidth: 1 ,      // 最小拖动宽度
        stepMinutes: 1,    // 最小拖动分钟数 
        title: '',          // 标题文字
        addable: false,     // 时间条是否可增加
        sliderColor: 'blue',
        maxSliderNum: 8,
        maxBarNum: 16,
        showButtons: false,
		//fixScaleWidth: true,
		width: 700,
		aliquots: 12,
        editable : true ,
        actionButtons : [{
            text : '清空',
            'cls' : 'ico i-empty',
            click : function(){
                this.deleteAll();
            }
        }],
        typeMap : {
            1 : 'blue',
            2 : 'yellow'
        }
    };

   var typeSettings = {
        week : {
            showButtons: true,
            buttons: [
                {
                    text: '普通',
                    type: 1
                },
                {
                    text: '紧急',
                    type: 2
                }
            ]
        },
       holiday : {
           addable: true,
           label: ['']
       },
       doorStatus : {
           showButtons: true,
           buttons: [
               {
                   text: '常开',
                   type: 1
               },

               {
                   text: '常关',
                   type: 2
               }
           ]
       },
       password : {
           title: '请设置“卡+密码”认证时段',
           buttons: [{type: 2}]
       }
    };


    // 建立全局唯一的索引
    PlanTemplate.index = 0;
    /**@lends $.fn.planTemplate.prototype*/
    function PlanTemplate(element, options) {
        this.$context = element;
        this.settings = null;
        this.$currentSlider = null;
        this.position = null;
        this.time = null;
        this.labelWidth = 80;

        PlanTemplate.index++;

        if(options.type){
            this.settings = $.extend({},defaults,typeSettings[options.type] || {},options);
        }else{
            this.settings = $.extend({}, defaults, options);
        }

        this.currentColor = this.settings.sliderColor;

        if ($.isArray(this.settings.buttons)) {
            this.hasType = true;
            this.currentType = this.settings.buttons[0].type;
        }

       this.barWidth = this.settings.stepWidth * (60 / this.settings.stepMinutes) * 24;
       this.init();
    }


    PlanTemplate.prototype = {

        /**
         * @lends $.fn.planTemplate
         */
        /**@ignore*/
        init: function() {
            this.initData();
			// new add
			this.setScaleWidth()
            this.createHeader();
            this.createPanel();
            this.setStyle();
            if(this.settings.editable) {
                this.paint();
                this.draw();
                this.drag();
            }
            this.click();
            this.hover();
            this.initControl();
            this.cancelSelect();

            if (this.settings.addable) {
                this.initDeleteBtn();
            } else {
                this.copy();
            }
        },
        /**
         * @method
         * @description 初始化数据，或者清除页面数据
         */
        initData: function() {
            var len;

            this.position = [];
            this.time = [];

            if (this.settings.addable && $('.planTemplate-label', this.$context).length > 0) {
                len = $('.planTemplate-label', this.$context).length;
            } else {
                len = this.settings.label.length;
            }

            for (var i  = 0; i < len; i++) {
                this.position.push([]);
                this.time.push([]);
            }
            
        },
        /**@ignore*/
        typeSetting : function(){

        },
        /**@ignore*/
        initPanel: function() {
            var that = this;
            $('.planTemplate-control', that.$context).hide();
            $('.planTemplate-slider', that.$context).remove();
        },


        /**@ignore*/
        createPanel: function() {
            var html = [];
            var len = this.settings.label.length;

            html.push('<div class="planTemplate-panel">');

            if (!this.settings.addable) {
                for (var i = 0; i < len; i++) {
					html.push(this.scaleHTML(i,len,this.settings.addable));
                }
            } else {
			    html.push(this.scaleHTML(0,len,this.settings.addable));
			}
			html.push('<span class="planTemplate-tips-left"></span>',
                      '<span class="planTemplate-tips-right"></span>');
            html.push('<div class="planTemplate-control">',
                        '<div>',
                          // '<span id="planTemplate-control-startTime'+PlanTemplate.index+'">08:00</span> - ',
                          // '<span id="planTemplate-control-endTime'+PlanTemplate.index+'">09:00</span>',
                          '<span><input class="planTemplate-control-startTime" id="planTemplate-control-startTime'+PlanTemplate.index+'" type="text" readonly></span><i>-</i>',
                          '<span><input class="planTemplate-control-endTime" id="planTemplate-control-endTime'+PlanTemplate.index+'" type="text" readonly></span>',
                        '</div>',
                        '<div>',
                          '<span class="planTemplate-control-delete">删除</span> <i>|</i> <span class="planTemplate-control-save">保存</span>',
                        '</div>',
                        '<span class="planTemplate-control-close"></span>',
                      '</div>');
            html.push('<div class="planTemplate-time"></div>');
            html.push('</div>');

            this.$context.append($(html.join('')));
            this.$control = $('.planTemplate-control', this.$context);
            this.$tipsLeft = $('span.planTemplate-tips-left', this.$context);
            this.$tipsRight = $('span.planTemplate-tips-right', this.$context);
            this.$time = $('.planTemplate-time', this.$context);


            // 是否显示添加按钮
            if (this.settings.addable) {
                this.initAddBtn();
                //$('.planTemplate-add', this.$context).click();
                $('.planTemplate-scale', this.$context).first().addClass('planTemplate-scale-first');
            }
        },

        /**@ignore*/
        createHeader: function() {
            var that = this,setts = this.settings;
            var html = [];
            var $header = null;

            html.push('<div class="planTemplate-header" style="width:'+(this.scaleWidth.swidth + 80)+'px"><ul class="planTemplate-actions">');
            if(setts.actionButtons && setts.actionButtons.length > 0){
               for(var i = 0,len = setts.actionButtons.length; i < len; i++){
                  if(setts.actionButtons[i].html){
                      html.push('<li>' + setts.actionButtons[i].html +'</li>');
                  }else
                    html.push('<li class="btn-group"><a class="buttonS" href="javascript:void(0);"> <span class="' + setts.actionButtons[i].cls + '"></span><span>'+setts.actionButtons[i].text+'</span></a></li>');
               };
            }
            html.push('</ul></div>');

            $header = $(html.join('')).appendTo(this.$context);

            $header.find('.buttonS').each(function(i,m){
                if(setts.actionButtons[i].click){
                    $(this).bind('click',function(){
                        setts.actionButtons[i].click.call(that);
                    });
                }
            });
            // 是否显示切换状态按钮
            if (this.settings.showButtons) {
                this.initButtons();
            }

            // 是否显示标题文字
            if (this.settings.title) {
                $header.prepend('<span class="planTemplate-title">' + this.settings.title + '</span>');
            }
        },

        /**@ignore*/
        initButtons: function() {
            var that = this, html = [],setts = this.settings, buttons = setts.buttons,$buttons;

            html.push('<ul class="planTemplate-buttons">')

            for (var i = 0; i < buttons.length; i++) {
                html.push('<li data-type="' + buttons[i].type + '" data-color="' + setts.typeMap[buttons[i].type]  + '" class="' +  setts.typeMap[buttons[i].type] +'">' + buttons[i].text + '</li>')
            }

            html.push('</ul>')

            $buttons = $(html.join('')).appendTo(this.$context.find('.planTemplate-header'));

            $buttons.on('click', 'li', function() {
                var $siblings =  $(this).siblings('.selected').removeClass('selected')
                $(this).addClass('selected');
                that.currentColor = $(this).data('color');
                if($siblings.data('color'))
                    that.$context.removeClass($siblings.data('color')).addClass(that.currentColor);
                else
                    that.$context.addClass(that.currentColor);
                that.currentType = $(this).data('type');
            });

            $buttons.find('li:first').click();

        },

        /**@ignore*/
        initAddBtn: function() {
            var that = this;

            this.$context.find('.planTemplate-actions').prepend('<li class="btn-group"><a class="buttonS planTemplate-add" href="javascript:void(0);"> <span class="ico i-add"></span><span>添加</span></a></li>');

            this.$context.on('click', '.planTemplate-add', function() {
                if ($('.planTemplate-bar', that.$context).length < that.settings.maxBarNum) {
                    that.addBar();
                } else {
                    alert('最多配置16个假日');
                }
            });

        },

        /**@ignore*/
        // TODO 目前增加一行只针对假日计划，不适用其他类型，后期需要的话可以针对不同的类型做处理
        addBar: function() {
            var that = this;
            var html = [];
            var index = $('.planTemplate-bar', this.$context).length;
            var startId = 'planTemplate_label_' + index + '_starttime_' + $.now(); // 创建唯一的id
            var endId = 'planTemplate_label_' + index + '_endtime_' + $.now();
            var $start = null;
            var $end = null;

            html.push(this.scaleHTML(index,index+1,this.settings.addable));

            $('.planTemplate-last', this.$context).removeClass('planTemplate-last').after(html.join(''));

            this.setStyle();
            this.position.push([]);
            this.time.push([]);


            $start = $('#' + startId, this.$context);
            $end = $('#' + endId, this.$context);
            var startSelectedDate = '';
            var endSelectedDate = '';
        },

        /**@ignore*/
        setStyle: function() {
            var settings = this.settings;

            // 单位高度
            var oneHeight = settings.barHeight + settings.scaleHeight;
            $('.planTemplate-bar', this.$context).each(function(index) {
                $(this).css({
                    // scaleHeight + 1为第一个刻度条的高度
                    //top: index * oneHeight + (settings.scaleHeight + 1)
                });

                $(this).data('index', index);
            });

            $('.planTemplate-scale', this.$context).each(function(index) {
                if (index == 0) {
                    $(this).css({
                        top: 1
                    })
                } else {
                    $(this).css({
                        //top: index * oneHeight + 1
                    })
                }
            });
            //+2是为了计算上下的border值
            $('.planTemplate-label', this.$context).each(function(index) {
                $(this).css({
                    top: index * (oneHeight+2) + (settings.scaleHeight + 1)
                })
            });

            $('.planTemplate-last', this.$context).each(function(index) {
                $(this).css({
                    //top: -16
                })
            });

            $('.planTemplate-delete', this.$context).each(function(index) {
                $(this).css({
                    top: index*(oneHeight+2) +  settings.scaleHeight + (settings.barHeight-28)/2
                })
            });
        },

        /**
         * @ignore
         *  供外部的调用的验证方法，只针对有添加功能的计划模板
         * */
        isValid: function() {
            if (!this.settings.addable) {
                return;
            }
            var that = this;
            var date = [];
            var sortedDate = null;
            var errorInfo = '';
            var len;

            $('.planTemplate-label', that.$context).each(function(index) {
                var $input = $(this).find('input');
                var startTime = $input.eq(0).val();
                var endTime = $input.eq(1).val();

                if (startTime == '开始时间' || startTime == '' || endTime == '结束时间' || endTime == '') {
                    errorInfo += '第' + (index + 1) + '个假日的开始时间或结束时间未设置<br>';
                } else {
                    date.push([new Date(startTime).getTime(), new Date(endTime).getTime()]);
                }
                
            });

            if (errorInfo != '') {
                alert(errorInfo);
                return false;
            }

            sortedDate = that.sort(date);
            len = sortedDate.length;

            if (len > 1) {
                $.each(date, function(index, element) {
                    if (errorInfo != '') {
                        return;
                    }

                    for (var i = 0; i < len; i++) {
                        if (element[0] == sortedDate[i][0] && element[1] == sortedDate[i][1]) {
                            if (i == 0) {
                                if (sortedDate[i][1] >= sortedDate[i + 1][0]) {
                                    errorInfo += '第' + (index + 1) + '个假日的时间设置有冲突';
                                    break;
                                }
                            } else if (i == len - 1) {
                                if (sortedDate[i][0] <= sortedDate[i - 1][1]) {
                                    errorInfo += '第' + (index + 1) + '个假日的时间设置有冲突';
                                    break;
                                }
                            } else {
                                if (sortedDate[i][0] <= sortedDate[i - 1][1] || sortedDate[i][1] >= sortedDate[i + 1][0]) {
                                    errorInfo += '第' + (index + 1) + '个假日的时间设置有冲突';
                                    break;
                                }
                            }
                        }
                    }
                })
            }

            if (errorInfo != '') {
                alert(errorInfo);
                return false;
            }
            
            return true;
        },
        /**
         *
         * @method  获取时间计划控件里的值
         * @description
         * 周末班返回数组的格式，特殊日模版返回如下形式对象
         * var obj = {
         *     date : [],
         *     plan : []
         * }
         */
        getData: function() {
            var data = [],date = [],result = [], i, j,temp = $.extend(true, [], this.time);
            result.push('<data>');
            for (i = 0; i < temp.length; i++) {
                for (j = 0; j < temp[i].length; j++) {
                    var start =   (temp[i][j][0]/3600).toFixed(2).split('.'),stop=(temp[i][j][1]/3600).toFixed(2).split('.');
                    result.push('<row week="' + (i + 1 ) + '" type="' + temp[i][j][2] + '" start="'+ (/\d{2}/.test(start[0]) ? start[0] : '0' + start[0]) + start[1] +'" stop="' + (/\d{2}/.test(stop[0]) ? stop[0] : '0' + stop[0]) + stop[1] + '"></week>');
                }
            }
            result.push('</data>');
            if (this.settings.addable) {
                $('.planTemplate-label', this.$context).each(function(index) {
                    var $input = $(this).find('input');
                    var startTime = $input.eq(0).val();
                    var endTime = $input.eq(1).val();
                    date.push(startTime + ',' + endTime);
                })

                return {
                    date: date,
                    plan: result.join('')
                }
            } else {
                return result.join('');
            }
        },

        /**
         *
         * @method  设置数据到时间计划控件里面
         * @param dataObj  数据格式为数组  每个子项里包含所有的时间单位，精确到秒,包含开始时间，结束时间，类型，以分号分割每对数据
         * @description 设值，使用方法见示例
         * @example
         * 1.周模板的数据格式
         * var dataobj = '<data><row week="1" type="1" start="0600" stop="0900"/> </data>'
         * var week = $('schedule').planTemplate({});
         * week.setData(dataobj);
         *
         * 2.特殊日模版的数据格式
         * var holidayData = {
         *   date: ['2014-05-01,2014-05-03', '2014-09-06,2014-09-08'],
         *   plan: <data><row week="1" type="1" start="0600" stop="0900"/> <row week="2" type="1" start="0600" stop="0900"/></data>
         */
        setData: function(dataObj) {
            if (!dataObj) {
                return;
            }

            var data;

            if (this.settings.addable) {
                data = dataObj.plan;

                for (var i = 0; i < data.length - 1; i++) {
                    this.addBar();
                }

                $('.planTemplate-label', this.$context).each(function(index) {
                    var dateArr = dataObj.date[index].split(',')
                    $(this).find('input').eq(0).val(dateArr[0]);
                    $(this).find('input').eq(1).val(dateArr[1]);
                })

            } else {
                data = dataObj;
            }

            this.initPanel();
            this.time = [];
            this.position = [];


            var xmlDoc = $.string2Xml(data) ,root = xmlDoc.getElementsByTagName("data")[0],childs = root.childNodes,len = childs.length,weekValue = {};
            for (var i = 0; i < len; i++) {
                var start = childs[i].getAttribute('start'),stop = childs[i].getAttribute('stop'),type =  childs[i].getAttribute('type'),week = childs[i].getAttribute('week'),value = [];
                value.push((parseInt(start.slice(0,2),10)+ parseInt(start.slice(-2),10)/100) * 3600);
                value.push((parseInt(stop.slice(0,2),10)+ parseInt(stop.slice(-2),10)/100) * 3600);
                value.push(type);
                if(!weekValue[week])
                    weekValue[week] = [];
                weekValue[week].push(value);
            }
            for(var prop in weekValue){
                this.time.push(weekValue[prop]);
            }

            this.timeToPosition();

            this.render(this.position);
        },
        /**
         *
         * @method  删除当前选中的计划
         * @description 删除当前选中的计划
         */
        deleteCurrentSelection : function(){
            if(!this.$currentSlider){
                jAlert('请先选择要删除的计划');
                return;
            }
            var sliderIndex = this.$currentSlider.index();
            var barIndex = this.$currentSlider.parent().data('index');

            // $('.planTemplate-copy-button', that.$context).hide();

            this.position[barIndex].splice(sliderIndex, 1);
            this.time[barIndex].splice(sliderIndex, 1);

            this.$currentSlider.remove();
            this.$control.hide();
        },
        /**
         *
         * @method  清空所有的录像计划
         * @description 清空所有的录像计划
         */
        deleteAll :function(){
            this.initData();
            this.initPanel();
        },
        /**
         *
         * @method  拷贝到所有星期
         * @description 拷贝到所有星期
         */
        copyToAll : function(){
            if(!this.$currentSlider){
                jAlert('请先选择赋值的模版');
                return;
            }
            var barIndex = this.$currentSlider.parent().data('index');
            var time = $.extend([],this.time[barIndex]);
            var position = $.extend([],this.position[barIndex]);


            var len = this.settings.label.length,index = 0;
            for(var i =0; i< len; i++){
                this.position[i] = $.extend(true, [], position);
                this.time[i] = $.extend(true, [], time);
            }

            this.initPanel();
            this.render(this.position);
        },
         /**
          * @ignore
          * 把时间数组转换为位置数组
          * */
        timeToPosition: function() {
            var i, j, k;
            var arr = $.extend(true, [], this.time);
            var stepMinutes = this.settings.stepMinutes;
            var stepWidth = this.settings.stepWidth;

            if (this.hasType) {
                for (i = 0; i < arr.length; i++) {
                    for (j = 0; j < arr[i].length; j++) {
                        arr[i][j][0] = Math.floor((arr[i][j][0] * stepWidth) / (stepMinutes * 60));
                        arr[i][j][1] = Math.ceil((arr[i][j][1] * stepWidth) / (stepMinutes * 60));
                        arr[i][j][2] = arr[i][j][2];
                    }
                }
            } else {
                for (i = 0; i < arr.length; i++) {
                    for (j = 0; j < arr[i].length; j++) {
                        arr[i][j][0] = Math.floor((arr[i][j][0] * stepWidth) / (stepMinutes * 60));
                        arr[i][j][1] = Math.ceil((arr[i][j][1] * stepWidth) / (stepMinutes * 60));
                    }
                }
            }

            this.position = arr;
        },
        /**
         * @ignore
         *  把位置数组转换为时间数组，只适用于没有精确调整的情形
         *  注意：已经废弃 2014-08-03 by lqh
         * */
        positionToTime: function() {
            var i, j, k;
            var arr = $.extend(true, [], this.position);
            var stepMinutes = this.settings.stepMinutes;
            var stepWidth = this.settings.stepWidth;

            if (this.hasType) {
                for (i = 0; i < arr.length; i++) {
                    for (j = 0; j < arr[i].length; j++) {
                        arr[i][j][0] = (arr[i][j][0] / stepWidth) * stepMinutes * 60;
                        arr[i][j][1] = (arr[i][j][1] / stepWidth) * stepMinutes * 60;
                        arr[i][j][2] = arr[i][j][2];
                    }
                }
            } else {
                for (i = 0; i < arr.length; i++) {
                    for (j = 0; j < arr[i].length; j++) {
                        for (k = 0; k < arr[i][j].length; k++) {
                            arr[i][j][k] = (arr[i][j][k] / stepWidth) * stepMinutes * 60;
                        }
                    }
                }
            }

            this.time = arr;

        },

        /**@ignore 数据渲染*/
        render: function(pos) {
            var $bar = $('.planTemplate-bar', this.$context), html = [], color = '',setts = this.settings;

            if (this.hasType) {
                for (var i = 0; i < pos.length; i++) {
                    html = [];
                    for (var j = 0; j < pos[i].length; j++) {
                        color = setts.typeMap[pos[i][j][2]] ? setts.typeMap[pos[i][j][2]] : setts.sliderColor;
                        html.push('<div class="planTemplate-slider planTemplate-slider-created ' + color+ '" style="width:' + (pos[i][j][1] - pos[i][j][0]) + 'px; left:' + pos[i][j][0] +'px;height:'+(this.settings.barHeight)+'px;">',
                                    '<i class="planTemplate-slider-left"></i>',
                                    '<i class="planTemplate-slider-right"></i>',
                                '</div>')
                    }
                    $bar.eq(i).append(html.join(''));
                }
            } else {
                for (var i = 0; i < pos.length; i++) {
                    html = [];
                    for (var j = 0; j < pos[i].length; j++) {
                        html.push('<div class="planTemplate-slider planTemplate-slider-created '+ color +'" style="width:' + (pos[i][j][1] - pos[i][j][0]) + 'px; left:' + pos[i][j][0] +'px;height:'+ (this.settings.barHeight) +'px;">',
                                    '<i class="planTemplate-slider-left"></i>',
                                    '<i class="planTemplate-slider-right"></i>',
                                '</div>')
                    }
                    $bar.eq(i).append(html.join(''));
                }
            }
            
        },

        /**@ignore 把一组时间字符串转化为数组*/
        timeStrToArr: function(str) {
            if (!str) {
                return [];
            }
            var a = str.split(";");
            var b = [];
            for(var i=0; i<a.length;i++){
                if(a[i]){
                    var c = a[i].split(",");
                    var d = [];
                    for(var j=0; j<c.length; j++){
                        if(j == 1){
                            d.push(parseInt(c[j]) + 1);
                        } else {
                            d.push(parseInt(c[j]));
                        }
                    }
                    b.push(d);
                }
            }
            return b;
        },
        /**@ignore */
        updateData: function(barIndex, sliderIndex, begin, end) {
            var stepWidth = this.settings.stepWidth;

            if (this.hasType) {
                this.position[barIndex][sliderIndex] = [begin, end, this.position[barIndex][sliderIndex][2]];
            } else {
                this.position[barIndex][sliderIndex] = [begin, end];
            }
        },
        /**@ignore */
        updateTime: function(barIndex, sliderIndex, begin, end, oldBegin, oldEnd) {
            var stepWidth = this.settings.stepWidth;
            var stepMinutes = this.settings.stepMinutes;
            var oldStartTime = this.time[barIndex][sliderIndex][0];
            var oldEndTime = this.time[barIndex][sliderIndex][1];
            var x = (begin - oldBegin) / stepWidth * stepMinutes * 60;
            var y = (end - oldEnd) / stepWidth * stepMinutes * 60;
            var startTime = oldStartTime + x;
            var endTime = oldEndTime + y;

            if (this.hasType) {
                this.time[barIndex][sliderIndex] = [startTime, endTime, this.time[barIndex][sliderIndex][2]];
            } else {
                this.time[barIndex][sliderIndex] = [startTime, endTime];
            }
        },
        /**@ignore */
        insertData: function(barIndex, begin, end) {
            var stepWidth = this.settings.stepWidth;
            var stepMinutes = this.settings.stepMinutes;
            var startTime = (begin / stepWidth) * stepMinutes * 60;
            var endTime = (end / stepWidth) * stepMinutes * 60;

            if (this.hasType) {
                this.position[barIndex].push([begin, end, this.currentType]);
                this.time[barIndex].push([startTime, endTime, this.currentType]);
            } else {
                this.position[barIndex].push([begin, end]);
                this.time[barIndex].push([startTime, endTime]);
            }
        },
        /**@ignore */
        sort: function(array) {
            var temp = $.extend(true, [], array);

            temp.sort(function(x, y) {
                return x[0] - y[0];
            });

            return temp;
        },
        /**@ignore */
        getArea: function(array, position) {
            var arr = null;
            var min = 0;
            var max = this.barWidth;
            var availableArea = [];
            arr = this.sort(array);
			
            arr.unshift([min, min]);
            arr.push([max, max]);

            if ($.isArray(position)) {
                for (var i = 1; i < arr.length; i++) {
                    if (arr[i][0] == position[0]) {
                        availableArea.push(arr[i - 1][1], arr[i + 1][0]);
                        return availableArea;
                    }
                }
            } else {
                for (var i = 0; i < arr.length - 1; i++) {
                    if (position >= arr[i][1] && position <= arr[i + 1][0]) {
                        availableArea.push(arr[i][1], arr[i + 1][0]);
                        return availableArea;
                    }
                }
            }

            if (availableArea.length == 0) {
                console.log('出错了！');
            }
        },
        /**@ignore IE下取消文字选中，不然拖拽效果受影响，其他浏览器通过css进行设置*/
        cancelSelect: function() {
            this.$context[0].onselectstart = function() {
                return false;
            };
        },
        /**@ignore */
        getNowTime: function() {
            var now = new Date();
            var year = now.getFullYear();
            var month;
            var day;

            month = now.getMonth();
            month = this.formatNum(month + 1);
            day = this.formatNum(now.getDate());

            return year + '-' + month + '-' + day;

        },
        /**@ignore */
        paint: function() {
            var that = this;
            var startPageX = 0;     // mousedown的pageX
            var $slider = null;     // 当前paint动作的slide元素
            var left = 0;           // 距离父元素的left值
            var rMaxWidth = 0;      // 向右的最大宽度
            var lMaxWidth = 0;      // 向左的最大宽度
            var minWidth = this.settings.stepWidth;
            var barWidth = this.barWidth;
            var $parent = null;

            // mousedown的时候生成slide元素，绑定document的mousemove和mouseup事件
            var mousedownEvent = function(e) {
                var $this = $(this);
                var remainder = 0; // 余数
                var availableArea = null;
                var barIndex;

                // 限制slider的数量
                if ($this.find('.planTemplate-slider').length >= that.settings.maxSliderNum) {
                    return;
                }

                // 生成当前slider元素
                $slider = $('<div class="planTemplate-slider ' + that.currentColor 
                        + '"><i class="planTemplate-slider-left"></i><i class="planTemplate-slider-right"></i></div>')
                        .appendTo($this);
                $slider.css('height',that.settings.barHeight);

                startPageX = e.pageX;

                // 这里的-1为bar的1像素边框
                left = startPageX - $this.offset().left - 1;
                remainder = left % minWidth;

                // 求整
                left = left - remainder;
                // startPageX = startPageX - remainder;

                $parent = $slider.parent();

                // 当前slider所在的行索引值
                barIndex = $parent.data('index');

                // 获取可以进行拖拽的区域
                availableArea = that.getArea(that.position[barIndex], left);
                rMaxWidth = availableArea[1] - left;
                lMaxWidth = left - availableArea[0] + minWidth;

                $(document).on('mousemove.slider', mousemoveEvent);
                $(document).on('mouseup.slider', mouseupEvent);

                // return false;
                e.stopPropagation();

                // 移除其他slider的选中状态
                if (that.$currentSlider) {
                    that.$currentSlider.children().hide();
                    that.$currentSlider.removeClass('planTemplate-slider-current');
                    // $('.planTemplate-copy-button', that.$context).hide();
                    // $('.planTemplate-copy', that.$context).hide();
                    that.$currentSlider = null;
                    that.$control.hide();
                }

                e.stopPropagation();
            };

            var mousemoveEvent = function(e) {
                var width = 0;

                // 判断正向拖动还是反向拖动
                if (e.pageX >= startPageX) {
                    width = e.pageX - startPageX;
                    width = Math.ceil(width / minWidth) * minWidth;
                    width = width < rMaxWidth ? width : rMaxWidth;
                    $slider.width(width);
                    $slider.css({
                        left: left
                    });
                    if (width > 0) {
                        that.showTips(left, width, $parent);
                    }
                } else {
                    width = startPageX - e.pageX;
                    width = Math.ceil(width / minWidth) * minWidth;
                    width = width < lMaxWidth ? width : lMaxWidth
                    $slider.width(width);
                    $slider.css({
                        left: left + minWidth - width
                    });
                    if (width > 0) {
                        that.showTips(left + minWidth - width, width, $parent, true);
                    }
                }
            };

            var mouseupEvent = function() {
                var barIndex = 0;
                var begin = 0;
                var end = 0;

                if ($slider.width() == 0) {
                    $slider.remove();
                } else {

                    // 当前索引
                    barIndex = $parent.data('index');
                    begin = parseInt($slider.css('left'));
                    end = begin + $slider.width();

                    that.insertData(barIndex, begin, end);
                }

                $slider.addClass('planTemplate-slider-created');

                that.$tipsLeft.hide();
                that.$tipsRight.hide();

                $(document).off('mousemove.slider');
                $(document).off('mouseup.slider');

            };

            this.$context.on('mousedown', '.planTemplate-bar', mousedownEvent);
        },

        /**@ignore  整块拖动*/
        drag: function() {
            var that = this;
            var startPageX = 0;
            var $slider = null;     // 当前paint动作的slide元素
            var left = 0;           // 距离父元素的left值
            var rMaxLength = 0;     // 向右的最大拖动距离
            var lMaxLength = 0;     // 向左的最大拖动距离
            var minWidth = this.settings.stepWidth;
            var barWidth = this.barWidth;
            var barHeight = this.settings.barHeight;
            var barIndex = 0;
            var sliderWidth = 0;
            var $control = this.$control;
            var $parent = null;

            var mousedownEvent = function(e) {
                var currentPos;
                var availableArea;

                $slider = $(this);
                left = parseInt($slider.css('left'));
                startPageX = e.pageX;

                // lMaxLength = left;
                // rMaxLength = barWidth - left - $slider.width();

                // 当前slider所在的行索引值
                $parent = $slider.parent();
                barIndex = $parent.data('index');
                currentPos = that.position[barIndex];
                sliderWidth = $slider.width();
                availableArea = that.getArea(currentPos, [left, left + sliderWidth]);
                lMaxLength = left - availableArea[0];
                rMaxLength = availableArea[1] - left - sliderWidth;

                $control.hide();

                $(document).on('mousemove.drag', mousemoveEvent);
                $(document).on('mouseup.drag', mouseupEvent);
                e.stopPropagation();
            };

            var mousemoveEvent = function(e) {
                var length = e.pageX - startPageX;

                length = Math.floor(length / minWidth) * minWidth;
                if (length > rMaxLength) {
                    length = rMaxLength
                } else if ((-length) > lMaxLength) {
                    length = -lMaxLength;
                }
                $slider.css({
                    left: left + length
                });

                if (length !== 0) {
                    that.showTips(left + length, sliderWidth, $parent);
                }

            };

            var mouseupEvent = function(e) {
                var begin = parseInt($slider.css('left'));

                that.updateData(barIndex, $slider.index(), begin, begin + sliderWidth);
                that.updateTime(barIndex, $slider.index(), begin, begin + sliderWidth, left, left + sliderWidth);

                that.showControl($slider);
                that.$time.hide();

                that.$tipsLeft.hide();
                that.$tipsRight.hide();

                $(document).off('mousemove.drag');
                $(document).off('mouseup.drag');
            };

            this.$context.on('mousedown', '.planTemplate-slider', mousedownEvent);
        },

        /**@ignore 左右伸缩*/
        draw: function() {
            var that = this;
            var startPageX = 0;
            var $slider = null;     // 当前paint动作的slide元素
            var left = 0;           // 距离父元素的left值
            var rMaxLength = 0;     // 向右的最大拖动距离
            var lMaxLength = 0;     // 向左的最大拖动距离
            var minWidth = this.settings.stepWidth;
            var barWidth = this.barWidth;
            var barIndex = 0;
            var sliderWidth = 0;
            var $control = this.$control;
            var $parent = null;

            var mousedownEventRight = function(e) {
                if (!that.$currentSlider) {
                    return;
                }

                var currentPos;
                var availableArea;

                $slider = $(this).parent();
                $slider.addClass('planTemplate-slider-draw');
                left = parseInt($slider.css('left'));
                startPageX = e.pageX;

                $parent = $slider.parent();

                // 当前slider所在的行索引值
                barIndex = $slider.parent().data('index');

                // 当前所在的bar的slider位置数组信息
                currentPos = that.position[barIndex];
                sliderWidth = $slider.width();

                // 可用的位置区间
                availableArea = that.getArea(currentPos, [left, left + sliderWidth]);

                // 向左的最大长度
                lMaxLength = sliderWidth - minWidth;

                // 向右的最大长度
                rMaxLength = availableArea[1] - left - sliderWidth;

                $(document).on('mousemove.draw', mousemoveEventRight);
                $(document).on('mouseup.draw', mouseupEventRight);

                e.stopPropagation();

                $control.hide();
            };

            var mousemoveEventRight = function(e) {
                var length = e.pageX - startPageX;

                length = Math.ceil(length / minWidth) * minWidth;
                if (length > rMaxLength) {
                    length = rMaxLength;
                } else if ((-length) > lMaxLength) {
                    length = -lMaxLength;
                }

                $slider.width(sliderWidth + length);
                // $slider.css({
                //     left: left + length
                // });
                
                if (length !== 0) {
                    that.showTips(left, sliderWidth + length, $parent);
                }

                e.stopPropagation();
            };

            var mouseupEventRight = function(e) {
                var begin = parseInt($slider.css('left'));

                that.updateData(barIndex, $slider.index(), begin, begin + $slider.width());
                that.updateTime(barIndex, $slider.index(), begin, begin + $slider.width(), left, left + sliderWidth);

                $slider.removeClass('planTemplate-slider-draw');

                that.showControl($slider);
                that.$time.hide();

                that.$tipsLeft.hide();
                that.$tipsRight.hide();

                $(document).off('mousemove.draw');
                $(document).off('mouseup.draw');

                e.stopPropagation();
            };

            var mousedownEventLeft = function(e) {
                if (!that.$currentSlider) {
                    return;
                }

                var currentPos;
                var availableArea;

                $slider = $(this).parent();
                $slider.addClass('planTemplate-slider-draw');
                left = parseInt($slider.css('left'));
                startPageX = e.pageX;

                $parent = $slider.parent();

                // 当前slider所在的行索引值
                barIndex = $slider.parent().data('index');

                // 当前所在的bar的slider位置数组信息
                currentPos = that.position[barIndex];
                sliderWidth = $slider.width();

                // 可用的位置区间
                availableArea = that.getArea(currentPos, [left, left + sliderWidth]);

                // 向左的最大长度
                lMaxLength = left - availableArea[0];

                // 向右的最大长度
                rMaxLength = sliderWidth - minWidth;

                $(document).on('mousemove.draw', mousemoveEventLeft);
                $(document).on('mouseup.draw', mouseupEventLeft);

                e.stopPropagation();

                $control.hide();
            };

            var mousemoveEventLeft = function(e) {
                var length = e.pageX - startPageX;

                length = Math.floor(length / minWidth) * minWidth;
                if (length > rMaxLength) {
                    length = rMaxLength;
                } else if ((-length) > lMaxLength) {
                    length = -lMaxLength;
                }

                $slider.width(sliderWidth - length);
                $slider.css({
                    left: left + length
                });

                e.stopPropagation();

                if (length !== 0) {
                    that.showTips(left + length, sliderWidth - length, $parent);
                }
            };

            var mouseupEventLeft = function(e) {
                var begin = parseInt($slider.css('left'));

                that.updateData(barIndex, $slider.index(), begin, begin + $slider.width());
                that.updateTime(barIndex, $slider.index(), begin, begin + $slider.width(), left, left + sliderWidth);

                $slider.removeClass('planTemplate-slider-draw');

                that.showControl($slider);
                that.$time.hide();

                that.$tipsLeft.hide();
                that.$tipsRight.hide();

                $(document).off('mousemove.draw');
                $(document).off('mouseup.draw');

                e.stopPropagation();
            };

            this.$context.on('mousedown', '.planTemplate-slider-right', mousedownEventRight);
            this.$context.on('mousedown', '.planTemplate-slider-left', mousedownEventLeft);
        },
        /**@ignore */
        click: function() {
            var that = this;

            var mousedownEvent = function(e) {
                var $this = $(this);

                if (that.$currentSlider) {
                    that.$currentSlider.children().hide();
                    that.$currentSlider.removeClass('planTemplate-slider-current');
                    // $('.planTemplate-copy-button', that.$context).hide();
                    // $('.planTemplate-copy', that.$context).hide();
                }
                $this.addClass('planTemplate-slider-current');
                $this.children().show();

                // $('.planTemplate-copy-button', that.$context).css({
                ///     top: $this.parent().css('top')
                //}).show();

                // $('.planTemplate-copy').css({
                //     top: parseInt($this.parent().css('top')) - 64
                // });

                that.$currentSlider = $this;

                e.stopPropagation();
            }

            that.$context.on('mousedown.click', '.planTemplate-slider', mousedownEvent);
            
        },
        /**@ignore */
        hover: function() {
            var that = this;
            var $time = $('.planTemplate-time', this.$context);
            this.$context.on('mouseenter', '.planTemplate-slider-created', function() {
                var $this = $(this);
                var $parent = $this.parent();
                var barIndex = $parent.data('index');
                var sliderIndex = $this.index();
                var labelWidth = that.labelWidth;
                var begin = that.position[barIndex][sliderIndex][0];
                var end = that.position[barIndex][sliderIndex][1];
                var timeObj = that.formatTime(that.time[barIndex][sliderIndex][0], that.time[barIndex][sliderIndex][1]);
                
                $time.text(timeObj.beginHours + ':' + timeObj.beginMinutes + ' - ' + timeObj.endHours + ':' + timeObj.endMinutes);
                $time.css({
                    left: labelWidth + begin + (end - begin) / 2 - $time.outerWidth() / 2,
                    top: barIndex*(that.settings.barHeight + that.settings.scaleHeight+ 2)  -$this.outerHeight() - 8
                }).show();
            });

            this.$context.on('mouseleave', '.planTemplate-slider', function() {
                $time.hide();
            });

        },
        /**@ignore */
        formatTime: function(beginTime, endTime) {
            var beginHours = this.formatNum(Math.floor(beginTime/3600));
            var beginMinutes = this.formatNum(Math.floor((beginTime%3600)/60))
            var endHours = this.formatNum(Math.floor(endTime/3600));
            var endMinutes = this.formatNum(Math.floor((endTime%3600)/60));
            
            // var beginHours = this.formatNum(Math.floor(beginTime / 3600));
            // var beginMinutes = this.formatNum(Math.floor((beginTime - beginHours * 3600) / 60));
            // var endHours = this.formatNum(Math.floor(endTime / 3600));
            // var endMinutes = this.formatNum(Math.floor((endTime - endHours * 3600) / 60));


            return {
                beginHours: beginHours,
                beginMinutes: beginMinutes,
                endHours: endHours,
                endMinutes: endMinutes
            }
        },
        /**@ignore */
        formatNum: function(num) {
            return num < 10 ? '0' + num : num;
        },
        /**@ignore */
        showTips: function(left, width, $parent, reverse) {
            var that = this;
            var top = $parent.data('index')*(that.settings.barHeight + that.settings.scaleHeight + 2) - that.$tipsLeft.outerHeight();
            var stepWidth = this.settings.stepWidth;
            var stepMinutes = this.settings.stepMinutes;
            var startTime = left * stepMinutes * 60 / stepWidth;
            var endTime = (left + width) * stepMinutes * 60 / stepWidth;
            var timeObj = that.formatTime(startTime, endTime);

            that.$time.hide();

            that.$tipsLeft.css({
                left: left + that.labelWidth - 17,
                top: top
            });

            that.$tipsRight.css({
                left: left + width + that.labelWidth - 18,
                top: top
            })

            that.$tipsLeft.text(timeObj.beginHours + ':' + timeObj.beginMinutes).show();
            that.$tipsRight.text(timeObj.endHours + ':' + timeObj.endMinutes).show();

        },
        /**@ignore */
        showControl: function($slider) {
            var that = this;
            var $this = $slider;
            var $parent = $this.parent();
            var barIndex = $parent.data('index');
            var sliderIndex = $this.index();
            var timeObj = that.formatTime(that.time[barIndex][sliderIndex][0], that.time[barIndex][sliderIndex][1]);
            var begin = that.position[barIndex][sliderIndex][0];
            var end = that.position[barIndex][sliderIndex][1];
            var beginTime = that.time[barIndex][sliderIndex][0];
            var endTime = that.time[barIndex][sliderIndex][1];
            endTime = endTime == 24 * 3600 ? endTime - 1 : endTime;
            var $control = this.$control;
            var $start = $control.find('.planTemplate-control-startTime');
            var $end = $control.find('.planTemplate-control-endTime');
            var beginHours = that.formatNum(Math.floor(beginTime/3600));
            var beginMinutes = that.formatNum(Math.floor((beginTime%3600)/60))
            var endHours = that.formatNum(Math.floor(endTime/3600));
            var endMinutes = that.formatNum(Math.floor((endTime%3600)/60));

            $control.css({
                left: that.labelWidth + begin + (end - begin) / 2 - $control.outerWidth() / 2,
                top: barIndex*(this.settings.barHeight + this.settings.scaleHeight + 2) - $control.outerHeight() + 3
            });

            $start.val(beginHours + ':' + beginMinutes);
            $end.val(endHours + ':' + endMinutes);

            $control.show();
        },
        /**@ignore */
        initControl: function() {
            var that = this;
            var $control = this.$control;
            var startId = 'planTemplate-control-startTime' + PlanTemplate.index;
            var endId = 'planTemplate-control-endTime' + PlanTemplate.index;
            var $start = $('#' + startId, that.$context);
            var $end = $('#' + endId, that.$context);

            seajs.use('{hikui}/calendar/wdatepicker', function(WdatePicker) {
                $('#' + startId).click(function() {
                    WdatePicker({
                        el: startId,
                        dateFmt:'HH:mm',
                        isShowClear: false,
                        isShowOK: true,
                        isShowToday: false
                    });
                });

                $('#' + endId).click(function() {
                    WdatePicker({
                        el: endId,
                        dateFmt:'HH:mm',
                        isShowClear: false,
                        isShowOK: true,
                        isShowToday: false
                    });
                });
            });


            this.$context.on('click', '.planTemplate-control-close', function() {
                $control.hide();
            });

            this.$context.on('click', '.planTemplate-control-delete', function() {
                var sliderIndex = that.$currentSlider.index();
                var barIndex = that.$currentSlider.parent().data('index');

                // $('.planTemplate-copy-button', that.$context).hide();

                that.position[barIndex].splice(sliderIndex, 1);
                that.time[barIndex].splice(sliderIndex, 1);

                that.$currentSlider.remove();
                $control.hide();

            });

            this.$context.on('click', '.planTemplate-control-save', function() {
                var $slider = that.$currentSlider;
                var sliderIndex = $slider.index();
                var barIndex = $slider.parent().data('index');
                var availableArea;
                var beginTime = $start.val().split(':');
                var endTime = $end.val().split(':');
                var stepMinutes = that.settings.stepMinutes;

                beginTime = parseInt(beginTime[0], 10) * 3600 + parseInt(beginTime[1], 10) * 60;
                endTime = parseInt(endTime[0], 10) * 3600 + parseInt(endTime[1], 10) * 60;

                availableArea = that.getTimeArea(that.time[barIndex], that.time[barIndex][sliderIndex][0]);

                if (beginTime < availableArea[0] || endTime > availableArea[1] || beginTime >= endTime) {
                    alert('时间设置有误，请重新设置');
                } else {
                    that.position[barIndex][sliderIndex][0] = Math.floor(beginTime * that.settings.stepWidth / stepMinutes / 60);
                    that.position[barIndex][sliderIndex][1] = Math.ceil(endTime * that.settings.stepWidth / stepMinutes / 60);

                    that.time[barIndex][sliderIndex][0] = beginTime;
                    that.time[barIndex][sliderIndex][1] = endTime;
					
                    $slider.css({
                        left: that.position[barIndex][sliderIndex][0],
                        width: that.position[barIndex][sliderIndex][1] - that.position[barIndex][sliderIndex][0]
                    })

                    $control.hide();
                }
                
            });

            this.$context.on('dblclick.control', '.planTemplate-slider', function() {
                // that.showControl($(this));
                // that.$time.hide();
            });
        },
        /**@ignore */
        getTimeArea: function(barTime, beginTime) {
            var arr = null;
            var min = 0;
            var max = 24 * 60 * 60;
            var availableArea = [];

            arr = this.sort(barTime);

            arr.unshift([min, min]);
            arr.push([max, max]);

            for (var i = 1; i < arr.length; i++) {
                if (arr[i][0] == beginTime) {
                    availableArea.push(arr[i - 1][1], arr[i + 1][0]);
                    return availableArea;
                }
            }

            if (availableArea.length == 0) {
                console.log('出错了！');
            }
        },
        /**@ignore */
        initEvents: function($btn, $copy) {
            var that = this;
            var $currentBar = null;
            var $currentLabel = null;
            // var index = 0;

            var mouseenterEvent = function() {
                var $this = $(this);
                var index = 0;
                if ($this.hasClass('planTemplate-bar')) {
                    $btn.data('index', $this.data('index'));
                } else if ($this.hasClass('planTemplate-label')) {
                    $btn.data('index', $this.prev('.planTemplate-bar').data('index'));
                }

                index = $btn.data('index');

                $currentBar = $('.planTemplate-bar', that.$context).eq(index);
                $currentLabel = $('.planTemplate-label', that.$context).eq(index);

                $btn.css({
                    //top: $currentBar.css('top')
                    top :  index*(that.settings.barHeight + that.settings.scaleHeight + 2) + that.settings.scaleHeight + (that.settings.barHeight-28)/2
                }).show();

                $currentBar.addClass('planTemplate-bar-current');
                $currentLabel.addClass('planTemplate-label-current');
            };

            var mouseleaveEvent = function() {
                $btn.hide();
                $currentBar.removeClass('planTemplate-bar-current');
                $currentLabel.removeClass('planTemplate-label-current');
                if ($copy && $copy.length > 0) {
                    $copy.hide();
                }
            };

            that.$context.on('mouseenter', '.planTemplate-bar', mouseenterEvent);
            that.$context.on('mouseenter', '.planTemplate-label', mouseenterEvent);
            $btn.on('mouseenter', mouseenterEvent);

            that.$context.on('mouseleave', '.planTemplate-bar', mouseleaveEvent);
            that.$context.on('mouseleave', '.planTemplate-label', mouseleaveEvent);
            $btn.on('mouseleave', mouseleaveEvent);

            if ($copy && $copy.length > 0) {
                $copy.on('mouseenter', mouseenterEvent);
                $copy.on('mouseleave', mouseleaveEvent);
            }
        },

        /**@ignore */
        initDeleteBtn: function() {
            var that = this;
			var scaleWidth = this.scaleWidth;
            var $deleteBtn = $('<span class="planTemplate-delete" style="left:'+(scaleWidth.swidth + 80)+'px"></span>').appendTo($('.planTemplate-panel', this.$context));
            var $current = null;

            that.initEvents($('.planTemplate-delete', that.$context));

            this.$context.on('click', '.planTemplate-delete', function() {
                var index = $deleteBtn.data('index');

                if ($('.planTemplate-bar', that.$context).length > 1) {
                    $(this).hide();
                    if((index + 1) >= $('.planTemplate-bar', that.$context).length){
                        $('.planTemplate-scale-bottom', that.$context).eq(index-1).remove();
                    }else{
                        $('.planTemplate-scale-bottom', that.$context).eq(index).remove();
                    }
                    $('.planTemplate-label', that.$context).eq(index).remove();
                    $('.planTemplate-bar', that.$context).eq(index).remove();

                    that.setStyle();

                    that.position.splice(index, 1);
                    that.time.splice(index, 1);
                } else {
                    alert('最后一个假日不能删除！')
                }
            })

        },
        /**@ignore */
        copy: function() {
            var that = this;
            var html = [];
            var $copy = null;
            var $copyBtn = null;
            var $panel = $('.planTemplate-panel', that.$context);
            var text = this.settings.label;

            html.push('<div class="planTemplate-copy"  style="left:'+(this.scaleWidth.swidth + 80 - 249)+'px">',
                        '<div class="planTemplate-copy-hd">',
                          '<strong>复制到</strong>',
                          '<label><input type="checkbox" /> 全选</label>',
                        '</div>',
                        '<div class="planTemplate-copy-bd">');

            for (var i = 0; i < text.length; i++) {
                html.push('<label><input type="checkbox" data-index="'+i+'" /> ' + text[i] + '</label>')
            }

            html.push('</div>',
                        '<div class="planTemplate-copy-ft">',
                          '<button class="btn btn-primary planTemplate-copy-confirm" type="button">确定</button>',
                          '<button class="btn planTemplate-copy-cancel" type="button">取消</button>',
                        '</div>',
                        '<i></i>',
                      '</div>',
                      '<span class="planTemplate-copy-button" style="left:'+(this.scaleWidth.swidth + 80)+'px"></span></span>');
            
            $(html.join('')).appendTo($panel);

            $copy = $('.planTemplate-copy', that.$context);
            $copyBtn = $('.planTemplate-copy-button', that.$context);

            that.initEvents($copyBtn, $copy);

            this.$context.on('click', '.planTemplate-copy-button', function() {
                var $this = $(this);
                var index = $this.data('index');

                $('.planTemplate-copy-hd input', that.$context).removeAttr('checked');
                $('.planTemplate-copy-bd input', that.$context).removeAttr('checked');
                $('.planTemplate-copy-bd input', that.$context).removeAttr('disabled');
                $('.planTemplate-copy-bd input', that.$context).eq(index).attr({
                    checked: 'checked',
                    disabled: 'disabled'
                })
                $('.planTemplate-copy', that.$context).css({
                    top: parseInt($this.css('top')) - 65
                }).show();

            });

            this.$context.on('mouseenter', '.planTemplate-copy', function() {
                $(this).show();
            })

            this.$context.on('click', '.planTemplate-copy-hd input', function() {
                if (this.checked) {
                    $('.planTemplate-copy-bd input', that.$context).prop('checked', true);
                } else {
                    $('.planTemplate-copy-bd input', that.$context).prop('checked', false);
                    $('.planTemplate-copy-bd input:disabled', that.$context).prop('checked', true);
                }
            });

            this.$context.on('click', '.planTemplate-copy-bd input', function() {
                if (this.checked) {
                    if ($('.planTemplate-copy-bd input', that.$context).length == $('.planTemplate-copy-bd input:checked', that.$context).length) {
                        $('.planTemplate-copy-hd input', that.$context).prop('checked', true);
                    }
                } else {
                    $('.planTemplate-copy-hd input', that.$context).prop('checked', false);
                }
            });

            this.$context.on('click', '.planTemplate-copy-cancel', function() {
                $('.planTemplate-copy', that.$context).hide();
            });

            this.$context.on('click', '.planTemplate-copy-confirm', function() {
                var barIndex = $('.planTemplate-copy-button', that.$context).data('index');
                var time = $.extend([],that.time[barIndex]);
                var position = $.extend([],that.position[barIndex]);

                $('.planTemplate-copy-bd input', that.$context).each(function() {
                    var index = 0;
                    if (this.checked) {
                        index = $(this).data('index');
                        that.position[index] = $.extend(true, [], position);
                        that.time[index] = $.extend(true, [], time);
                    }
                });

                $('.planTemplate-copy', that.$context).hide();
                that.initPanel();
                that.render(that.position);

            })

        }

    };
	$.extend(PlanTemplate.prototype, $.planTemplateChangeScale)
	
	/**
	 * 
	 * @class
	 * @example 
	 * var week = $("#planTemplate-week").planTemplateView({
	 * type: "week"
	 * });
	 */
    $.fn.planTemplate = function(options) {

        this.each(function() {
            if (!$.data(this, "plugin_planTemplate")) {
                $.data(this, "plugin_planTemplate", new PlanTemplate($(this), options));
            }
        })
        
        return $.data(this[0], "plugin_planTemplate");
        
    };
})(jQuery);

