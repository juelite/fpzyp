_model.define('utils',function(utils){
   return {
       toJqueryObject : function(id){
           return typeof id  == "string" ? $(id) : id
       },
       gridtrigger : function(id){
           var $el = this.toJqueryObject(id);
           if ($el.length) {
               $('.withTrigger[autoTrigger!=false]').delegate('.trigger-s a', 'click', function() {
                   var $wrapper = $(this).parents('.withTrigger');
                   $wrapper.hasClass('grid-m') ? $wrapper.removeClass('grid-m') : $wrapper.addClass('grid-m');
                   return false;
               });
           }
       },
       getCurrentFrames : function(){
           var frames = [ window.name ];
           var current = window;
           var parentName = null;
           while ((parentName = current.parent.name) && (parentName !== '0') && parentName !== frames[frames.length-1] ) {
               current = current.parent;
               frames.push(parentName);
           }
           return frames;
       },
       absURL : function(url, isFilterParam) {
           url = url == null ? location.href : url;
           if (isFilterParam) {
               url = url.split('?')[0];
           }
           if (url.indexOf('/') == 0) {
               return url;
           }
           var result = null;
           if ( /https?:/g.test(url)) {
               result = url;
           } else {
               var end = baseHref.lastIndexOf('/');
               var prefHref = end < 0 ? baseHref : baseHref.substring(0, end);
               result = prefHref + '/' + url;
           }
           result = result.replace(/https?:\/\/[^\/]*/, '');

           return result;
       },
       htmlToText : function(html) {
           if (html == null || typeof html != 'string') {
               return html;
           }
           for ( var i = 0; i < rel.length; i++) {
               html = html.replace(rel[i], rl[i]);
           }
           return html;
       },
       cutStr : function(str, cutLen, ellipsis) {// 截取中英字符串 双字节字符长度为2   str, n, ex
           // ASCLL字符长度为1
           if (str == null) {
               return null;
           }
           var s = str.substr( 0, cutLen ).replace( /([^\x00-\xff])/g, ' $1' ).substr( 0, cutLen ).replace( / ([^\x00-\xff])/g, '$1' );
           if( s != str ) s += ( typeof(ellipsis) == 'string' ? ellipsis : '...' );
           return s;
       },
       commonCookie : function(a, b, c) {
           var $iframe = $('iframe[id=' + cookieIframeId + '][name=' + cookieIframeId + ']');
           if ($iframe.length == 0) {
               return null;
           }
           return frames[cookieIframeId].cookie(a, b, c);
       },
       getLocationPath : function(){
           if (pt && $.trim(pt.cookieKey)) {
               return pt.cookieKey;
           }
           var href = document.location.pathname.split('?')[0];
           return decodeURI(href.substring(href.lastIndexOf('/') + 1));
       },
       getHistoryMap : function(){
           top.pt = top.pt || {};
           top.pt.historyMap = top.pt.historyMap || {};
           return top.pt.historyMap;
       },
       getHistoryData : function(action){
           if (action == null) {
               action = this.absURL(location.href);
           }
           return this.getHistoryMap()[action];
       },
       submitHistory : function(formEl){
           var action = this.absURL(formEl.attr('action') || location.href);
           var historyMap = this.getHistoryMap();
           var datas = historyMap[action];
           if (datas == null) {
               formEl.append('<input name="_history" type="hidden" value="true" />');
               historyMap[action] = formEl.formToArray();
               formEl[0].submit();
               return;
           }
           var fieldsArray = [];
           for ( var i = 0; i < datas.length; i++) {
               var data = datas[i];
               if (data.name != '_history' && !formEl.find('[name="' + data.name + '"]').length) {
                   fieldsArray.push('<input type="hidden" name="' + data.name + '" value="' + data.value + '" >')
               }
           }
           formEl.append(fieldsArray.join(''));
           formEl.append('<input name="_history" type="hidden" value="true" />');
           historyMap[action] = formEl.formToArray();
           formEl[0].submit();
       },
       history : function(href, params, target){//该方法需要依赖jquery.form.js，需要改动
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
           this.submitHistory(formEl);
       }
   }
});


_model.define('utils.Array',function(array){
    return {
        indexOf :function(Object) {
            for ( var i = 0; i < this.length; i++) {
                if (this[i] == Object) {
                    return i;
                }
            }
            return -1;
        }
    }
});

_model.define('utils.Date',function(date){
    return {
        format : function(format) {
            var o = {
                "M+" : this.getMonth() + 1, // month
                "d+" : this.getDate(), // day
                "h+" : this.getHours(), // hour
                "m+" : this.getMinutes(), // minute
                "s+" : this.getSeconds(), // second
                "q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
                "S" : this.getMilliseconds() // millisecond
            };

            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }

            for ( var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        }
    }
});
