/**
 * Created with JetBrains WebStorm.
 * User: yangyu3
 * Date: 14-12-1
 * Time: 上午9:47
 * To change this template use File | Settings | File Templates.
 */

// 菜单模块
_model.define('menu', function (model) {
    var options = {
            tmplurl: '',
            cssactive: 'active',
            csshover: 'hover',
            // 模板的属性映射 ,
            ajaxResponseReader: {data: 'data'},
            tmplcontent: '[data-menu],[data-menu-sub],[data-menu-common]',
            tmpl: '[tmpl-menu],[tmpl-menu-sub],[tmpl-menu-common]',
            'tmpl-menu' :'<script type="text/x-jquery-tmpl" tmpl-menu>{{each(i, d) data}}<li><a href="javascript:void(0);" onclick="openMenu(this)" url="{{= d.href}}" menuType="{{= d.type}}" openType="{{= d.openType}}" menuId="{{= d.menuId}}" customAppUrl="{{= d.customAppUrl}}" >{{= d.name}}</a></li>{{/each}}<li id="navThirdMoreLink"><a href="#" class="more"><span>更多</span></a><ul style="display:none">  </ul></li></script>',
            'tmpl-menu-sub' : '<script type="text/x-jquery-tmpl" tmpl-menu-sub><div class="block block-home">{{each(i, d) data}}{{if d.data != null && d.data.length !=0}}<div class="nav_content"><h2><a href="javascript:void(0);"><span>{{= d.name}}</span></a></h2><ul>{{each(i,dd) data}}<li><a href="javascript:void(0);" onclick="openMenu(this)" url="{{= dd.href}}" menuType="{{= dd.type}}" openType="{{= d.openType}}" menuId="{{= dd.menuId}}" code="{{= dd.code}}" serviceType="{{= dd.serviceType}}" customHomeMenuUrl="{{= dd.customHomeMenuUrl}}" class="icon_log {{= dd.className}}"><span>{{= dd.name}}</span></a></li>{{/each}}</ul></div>{{/if}}{{/each}}</div></'+'script>',
            'tmpl-menu-common' : '<script type="text/x-jquery-tmpl" tmpl-menu-common><li class="mainNav_map"><a href="#" class="map_a"><i></i></a><div class="ddmenu"><iframe style="width:100%; height:100%; position: absolute; z-index: -1; left: 0px; top: 0px;opacity:0;filter: Alpha(opacity = 0);"></iframe><ul>{{each(i, d) data}}<li><a href="javascript:void(0);"  menucode="{{= d.menuId}}" menuid="{{= d.menuId}}" onclick="openMenuNav(this)" menuType="{{= d.type}}"  customAppUrl="{{= d.customAppUrl}}" openType="{{= d.openType}}" url="{{= d.href}}"><i></i><span>{{= d.name}}</span></a>{{if d.data != null && d.data.length != 0 }}<ul>{{each(i, d) data}}<li><a href="javascript:void(0);"  menucode="{{= d.menuId}}" menuid="{{= d.menuId}}" onclick="openMenuNav(this)" menuType="{{= d.type}}" customHomeMenuUrl="{{= d.customHomeMenuUrl}}" openType="{{= d.openType}}" url="{{= d.href}}"><i></i><span>{{= d.name}}</span></a></li>{{/each}}</ul>{{/if}} </li>{{/each}} </ul></div></li>{{each(i, d) data}}{{if data != null && data.length != 0 && active == 1}}{{each(i, d) data}}<li><a href="javascript:void(0);"  menucode="{{= d.menuId}}" menuid="{{= d.menuId}}" onclick="openMenu(this)" menuType="{{= d.type}}"  openType="{{= d.openType}}" url="{{= d.href}}"><i></i><span>{{= d.name}}</span></a>{{if data != null && data.length != 0}}<div class="ddmenu"><iframe style="width:100%; height:100%; position: absolute; z-index: -1; left: 0px; top: 0px;opacity:0;filter: Alpha(opacity = 0);"></iframe><ul>{{each(i, d) data}}<li><a href="javascript:void(0);"  menucode="{{= d.menuId}}" menuid="{{= d.menuId}}" onclick="openMenu(this)" menuType="{{= d.type}}"  openType="{{= d.openType}}" url="{{= d.href}}"><i></i><span>{{= d.name}}</span></a><ul>{{each(i, d) data}}<li><a href="javascript:void(0);"  menucode="{{= d.menuId}}" menuid="{{= d.menuId}}" onclick="openMenu(this)" menuType="{{= d.type}}"  openType="{{= d.openType}}" url="{{= d.href}}"><i></i><span>{{= d.name}}</span></a></li>{{/each}}</ul></li>{{/each}}</ul></div>{{/if}}</li>{{/each}}{{/if}}{{/each}}</'+'script>',
            parentTag : 'li',
            params: ['menuId', 'href', 'target', 'active','parentId', 'name'] ,
            data :null
        },
        menuId, subMenuId;

    return {
        options: options,
        inilize: false,
        activedata: [],  //当前激活菜单
        cachedata: {},  //菜单解析缓存
        domInit: function () {
            this.elem = $(options.tmplcontent);
            this.template = $(options.tmpl);
            this.getdata();
        },
        getdata: function () {
            var that = this,
                content=options.tmplcontent.split(','),
                length = that.elem.length,
                tmpl = options.tmpl.split(','),
                contentItem,
                tmplItem;
            if(length < 0)
                return;
            if(options.data ){
                that.parseData(options.data);
                that.resetActive(that.activeId);

                for (var i=0, len=content.length; i < len ; i++ ){

                    if ((contentItem=$(content[i])).length){

                        tmplItem = $(tmpl[i]).length ? $(tmpl[i]) : $(that.options[tmpl[i].replace(/[\[\]]/g,'')]);
                        contentItem.html(tmplItem.tmpl(options.data));
                    }
                }


                that.changeActiveClass();
                // 批量执行绑定事件
                that.batch(/^onEvent/);
                that.inilize = true;
                that.trigger('inilize');
            }else if(options.tmplurl) {
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: options.tmplurl,
                    success: function (obj) {
                        that.menudata = obj; //原始菜单
                        that.parseData(obj);
                        that.resetActive(that.activeId);

                        for (var i=0, len=content.length; i < len ; i++ ){

                            if ((contentItem=$(content[i])).length){

                                tmplItem = $(tmpl[i]).length ? $(tmpl[i]) : $(that.options[tmpl[i].replace(/[\[\]]/g,'')]);
                                contentItem.html(tmplItem.tmpl(obj));
                            }
                        }
                        that.changeActiveClass();
                        // 批量执行绑定事件
                        that.batch(/^onEvent/);
                        that.inilize = true;
                        that.trigger('inilize');
                    }
                })
            }

        },
        getactive: function () {
            return this.activedata;
        },
        isInit: function () {
            return this.inilize
        },
        getparam: function (params, obj) {
            var ret = {},
                i = 0, len = params.length, param;
            for (; i < len; i++) {
                param = params[i];
                ret[param] = obj[param];
            }
            return ret;
        },
        parseData: function (pobj) {
            var cdata = this.cachedata,
                kData = this.options.ajaxResponseReader['data'],
                datas = pobj[kData],
                i=0, len=datas.length,
                chldata,obj;

            for (;i < len;i++) {
                chldata = datas[i];
                obj = this.getparam(options.params, chldata);

                if (typeof obj.parentId!=null && pobj.menuId != null ) {
                    obj.parentId = pobj.menuId;
                }

                if (obj.active == 1) {
                    this.activeId = obj.menuId;
                }
                cdata[obj.menuId] = obj;

                if (chldata.data && chldata.data.length) {
                    this.parseData(chldata);
                }
            }
        },
        resetActive: function (menuId) {
            var cdata = this.cachedata,
                data = cdata[menuId], pId;
            if(data){
                this.activedata = [data];
                while (pId=data.parentId) {
                    data = cdata[pId];
                    this.activedata.unshift(data);
                }
            }
            this.changeActiveClass();
            return this.getactive();

        },
        changeActiveClass: function () {
            var that = this,
                css = this.options.cssactive,
                adata = this.activedata,
                pTag = this.options.parentTag;
            if(css)
                this.elem.find('.' + css).removeClass(css);
            $.each(adata, function (n, i) {
                $('[menuId='+i.menuId+']', that.elem).closest(pTag).addClass(css);
            });
        },
        onEventMenuClick: function () {
            var that = this;

            this.bind('click', function (event, menuId) {
                var target = that.elem.find('[menuId='+menuId+']:last');
                target.trigger('click', event);
            });
            this.elem
                .on('click', 'a', function (event) {
                    var menuId = $(this).attr('menuId'),
                        data;

                    that.resetActive(menuId);
                    data = that.cachedata[menuId];
                    return that.clickval = that.menuClick.call(this, event, that, data, menuId);
                })
        }
    }

})
// 菜单模块
_model.define('menu', function (model) {
    return {
        // 页面操作逻辑
        // 容许覆盖
        menuClick: function (event, that, data, menuId) {
            var target = data.target;
            if(eventsManage){
                eventsManage.trigger('positions','',menuId,target ? [target] : [window]);
            }
            if (event.originalEvent && event.originalEvent.returnValue === false) {
                return false;
            }
            if (data.target && data.target !== '_blank') {
                $('#'+target).attr("src", data.href);
                return false;
            }
            return true;
        },
        menuEnter: function (event, that) {
            var target = $(this),
                csshover = that.options.csshover,
                child;

            target.addClass(csshover);
            if ((child=target.children('div')).length) {
                child.show()
            }
        },
        menuLeave: function (event, that) {
            var target = $(this),
                csshover = that.options.csshover,
                child;

            target.removeClass(csshover);
            if ((child=target.children('div')).length) {
                child.hide();
            }
        },
        onEventMenuHover: function () {
            var that = this;

            this.elem
                .on('mouseenter', 'li', function (event) {
                    return that.menuEnter.call(this, event, that);
                })
                .on('mouseleave', 'li', function (event) {
                    return that.menuLeave.call(this, event, that);
                })
        }
    }
})

