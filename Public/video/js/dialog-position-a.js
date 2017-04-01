/**
     * 弹框的位置
     */
(function($) {
    var tk = tk||{};
    tk.getTopZ = function() {
        return parseInt(new Date().getTime() / 1000);
    };
    $.popPosi =function(){
        var _scrollTop = window.pageYOffset  //用于FF
            || document.documentElement.scrollTop  //用于指定了doctype，避免出现为0的情况，
            || document.body.scrollTop  //用于没有指定了doctype，
            || 0;
        return {

            _scrollTop: _scrollTop,
            _scrollLeft   : $('body').scrollLeft(),/*
            _windowHeight : $('body').height(), // 获取当前窗口高度*!/*/
            _windowHeight :window.innerHeight || document.documentElement.clientHeight  || document.body.clientHeight ,// 获取当前窗口高度
            _windowWidth  :window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
              zIndex : tk.getTopZ()
        }
    };
    $.popCenter = function(layer) {
        var _popupHeight = layer.outerHeight(); // 获取弹出层高度
        var _popupWidth = layer.outerWidth();
        // 获取弹出层宽度
        var popPosi= $.popPosi();
        var _posiTop = (popPosi._windowHeight - _popupHeight) / 2 + popPosi._scrollTop;
        var _posiLeft = (popPosi._windowWidth - _popupWidth) / 2 + popPosi._scrollLeft;
        layer.css({
            display : 'block',
            zIndex : popPosi.zIndex + 1,
            left : _posiLeft + "px",
            top : _posiTop + "px",
            opacity:'normal'
        });
//       layer.animate({
//            left : _posiLeft + "px",
//            top : _posiTop + "px",
//           opacity:'normal'
//       },'normal');
    };
    $.popLeftBottom= function(layer) {
        var popPosi= $.popPosi();
        layer.css({
            display : 'block',
            zIndex : popPosi.zIndex + 1
        });
        layer.animate({
            left : popPosi._scrollLeft + 20 + "px",
            top : popPosi._scrollTop+ popPosi._windowHeight -layer.outerHeight()-30+ "px",
            opacity:'normal'
        },'normal');
    };
    $.popLeftTop= function(layer) {
        var popPosi= $.popPosi();
        layer.css({
            display : 'block',
            zIndex : popPosi.zIndex + 1
        });
        layer.animate({
            left : popPosi._scrollLeft + 20 + "px",
            top : popPosi._scrollTop + 30 + "px",
            opacity:'normal'
        },'normal');
    };
    $.popRightBottom= function(layer) {
        var popPosi= $.popPosi();
        layer.css({
            display : 'block',
            zIndex : popPosi.zIndex + 1
        });
        layer.animate({
            right :  20 + "px",
            top :popPosi._scrollTop+ popPosi._windowHeight -layer.outerHeight()-30+ "px",
            opacity:'normal'
        },'normal');
    };
    $.popRightTop= function(layer) {
        var popPosi= $.popPosi();
        layer.css({
            display : 'block',
            zIndex : popPosi.zIndex + 1
        });
        layer.animate({
            right : 20 + "px",
            top : popPosi._scrollTop + 30 + "px",
            opacity:'slow'
        },'normal');
    };
    $.popNear= function(options) {
        options = $.extend({
            layer : ' ', //对话框默认参数是dialog
            id : options.objId , //参照物的id，一般参照物是其点击的对象;
            width : " ",// 点击事件的宽度
            height : " ",
            direction:'',
            adaptable :false//是否屏幕自适应
        }, options);
        var _windowHeight=window.innerHeight || document.documentElement.clientHeight  || document.body.clientHeight ;// 获取当前窗口高度
        var _windowWidth=window.innerWidth || document.documentElement.
                clientWidth || document.body.clientWidth;
        var _topId = $('#'+ options.id ).offset().top;
        var _leftId = $('#' +options.id ).offset().left; 
        var _scrollTop = $('#'+ options.id).scrollTop(); // 获取当前窗口距离页面顶部高度
        var _scrollLeft = $('#'+ options.id).scrollLeft();   
        var _width = $('#' + options.id ).outerWidth();
        var _height = $('#' + options.id ).outerHeight();
        var _scrollTop1 = window.pageYOffset  //用于FF
                || document.documentElement.scrollTop  //用于指定了doctype，避免出现为0的情况，
                || document.body.scrollTop  //用于没有指定了doctype，
                || 0;
        var zIndex = tk.getTopZ();
        var _windowBottom = _windowHeight- (_topId - _scrollTop1);//距离当前窗口下方的高度
        var  _left = _leftId + _width/2 - options.width/2;
        var _top = _topId + _height + 10 ;
        $(layer).removeClass('arrow-right')
            .removeClass('arrow-left')
            .removeClass('arrow-bottom')
            .removeClass('arrow-top');
        $('.outTriangle,.inTriangle').removeClass('arrow-right')
            .removeClass('arrow-left')
            .removeClass('arrow-bottom')
            .removeClass('arrow-top');
        if(options.adaptable == true){//弹框是否根据屏幕的控件自适应
                if((_windowWidth - _leftId) < options.width){//宽度超出右边的宽度， 自适应左边放置。
                    options.direction = 'left';
                }
                if(_leftId < options.width){//宽度超出左边的宽度， 自适应右边放置。
                    options.direction = 'right';
                }
                if(_windowBottom < options.height){//高度超出屏幕， 自适应下边放置。
                    options.direction = 'top';
                }
                if(_topId - _scrollTop1 < options.height){//高度超出屏幕， 自适应下边放置。
                    options.direction = 'bottom';
                }
                if(_leftId < options.width && _topId - _scrollTop1 < options.height){
                    options.direction = 'right';
                }
        };
        var layer=options.layer;
        $(layer).addClass('arrow-'+options.direction+'');
        $('.outTriangle,.inTriangle').addClass('arrow-'+options.direction+'');
        switch (options.direction) {
            case 'top' :
                 _top = _topId - options.height -12 ;//12是留出箭头的空间
                _left = _leftId + _width/2 - options.width/2;
                var _leftArrow= options.width/2-10;//10是箭头的宽度
                var _topArrow = options.height;
                break;
            case 'bottom' :
                _left = _leftId + _width/2 - options.width/2;
                _top = _topId + _height + 12 ;
                var _leftArrow= options.width/2-10;//10是箭头的宽度
                var _topArrow = -10-10;
            break;
            case 'left' :
                _left = _leftId - options.width - 12;
                _top = _topId +_height/2 - options.height/2;
                var _leftArrow= options.width;
                var _topArrow = options.height/2-10;//10是箭头的宽度
            break;
            case 'right' :
                _left = _leftId + _width + 12;
                _top = _topId +_height/2 - options.height/2;
                var _leftArrow= -20;
                var _topArrow = options.height/2-10;//10是箭头的宽度
            break;
            } ;
        options.layer.css({
            display : 'block',
            zIndex : zIndex + 1
        });
        if(_top<0){_topArrow=_topArrow+_top;_top=0;}
        if(_left<0){_leftArrow=_leftArrow+_left;_left=0;}
        options.layer.animate({
            left : _left + "px",
            top  :  _top + "px",
        },'normal');
        $('.outTriangle.arrow-'+options.direction+'').css({
            left : _leftArrow + "px",
            top  :  _topArrow  + "px"
        });
        };
     

 

})(jQuery);  