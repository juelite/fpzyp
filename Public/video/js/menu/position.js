/**
 * Created with JetBrains WebStorm.
 * User: yangyu3
 * Date: 14-12-11
 * Time: 下午2:19
 * To change this template use File | Settings | File Templates.
 */

// 面包屑模块
_model.define('position', ['menu'], function (model, menu) {
    var options = {
            positionDiv: '#breadcrumbs',
            templatecontent: '<ul>',
            isBindMenuClick: true,
            template: '<li><a href="{href}"><span>{name}</span></a></li>',
            nonHrefTempl : '<li><span>{name}</span></li>'
        },
        reg = /\{([^}]*)\}/g;
    return {
        options: options,
        init: function () {
            eventsManage.bind('positions', this.viewpos, this);
        },
        viewpos: function (event, phtml, menuCode,frames) {
            var that = this, $html = $($.trim(phtml));
            if (!menu.isInit()) {
                menu.bind('inilize.positions', function () {
                    that.viewpos(event, phtml);
                menu.unbind('inilize.positions');
            });
                return false;
            }

            var actives = menu.resetActive(menuCode),
                html = $(options.templatecontent),
                list,
                active, i, len;
            for (i=0, len=actives.length; i < len; i ++) {
                active = actives[i] ;
                if((i == len -1) && !$html.length){
                    list =  $(options.nonHrefTempl.replace(reg, function (a, b) {
                        if (active[b]) {
                            return active[b];
                        }
                    }));
                }else{
                    list = $(options.template.replace(reg, function (a, b) {
                        if (active[b]) {
                            return active[b];
                        }
                    }));
                    if (options.isBindMenuClick) {
                        list.bind('click', function (menuId) {
                            return function () {
                                menu.trigger('click', menuId);
                                //fixme 这里menu.clickval的意义何在，menuclick不会进入这个逻辑
                                return menu.clickval ? menu.clickval : false;
                            }
                        }(active['menuId']))
                    }
                }
                html.append(list);
            }

            $html.find('a').each(function(i, a) {
                var href =  a.getAttribute('href'),frame = window;;
                if(/javascript:/g.test(href)){
                    a.setAttribute('href', href.replace(/.*?\(\'(.*)\'\)\;/, '$1'));
                }
                $(a).bind('click',function(){
                    return function () {
                        for ( var i = frames.length; i > 0; i--) {
                            if(!frame.frames[frames[i - 1]]) //防止页面缓存不存在的iframe
                                continue;
                            frame = frame.frames[frames[i - 1]];
                        }

                        var target = this.getAttribute('target');
                        target && (frame.location.target = target);
                        frame.location.href = $(this).attr('href');
                        frame.location.target = null;
                        return false;
                    }
                }())
            });
            $(options.positionDiv).html(html.append($html))
        }
    }
});





























