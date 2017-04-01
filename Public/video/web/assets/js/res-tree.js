$(document).ready(function() {
    if (level > 0) {
        $('#monResource').removeClass("simple");
    }
     $(".tab-content").click(function(e){
			var targetEl = $(e.target);
			var a_self = targetEl.closest('a.act-favorite');
			if(!a_self.length){
				return;
			}
        	var cameraId = a_self.attr("camera-id");
        	if(a_self.hasClass("active")){
        		removeCameraFromFav(cameraId);
        	}else{
        		var cameraName = a_self.attr("camera-label");
        		var intelCode = "";
        		var intelChannelNo = "";
        		if(a_self.attr("camera-intelCode") && a_self.attr("camera-intelCode")){
        			intelCode = a_self.attr("camera-intelCode");
        			intelChannelNo = a_self.attr("camera-intelCode");
        		}
        		addCameraToFav(cameraId,cameraName,intelCode,intelChannelNo);
        	}
        });
     var tempFoc = true;//控制选中之后不显示下拉筛选列表。
      $("#orgName").autocomplete({
        minLength: 0,
        showNoMatch : true,
        maxSourceLength : 100,
        source: {
            url:'findOrgByName.action?resTreeCode='+privilegeCodeForFavoriteTree
        },
        sourceDataType: 'tree',
        create: function(event, ui) {
           $(this).bind("click focus",function(){
                  var active=$(this).data( "autocomplete").menu.active; //没有这一行，鼠标选择选项时，会触发输入的click事件，导致提示框不能关闭 
                  if(!active && tempFoc){
                       $(this).autocomplete("search" , $("#orgName").val());
                   }
            });
    	  },
          select: function(event, ui) {
        	   tempFoc = false;
		       $('#orgName').val(ui.item.value);
		       var level = ui.item.parentLabel.length + 1;
		       $('.tab-content .breadLine').css('display','block');
//		       if(item.extra == undefined)return false;//nihf 去除，面包屑显示异常的问题处理
		       locateOrg(ui.item.id,level,ui.item.extra.auth);
		       $('.breadLine').trigger('reLayout');
               return false;
          }
    }).data("ui-autocomplete" ).filter = function(cacheData, term) {
    	  var matcher = new RegExp($.ui.autocomplete.escapeRegex(term.toLowerCase()), "i");
			return $.grep(cacheData, function(value) {
				if(value.extra && value.extra.pinyinCode)
					return matcher.test(value.label) || matcher.test((value.extra.pinyinCode).toString());
				return matcher.test(value.label);
			});
    };
	$('#orgName').iTextClear();
    var selectedView = -1;
	var realId = 0;
	var bigLevel = level;
    // Folder View
    $('[data-trigger="folder.view"]').click(function() {
        var viewId = $(this).attr('data-view-id');
        if (viewId == selectedView) {
            return;
        }
        toggleViews($(this).attr('data-view'), viewId);
        selectedView = viewId;
        var type = $(this).attr('data-type');
        changeMonResource(viewId, type);
        if(viewId != '-1'){
        	if($('#monResource').hasClass('hasFilter')){
        		$('#monResource').removeClass('hasFilter')
    			$('#monResource .breadLine').trigger('reLayout');
        	}
        	$('#monResource').addClass('hasView');
        }else{
        	$('#monResource').removeClass('hasView');
        }
    });
    function toggleViews(view, id) {
        var text = $('[data-view-id="' + id + '"]').text();
        $('[data-trigger="folder.view"]').each(function(idx, item) {
            $('#monResource').removeClass($(item).attr('data-view')).find('.ico').remove();
        });
        $('#monResource').addClass(view);
        $('[data-view-id="' + id + '"]').prepend('<span class="ico i-checked"></span>').parents('.btn-group').find('.buttonS')
                .text(text).append('<span class="caret"></span>');
    }

    function pushAll(src, dest) {
        if (src && src.length) {
            for (i = 0; i < src.length; i++) {
                dest.push(src[i]);
            }
        }
    }

    function reLoadTree(id, l, auth, searchId) {
        var treea = $("#zTreea").tree();
        if (treea)
            treea.destroy();

        if (auth == 0 && l != level) {
            return;
        }
        $("#zTreea").show();
        $("#zTreea").parent().find('.msg-tips.nodata').remove();
        $("#zTreea")
                .html('<div class="grid4" style="padding-top:50px;"><div class="loading"><i></i><span>正在加载中，请稍后...</span></div></div>');
       	
        if (!settingRes) {
            settingRes = getSettingRes(l, level);
        }
        var zTreeNodes = new Array();
        if (l >= level) {
           	pushAll(findChildNodes(resourceGroup, searchId), zTreeNodes);
        }
        settingRes.ajax = {
            url : 'getOrgTree.action',
            type : 'POST',
            data : {
                id : id,
                append : 1
            },
            dataType : "json",
            handleData : function(result) {
				realId = id;
                if (result.cameras && result.cameras.children) {
                    pushAll(result.cameras.children, zTreeNodes);
                }
                if (result.children) {
                    pushAll(result.children, zTreeNodes);
                }
                if (!zTreeNodes.length) {
                    zTreeNodes = [];
                }
                return zTreeNodes;
            }
        };
        
      $("#zTreea").tree(settingRes)
    }
    
    function findChildNodes(parent, id) {
        if (parent.id == id) {
            return parent.children;
        }
        if (parent && parent.children && parent.children.length > 0) {
            for (var i = 0; i < parent.children.length; i++) {
                var child = parent.children[i];
                if (child.id == id) {
                    return child.children;
                }
                var ret = findChildNodes(child, id);
                if (ret) {
                    return ret;
                }
            }
        }
        return null;
    }
    
    function findAllParents(root,id){
    	var parents = new Array();
    	if(root.id == id)
    		return parents;
    	var node = findChildOrg(root,id);
    	var parent = findChildOrg(root,node.parentId)
    	do{
    		parents.push(parent.id);
    		parent = findChildOrg(root,parent.parentId)
    	}while(parent.parentId != 0)
    	return parents;
    }
    
    function findAllParentsInTree(root,id,l){
    	var temLevel = l;
    	var parents = new Array();
    	if(root.id == id)
    		return parents;
    	var node = findChildOrg(root,id);
    	var parent = findChildOrg(root,node.parentId)
    	temLevel--;
    	while(temLevel > level){
    		temLevel --;
    		parents.push(parent.id);
    		parent = findChildOrg(root,parent.parentId)
    	}
    	return parents;
    }

    function beforeAsyncNode(treeId, treeNode) {
        if (!treeNode) {
            return false;
        }
        return true;
    }

    // 双击监控点或者组织节点触发的事件
    function dblClickCamera(event, treeId, treeNode) {
        if (treeNode && treeNode.extra && treeNode.extra.type == 'res' && treeNode.extra.realId) {
            var id = treeNode.extra.realId;
            var intelCode = "";
            var intelChannelNo = "";
            if(treeNode.extra.isIntel){
            	intelCode = treeNode.extra.intelCode;
            	intelChannelNo = treeNode.extra.intelChannelNo;
            }
            playCamera(id, treeNode.label, intelCode, intelChannelNo,treeNode.extra.indexCode,treeNode.extra.ezvizCameraCode);
        }
    }

    $("#topLevelResource").delegate("a", "click", function() {
        var auth = $(this).attr('data-auth');
        var id = $(this).attr('data-id');
        var l = $(this).attr('data-level');
        var html = '<ul class="breadcrumbs clearfix">';
        if(l<level){
        	bigLevel = level;
        }else
        	bigLevel = l;
        html += changeBreadLine(null, resourceGroup, 1, id);
        html += "</ul>"
        $('#topLevelResource').html(html);
        $('.breadcrumbs').xBreadcrumbs();
        $('.breadLine').trigger('reLayout')
        reLoadTree(id, l, auth,id);
        return false;
    });

    $("#topCategory").delegate("a", "click", function() {
        var l = $(this).attr('data-level');
        var id = $(this).attr('data-id');
        var auth = $(this).attr('data-auth');
        if(l<level){
        	bigLevel = level;
        }else
        	bigLevel = l;
		var html = '<ul class="breadcrumbs clearfix">';
        html += changeBreadLine(null, resourceGroup, 1, id);
        html += "</ul>"
        $('#topLevelResource').html(html);
        $('.breadcrumbs').xBreadcrumbs();
        if (l != level) {

        } else {
            $(this).parent().parent().find("li.active").removeClass("active");
            $(this).parent().addClass("active");
        }
        reLoadTree(id, l, auth,id);
       
        return false;
    });
    
    function locateOrg(id,l,auth){
    	 
    	var html = '<ul class="breadcrumbs clearfix">';
    	var tempLevel = l;
    	var nodeId = id;
    	var node = findChildOrg(resourceGroup,id);
    	var isLocate = false;
    	while(tempLevel > level && level != 0){
    		node = findChildOrg(resourceGroup,node.parentId);
    		tempLevel --;
    		isLocate = true;
    	}
    	nodeId = node.id;
    	bigLevel = l;
        html += changeBreadLine(null, resourceGroup, 1, id);
        html += "</ul>"
        $('#topLevelResource').html(html);
        $('.breadcrumbs').xBreadcrumbs();
        if (l != level) {
			
        } else {
            $(this).parent().parent().find("li.active").removeClass("active");
            $(this).parent().addClass("active");
        }
        reLoadTree(nodeId, l, auth,id);
    }

	function getNodeLabelWithOnlineInfo(node){
		var id = node.id;
		if(onlineInfo != 1 || !onlineMap || !onlineMap[id]){
			return node.label;
		}
		var html = node.label.split("(");
		return html[0] + '(<span  style="color:red;">' + onlineMap[id].onlineCount + '</span>/' +onlineMap[id].allCount + ")";
	}

    // 更新秒包屑上的显示
    function changeBreadLine(parent, node, l, id) {
        if (id <= 0) {
            return '';
        }
        if (node && node.emtpy) {
            return '';
        }
        var html = "";
        
        if (node.id == id) {
            if (bigLevel == l) {// 点击是最后一层
                $('#topCategory').html("");
                $('.breadLine').addClass("collapse");
                return '<li class="end-li" data-id="' + id + '">' + getNodeLabelWithOnlineInfo(node) + '</li>';
            } else {
                $('.breadLine').removeClass("collapse");
            }
            html += '<li class="end-li" data-id="' + id + '">' + getNodeLabelWithOnlineInfo(node) + '</li>';
            appendCatelog(node, ++l, id);
            return html;
        } else {
            if (node.children && node.children.length > 0) {
                for (var i = 0; i < node.children.length; i++) {
                    var result = changeBreadLine(node, node.children[i], ++l, id);
                    --l;
                    if (result) {
                        if ('true' == result) {
                            html += '<li class="end-li" data-id="' + id + '">' + getNodeLabelWithOnlineInfo(node)
                        } else {
                            html += '<li><a class="res_breadline" data-auth="' + node.extra.auth + '" data-level="' + l
                                    + '" data-id="' + node.id + '" href="#">' + getNodeLabelWithOnlineInfo(node) + '</a>';
                        }
                        html += '</li>';
                        if ('true' != result) {
                            html += result;
                        }
                    }
                }
            }
        }
        return html;
    }

    function appendCatelog(parent, l, id) {
        var html = '';
        if (parent && parent.children && parent.children.length > 0) {
            for (var i = 0; i < parent.children.length; i++) {
                var child = parent.children[i];
                if (id == child.id) {
                    html += '<li class="active">';
                } else {
                    html += '<li>';
                }
                html += '<a class="res_catelog" data-auth="' + child.extra.auth + '" data-level="' + l + '" data-id="'
                        + child.id + '" href="#">' + getNodeLabelWithOnlineInfo(child) + '</a></li>';
            }
        }
        $('#topCategory').html(html);
    }

    var settingRes;

    // 当树展开的时候，去后台异步加载数据
    function zTreeBeforeExpand(treeId, treeNode) {
        if (treeNode.extra && treeNode.extra.auth && !treeNode.extra.expend) {
            var treea = $("#zTreea").tree();
            treea.reAsyncChildNodes(treeNode, "!refresh");
            treeNode.extra.expend = 1;
        }
        return true;
    };

    // 异步加载以后，如果没有子节点，这删除前面的“+”图标，节点自动变成叶子节点
    function zTreeOnAsyncSuccess(event, treeId, treeNode, msg) {
        if (treeNode == null) {
            return;
        }
        openOrgArray.push(treeNode.id);
        if (treeNode.children && treeNode.children.length > 0) {
			updateOnlineStatusAfterTreeLoad(treeNode.children,treeNode.id);
            return;
        }else{
			updateOnlineStatusAfterTreeLoad(null,treeNode.id);
		}
		$('.breadLine').trigger('reLayout');
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        treeObj.removeChildNodes(treeNode);
        var treea = $("#zTreea").tree();
    }
    
    function viewtreeOnLoadSuccess(data) {
        var treea = $("#zTreea").tree()
        if (!treea) {
            return;
        }
        //treea.expandAll(true);
        ztreeOnLoadSuccess(data);
    }

    function callOnLoadSuccessFunc(data) {
       	ztreeOnLoadSuccess(data);
		
		var treea = $("#zTreea").tree()
		var nodes =null;
		if (!treea) {
		}else{
			nodes = treea.getNodes();
		}
		updateOnlineStatusAfterTreeLoad(nodes,realId);
		$('.breadLine').trigger('reLayout');
		
    }
	
	var openNodeOnlineMap = {};
	
	function updateOnlineStatusAfterTreeLoad(nodes,rId){
		var init = false;
		if(onlineReady){
			init = true;
		}
		var count = 0;
		var online= 0;
		if (nodes && nodes.length > 0) {
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node.extra == undefined || node.extra.type == 'org') continue;
				count++;
				if(!node.extra.disablecls) online++;
			}
        }
		
		if(!init){
			openNodeOnlineMap[rId] = {};
			openNodeOnlineMap[rId].id = rId;
			openNodeOnlineMap[rId].allCount = count;
			openNodeOnlineMap[rId].onlineCount = online;
		}else{
			var updateNode = updateOnlineMap4OpenNode(count,online,rId);
			//更新页面上的数据
			updateOnlineInfo(onlineMap, resourceGroup,updateNode);
            updateOnlineInfoLabel(onlineMap,updateNode);
		}
	}
	
	function updateOnlineMap4OpenNode(count,online,rId){
		var childCount = 0;
		var childOnline= 0;
		var updateNode = {};
		var node = findChildOrg(resourceGroup,rId);
			if(node && node.children && node.children.length > 0){
				for(var i = 0; i < node.children.length; i++){
					var nId = node.children[i].id;
					childCount += onlineMap[nId].allCount;
					childOnline += onlineMap[nId].onlineCount;
				}
			}
			var oldAllCount = onlineMap[rId].allCount - childCount;
			var oldOnline = onlineMap[rId].onlineCount - childOnline;
			
			var changedAllCount = count - oldAllCount;
			var changedOnline =  online - oldOnline;
			
			var path = onlineMap[rId].path;
			var paths = path.split(',');
			for(var i = 0; i < paths.length; i++){
				var p = paths[i];
				if(p){
					onlineMap[p].allCount = onlineMap[p].allCount + changedAllCount;
					onlineMap[p].onlineCount = onlineMap[p].onlineCount + changedOnline;
					updateNode[p] = 1;
				}
			}
			return updateNode;
	}
	
	function findChildOrg(parent,id){
		if(parent.id == id){
			return parent;
		}
		var children = parent.children;
		if(children && children.length > 0){
			for(var i = 0; i < children.length; i++){
				var node = findChildOrg(children[i],id);
				if(node) return node;
			}
		}
		return null;
	}
	
    function getSettingRes(asyncl, l) {
        return {
        	initBigData: false,
            view : {
                addHoverDom : addHoverDom,
                removeHoverDom : removeHoverDom,
                nameIsHTML : true,
                showTitle : false
            },
            async : {
                enable : true,
                url : "getOrgTree.action",
                autoParam : ["id"],
                otherParam : {
                    "level" : asyncl,
                    append : 0
                }
            },
            callback : {
                onDblClick : dblClickCamera,
                beforeAsync : beforeAsyncNode,
                beforeExpand : zTreeBeforeExpand,
               	onAsyncSuccess : zTreeOnAsyncSuccess,
                initNode : callOnLoadSuccessFunc,
				dataEmpty:callOnLoadSuccessFunc
            }
        };
    }
    $('#tabContent').tabs();
    initMonResource();
	var onlineInterval = null;
    function initMonResource() {
      //$('.breadLine').trigger('reLayout');
        // 默认选中系统组织资源树
        if (0 == res_id) {
            $('#monResource').addClass("simple");
            if(privilegeCodeForFavoriteTree && privilegeCodeForFavoriteTree == '10006')
            	$("#zTreea").html("未分配回放资源，请联系管理员。");
            else
            	$("#zTreea").html("未分配预览资源，请联系管理员。");
        } else if (level == 0) {
            settingRes = getSettingRes(res_level, level);
            $.fn.zTree.init($("#zTreea"), settingRes, resourceGroup);
            //$('.breadLine').css('display','block');
        } else if (resourceGroup && !resourceGroup.emtpy) {
            $("#monResource").removeClass();
            var html = '<ul class="breadcrumbs clearfix">';
            bigLevel = level;
            html += changeBreadLine(null, resourceGroup, 1, res_id);
            html += "</ul>"
            $('#topLevelResource').html(html);
            settingRes = getSettingRes(res_level, level);
            reLoadTree(res_id, res_level, 1,res_id);
            $('.breadcrumbs').xBreadcrumbs();
        }
        $('.breadLine').trigger('reLayout');
        if (favTabSel == 'true') {
            // 选中收藏夹TAB
            $('#tabContent').tabs('select', 1);
        }
        if (onlineInfo == 1 && onlineInterval == null) {
            fetchOnlineInfo();
            onlineInterval = setInterval(fetchOnlineInfo, checkPeriod * 60 * 1000);
        }

    }

 	var onlineMap = {};
	var onlineReady = false;

    function fetchOnlineInfo() {
        $.ajax({
            url : 'getOnlineInfo.action?onlinePfc=' + online_pfc,
            type : 'POST',
            dataType : "json",
            success : function(result) {
                if(online_pfc == 0){
					processAllOnlineInfo(result);
				}else{
					processIncrementalOnlineInfo(result);
				}
            }
        });
    }
	
	function processIncrementalOnlineInfo(result){
		if (result.success && result.onlineInfos) {
			online_pfc = result.onlinePfc;
			var isChange = 0;
			var updateNode  = {};
			var treea = $("#zTreea").tree()
			for (var i = 0; i < result.onlineInfos.length; i++) {
                var onlineInfo = result.onlineInfos[i];
                //如果树不为空，找到状态更新的节点
        		 if (treea) {
				 	 var node = treea.getNodeById("camera-" + onlineInfo.id);
					 if(!node) continue;
					 var orgId = node.extra.orgId;//得到他所在组织的id
					 updateNode[orgId] = 1;//要更新的组织
					 if (onlineInfo.online == 1) {//如果ajax返回的结果里的online状态为1.
						 if(node.extra.disablecls!='disabledNode'){ 
							 continue;
						 }
					 	onlineMap[orgId].onlineCount = onlineMap[orgId].onlineCount + 1;//onlineMap是一个存放所有组织的数组。onlineMap中某个组织的在线数+1，
						treea.setNodeDisabled("camera-" + onlineInfo.id,0);//设置某个camer的disable为false；
						//ie-8下disabled仍然是灰色的，所以这里去除他disabled属性
						$("#zTreea_id_camera-"+onlineInfo.id+"_a").removeAttr("disabled");
						node.extra.disablecls='';
						var parents = onlineMap[orgId].path.split(',');//找到该camera所有的父节点的id。
						for(var j = 0; j < parents.length; j++){
							var pId = parents[j];
							if(!pId || pId == orgId) continue;//如果节点为空，或者是当前camera所在的组织，则不进行onlineCount的更改。
							onlineMap[pId].onlineCount = onlineMap[pId].onlineCount + 1;
							updateNode[pId] = 1;//对改组织进行标记，需要更改。
						}
					 }else{
						 if(node.extra.disablecls=='disabledNode'){
							 continue;
						 }
					 	onlineMap[orgId].onlineCount = onlineMap[orgId].onlineCount - 1;
						treea.setNodeDisabled("camera-" + onlineInfo.id,1);
						$("#zTreea_id_camera-"+onlineInfo.id+"_a").attr("disabled","disabled");
						node.extra.disablecls='disabledNode';
						var parents = onlineMap[orgId].path.split(',');
						for(var j = 0; j < parents.length; j++){
							var pId = parents[j];
							//pid!=orgId
							if(!pId || pId == orgId) continue;
							onlineMap[pId].onlineCount = onlineMap[pId].onlineCount - 1;
							updateNode[pId] = 1;
						}
					 }
					 isChange = 1;//标记isChange为1
				 }
            }
			if(isChange){
				updateOnlineInfo(onlineMap, resourceGroup);//更新结点上的数字 1/52
            	updateOnlineInfoLabel(onlineMap,updateNode);//更新结点的颜色  灰色?黑色
			}
		}
	}
	
	function processAllOnlineInfo(result){
		if (result.success && result.onlineCountInfos&& result.onlineCountInfos.length) {
			onlineReady = true;
			online_pfc = result.onlinePfc;
			var needUpdateNode = [];
            for (var i = 0; i < result.onlineCountInfos.length; i++) {
                var onlineInfo = result.onlineCountInfos[i];
				var id = onlineInfo.id;
                onlineMap[id] = {};
                onlineMap[id].id = id
				onlineMap[id].allCount = parseInt(onlineInfo.allCount);
				onlineMap[id].onlineCount = parseInt(onlineInfo.onlineCount);
				onlineMap[id].path = onlineInfo.path;
					
				if(openNodeOnlineMap[id]){
					needUpdateNode.push(id);
				}
            }
			
			for(var i = 0; i < needUpdateNode.length; i++){
				if(!openNodeOnlineMap[id]) continue;
				var id = needUpdateNode[i];
				var count = openNodeOnlineMap[id].allCount;
				var online = openNodeOnlineMap[id].onlineCount;
				updateOnlineMap4OpenNode(count,online,id);
				openNodeOnlineMap[id] = null;
			}
			
            updateOnlineInfo(onlineMap, resourceGroup,onlineMap);
            updateOnlineInfoLabel(onlineMap,onlineMap);
        }
	}

    function updateOnlineInfoLabel(onlineMap,updateNode) {
        // update topLevelResource
//        $('#topLevelResource a').each(function() {
//            var id = $(this).attr("data-id");
//            if (updateNode[id]) {
//				 var onlineInfo = onlineMap[id];
//                var html = $(this).html().split('(');
//                $(this).html(html[0] + '(<span style="color:red;">' + onlineInfo.onlineCount + "</span>" + "/"
//                        + onlineInfo.allCount + ")");
//            }
//        });
//
//        $('#topLevelResource .end-li').each(function() {
//            var id = $(this).attr("data-id");
//            if (updateNode[id]) {
//           	    var onlineInfo = onlineMap[id];
//                var html = $(this).html().split('(');
//                $(this).html(html[0] + '(<span style="color:red;">' + onlineInfo.onlineCount + "</span>" + "/"
//                        + onlineInfo.allCount + ")");
//            }
//        });
//
//        // update topCategory
//        $('#topCategory a').each(function() {
//            var id = $(this).attr("data-id");
//            if (updateNode[id]) {
//            	var onlineInfo = onlineMap[id];
//                var html = $(this).html().split('(');
//                $(this).html(html[0] + '(<span style="color:red;">' + onlineInfo.onlineCount + "</span>" + "/"
//                        + onlineInfo.allCount + ")");
//            }
//        });

        // 更新树节点状态
        var treea = $("#zTreea").tree()
        if (treea) {
            if (onlineMap) {
                for (var key in updateNode) {
                    var onlineInfo = onlineMap[key];//一个需要更新的组织节点
					if(!onlineInfo) continue;
                    var node = treea.getNodeById(onlineInfo.id);
                    if (node && node.extra && node.extra.type == 'org') {
                        var id = node.id;
                        //var onlineInfo = onlineMap[id];//此语句重复。
                        var html = node.label.split('(');
                        node.label = html[0] + '(<em style="color:red;">' + onlineInfo.onlineCount + "</em>" + "/"
                                + onlineInfo.allCount + ")";
                        if (onlineInfo.allCount == 0) {
							var noChildren = true;
							if(node.isParent && node.children && node.children.length > 0){
								for(var kk = 0; kk < node.children.length;kk++){ 
									if(node.children[kk].extra.type == 'org'){
									    noChildren = false;
										break;
									}
								}
							}
							if (noChildren) {
								treea.removeChildNodes(node);
							}
                        }
                        treea.updateNode(node);
                    }
                }
            }
        }
    }
    /*
     * 参数onlineMap：当前的组织状态
     * parent:所有组织
     * updateNode：需要更新的结点。参数没有作用
     */
    function updateOnlineInfo(onlineMap, parent,updateNode) {
        if (!parent) {
            return;
        }
        var onlineInfo = onlineMap[parent.id];
        if (onlineInfo) {
            var html = parent.label.split("(");
            parent.label = html[0] + '(<em style="color:red;">' + onlineInfo.onlineCount + "</em>" + "/"
                    + onlineInfo.allCount + ")";//更新结点上在线结点数
            if (onlineInfo.allCount == 0) {
				if(parent.isParent && parent.children && parent.children.length > 0){
					parent.isParent = false;
					for(var kk = 0; kk < parent.children.length;kk++){ 
						if(parent.children[kk].extra.type == 'org'){
						    parent.isParent = true;
							break;
						}
					}
				}
            }
        }
        if (parent.children && parent.children.length > 0) {//遍历它的子结点
            for (var i = 0; i < parent.children.length; i++) {
                var child = parent.children[i];
                updateOnlineInfo(onlineMap, child);
            }
        }
    }

    function changeMonResource(id, type) {
        if (type == 0) {
        	if(level > 0)
        		$('.tab-content .breadLine').css('display','block');
            initMonResource();
        } else {
        	$('.tab-content .breadLine').css('display','none');
            loadView(id);
        }
    }

    function loadView(id) {
        $('#monResource').addClass("simple");
        $('.breadLine').trigger('reLayout');

        var treea = $("#zTreea").tree();
        if (treea)
            treea.destroy();
        $("#zTreea").show();
        $("#zTreea").parent().find('.msg-tips.nodata').remove();
        $("#zTreea")
                .html('<div class="grid4" style="padding-top:50px;"><div class="loading"><i></i><span>正在加载中，请稍后...</span></div></div>');
        var viewSetting = {
			initBigData: false,
            view : {
                addHoverDom : addHoverDom,
                removeHoverDom : removeHoverDom,
                nameIsHTML : true
            },
            async : {
                enable : true,
                url : "getViewTree.action",
                autoParam : ["id=viewId"]
            },
            ajax : {
                url : "getViewTree.action?isFindTree=1&id=" + id,
                success : function() {
                    var treea = $("#zTreea").tree();
                    var rootNode = treea.getNodes()[0];
                    if (!rootNode || !rootNode.children)
                       return;
                    //treea.expandNode(rootNode, true, false, true);
                }
            },
            callback : {
                onDblClick : dblClickCamera,
                beforeAsync : beforeAsyncNode,
                beforeExpand : zTreeBeforeExpand
                //onAsyncSuccess : zTreeOnAsyncSuccess,
                //initNode : viewtreeOnLoadSuccess
            }
        };
        $("#zTreea").tree(viewSetting);
    }

    function addHoverDom(treeId, treeNode) {
        if (treeNode.isParent == true)
            return;
        if (!treeNode.extra || !treeNode.extra.type || treeNode.extra.type != 'res') {
            return;
        }
        var aObj = $("#" + treeNode.tId + "_a");
        // 添加操作
        if ($("#diyBtnFav_" + treeNode.id).length > 0)
            return;
         var intelCode = "";
        if(treeNode.extra && treeNode.extra.intelCode)
        	intelCode = treeNode.extra.intelCode;
        var intelChannelNo = "";
        if(treeNode.extra && treeNode.extra.intelChannelNo)
        	intelChannelNo = treeNode.extra.intelChannelNo;
        // 可以加入判断，如果已经是收藏的状态，需要修改a的class和title，如下：
        var editStr = '<span class="node-editor"><a id="diyBtnFav_' + treeNode.id + '" camera-id="' + treeNode.extra.realId + '" camera-label="'
                + treeNode.label + '"  camera-intelCode="'+ intelCode + '" camera-intelChannelNo="'+ intelChannelNo + '" class="act-favorite" href="#" title="收藏"><span class="ico"></span></a></span>';
        if (treeNode.extra && treeNode.extra.fav == 1) {
            editStr = '<span class="node-editor"><a id="diyBtnFav_' + treeNode.id + '" camera-id="' + treeNode.extra.realId + '" camera-label="'
                + treeNode.label + '"  camera-intelCode="'+ intelCode + '" camera-intelChannelNo="'+ intelChannelNo + '" class="act-favorite active" href="#" title="取消收藏"><span class="ico"></span></a></span>';
        }

        aObj.append(editStr);
        // 提示消息
        $('#diyBtnFav_' + treeNode.id).tipsy({
            gravity : 's',
            fade : true,
            html : true
        });
    }
    function removeHoverDom(treeId, treeNode) {
        if (treeNode.isParent == true)
            return;
        // 移除所有操作
        $("#diyBtnFav_" + treeNode.id).unbind().parent().remove();
        $(".tipsy").remove();
    }

    var settingFav = {
		initBigData: false,
        callback : {
            beforeRename : function(treeId, treeNode, newName, isCancel) {
                newName = $.trim(newName);
                treeNode.newName = newName;
                treeNode.oldName = treeNode.label;
                if (newName.length > 32) {
                	jAlert('分组名称过长，不能超过32个字。', '警告', 'attention');
                    var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
					treeNode.label = treeNode.oldName;
					zTreeb.updateNode(treeNode);
                    return false;
                }
                var ASCII_UN_USE = "\\\/:*?\"<|'%>";
                for (var i = 0; i < newName.length; i++) {
                    var tempChar = newName.charAt(i);
                    if (ASCII_UN_USE.indexOf(tempChar) > -1) {
                        $.sticky("分组名称不能包含特殊字符:\\\/:*?\"<|'%>", {
                            type : 'attention'
                        });
                        var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
                        zTreeb.editName(treeNode);
                        return false;
                    }
                }
                return true;
            },
            onRename : function(event, treeId, treeNode) {
                if (treeNode.newName.length == 0) {
                	jAlert('分组名称不能为空。', '警告', 'attention');
					var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
					treeNode.label = treeNode.oldName;
					zTreeb.updateNode(treeNode);
                    return;
                }
                $.ajax({
                    url : pt.ctx + "/web/module/favorite/modifyFavoriteGroup.action",
                    type : 'POST',
                    data : {
                        favoriteGroupId : treeNode.id,
                        favoriteGroupName : treeNode.label
                    },
                    dataType : 'json',
                    success : function(retObj) {
                    	if(retObj && retObj.msg && retObj.msg == "noFavoriteGroup") {
                    		jAlert("该分组已被删除,请刷新页面后重试！", '警告', 'attention');
                    		$.fn.zTree.getZTreeObj("zTreeb").removeChildNodes(treeNode);
                    		$.fn.zTree.getZTreeObj("zTreeb").removeNode(treeNode);
							return;
                    	}
                    	if(retObj && retObj.msg && retObj.msg == "favorite_name_exception") {
                    		jAlert("修改分组失败，请检查名称是否重复。", '警告', 'attention');
                    		//$.fn.zTree.getZTreeObj("zTreeb").removeChildNodes(treeNode);
                    		//$.fn.zTree.getZTreeObj("zTreeb").removeNode(treeNode);
                    		var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
							treeNode.label = treeNode.oldName;
							zTreeb.updateNode(treeNode);
							return;
                    	}
                    	if (retObj && (retObj.fieldErrors || retObj.actionErrors)) {
							for (var index = 0; index < retObj.actionErrors.length; index++) {
								// actionErrors的提示
								jAlert(retObj.actionErrors[index], '警告', 'attention');
								var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
								treeNode.label = treeNode.oldName;
								zTreeb.updateNode(treeNode);
							}
							return;
						}
                        var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
                        zTreeb.updateNode(treeNode);

                        var zTreec = $.fn.zTree.getZTreeObj("zTreec");
                        if(zTreec){
	                        var updateNodeC = zTreec.getNodeById(treeNode.id);
	                        updateNodeC.label = treeNode.label;
	                        zTreec.updateNode(updateNodeC);
						}
                        var zTreed = $.fn.zTree.getZTreeObj("zTreed");
                        if(zTreed){
	                        var updateNodeD = zTreed.getNodeById(treeNode.id);
	                        updateNodeD.label = treeNode.label;
	                        zTreed.updateNode(updateNodeD);
                        }
                        var zTreeX = $.fn.zTree.getZTreeObj("zTree-index");
                        if(zTreeX){
	                        var updateNodeX = zTreeX.getNodeById(treeNode.id);
	                        updateNodeX.label = treeNode.label;
	                        zTreeX.updateNode(updateNodeX);
                        }
                    }
                });
            },
            onDblClick : function(event, treeId, treeNode) {
                if (treeNode && treeNode.id.indexOf('camera-') > -1 && treeNode.extra && treeNode.extra.resourceType == '10000') {
                    // 判断有没有预览权限
                    if (treeNode.extra.hasPreviewPrivilege) {
                        var cameraId = treeNode.extra.realId;
                        var intelCode = "";
                        var intelChannelNo = "";
                        if(treeNode.extra.isIntel){
                        	intelCode = treeNode.extra.intelCode;
                        	intelChannelNo = treeNode.extra.intelChannelNo;
                        }
                        playCamera(cameraId, treeNode.label, intelCode, intelChannelNo,treeNode.extra.indexCode,treeNode.extra.ezvizCameraCode);
                    } else {
                        $.sticky("您没有权限预览此监控点", {
                            type : "st-failure"
                        });
                    }
                }
            }
        },
        view : {
            addHoverDom : function(treeId, treeNode) {
                var aObj = $("#" + treeNode.tId + "_a");
                // 添加操作
                if ($("#diyBtnEdit_" + treeNode.id).length > 0 || $("#diyBtnDelete_" + treeNode.id).length > 0
                        || treeNode.id == "root")
                    return;
                // 可以加入判断，如果已经是收藏的状态，需要修改a的class和title，如下：
                // var editStr = '<a id="diyBtnFav_' + treeNode.id + '"
                // onclick="removeFav(' + treeNode.id + ');"
                // class="act-favorite active" href="#"
                // title="取消收藏"><span class="ico"></span></a>';
                var editStr = '<span class="node-editor">';
                if (treeNode.isParent == true) {
                    var favoriteGroupId = treeNode.id;
                    editStr += '<a id="diyBtnEdit_' + treeNode.id + '" onclick="editFavGroup(' + favoriteGroupId
                            + ');" class="act-edit" href="#" title="编辑"><span class="ico"></span></a>';
                    editStr += '<a id="diyBtnDelete_' + treeNode.id + '" onclick="deleteFavoriteGroup(\'' + favoriteGroupId
                            + '\');" class="act-delete" href="#" title="删除分组"><span class="ico"></span></a>';
                } else {
                    var favoriteId = treeNode.extra.favId;
                    editStr += '<a id="diyBtnDelete_' + treeNode.id + '" onclick="deleteFavorite(\'' + favoriteId + '\',\''
                            + treeNode.id + '\');" class="act-delete" href="#" title="取消收藏"><span class="ico"></span></a>';
                }
                editStr += '</span>';
                aObj.append(editStr);
                // 提示消息
                if (treeNode.isParent == true) {
                    $('#diyBtnEdit_' + treeNode.id).tipsy({
                        gravity : 's',
                        fade : true,
                        html : true
                    });
                }
                $('#diyBtnDelete_' + treeNode.id).tipsy({
                    gravity : 's',
                    fade : true,
                    html : true
                });
            },
            removeHoverDom : function(treeId, treeNode) {
                // 移除所有操作
                if (treeNode.isParent == true) {
                    $("#diyBtnEdit_" + treeNode.id).unbind().parent().remove();
                }
                $("#diyBtnDelete_" + treeNode.id).unbind().parent().remove();
                $(".tipsy").remove();
            }
        },
        ajax : {
            // url:"tree_with_folder.json"
            url : pt.ctx + "/web/module/favorite/getFavoriteTree.action",
            data : {
                selectedIds : '',
                privilegeCode : privilegeCodeForFavoriteTree
            }
        }
    };
    var treeb = $("#zTreeb").tree(settingFav);

    // Dialog of adding new folder
    $('#folderDialog').dialog({
        autoOpen : false,
        modal : false,
        width : 520,
        buttons : {
            "ok" : {
                text : '确定',
                'class' : 'bPrimary',
                click : function() {
                    var favoriteGroupName = $("#favoriteGroupName").val();
                    favoriteGroupName = $.trim(favoriteGroupName);
                    if (favoriteGroupName == '') {
                        // $.sticky("分组名称不能为空",{type:'attention'});
                        $("#favoriteGroupName").validate();
                        return;
                    }

                    var ASCII_UN_USE = "\\\/:*?\"<|'%>";
                    for (var i = 0; i < favoriteGroupName.length; i++) {
                        var tempChar = favoriteGroupName.charAt(i);
                        if (ASCII_UN_USE.indexOf(tempChar) > -1) {
                            // $.sticky("分组名称不能包含特殊字符:\\\/:*?\"<|'%>",{type:'attention'});
                            $("#favoriteGroupName").validate();
                            return;
                        }
                    }

                    // 按钮disable，防止重复提交
                    $('#folderDialog').parent().find('.bPrimary').attr('disabled', 'disabled');

                    var parentFavoriteGroupId = null;
                    var treec = $.fn.zTree.getZTreeObj("zTreec");
                    if (treec.getSelectedNodes().length > 0) {
                        parentFavoriteGroupId = treec.getSelectedNodes()[0].id;
                    }
                    if(treec.getSelectedNodes()[0].level > 3) {
						jAlert('分组不能超过5级!', '警告', 'attention');
						// 按钮恢复成可点击状态
						$('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
                        return;
                    }
                    
                    // alert(favoriteGroupName + ","
                    // + parentFavoriteGroupId);
                    // AJAX保存
                    $.ajax({
                        url : pt.ctx + "/web/module/favorite/addFavoriteGroup.action",
                        type : 'POST',
                        data : {
                            favoriteGroupName : favoriteGroupName,
                            parentFavoriteGroupId : parentFavoriteGroupId
                        },
                        dataType : 'json',
                        success : function(retObj) {
	                        if(retObj.msg && retObj.msg == "noFavoriteGroup") {
	                    		jAlert("父级分组已被删除，请重新选择父级分组添加", '警告', 'attention');
								// 按钮恢复成可点击状态
								$('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
								return;
	                    	}else if(retObj.msg && retObj.msg == "favorite_name_repeat") {
	                    		jAlert("存在同名的分组，请重新输入", '警告', 'attention');
								// 按钮恢复成可点击状态
								$('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
								return;
	                    	}else if(retObj.msg && retObj.msg == "favorite_name_exception") {
	                    		jAlert("添加分组出错，请稍后重试", '警告', 'attention');
								// 按钮恢复成可点击状态
								$('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
								return;
	                    	}
                        	// 有错误，则提示错误
                        	if (retObj.fieldErrors || retObj.actionErrors) {
								for (var index = 0; index < retObj.actionErrors.length; index++) {
									// actionErrors的提示
									jAlert(retObj.actionErrors[index], '警告', 'attention');
								}
								// 按钮恢复成可点击状态
								$('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
								return;
							}
                            // 构造要添加的分组信息
                            var newNode = [{
                                id : retObj.id,
                                label : retObj.label,
                                isParent : true,
                                cls : 'folder'
                            }]
                            var zTreed = $.fn.zTree.getZTreeObj("zTreed");
                            if(zTreed){
	                             var parentNode = null;
	                            if (parentFavoriteGroupId != null) {
	                                parentNode = zTreed.getNodeById(parentFavoriteGroupId);
	                            }
	                            zTreed.addNodes(parentNode, newNode, false);
                            }

                            var zTreec = $.fn.zTree.getZTreeObj("zTreec");
                            if(zTreec){
	                            parentNode = null;
	                            if (parentFavoriteGroupId != null) {
	                                parentNode = zTreec.getNodeById(parentFavoriteGroupId);
	                            }
	                            zTreec.addNodes(parentNode, newNode, false);
							}
                            var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
                            parentNode = null;
                            if (parentFavoriteGroupId != null) {
                                parentNode = zTreeb.getNodeById(parentFavoriteGroupId);
                            }
                            zTreeb.addNodes(parentNode, newNode, false);
                            
                            var zTreeX = $.fn.zTree.getZTreeObj("zTree-index");
							if(zTreeX){
	                			parentNode = null;
	                            if (parentFavoriteGroupId != null) {
	                                parentNode = zTreeX.getNodeById( parentFavoriteGroupId);
	                            }
	                            zTreeX.addNodes(parentNode, newNode, false);
							}
                            // 按钮恢复成可点击状态
                            $('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
                            $('#folderDialog').dialog("close");
                            $.sticky("添加分组成功", {
			                    type : "ok"
			                });
                        },
                        error : function(msg) {
                            // 按钮恢复成可点击状态
                            $('#folderDialog').parent().find('.bPrimary').removeAttr('disabled');
                        }
                    });
                }
            },
            "cancel" : {
                text : '取消',
                click : function() {
                    //$(this).dialog("close");
            		this.close();
                }
            }
        }
    });
    // Dialog Link
    $('[data-trigger="addFolder"]').click(function() {   
		initTreeIfNotExit("zTreec");     
	    $('#folderDialog').dialog('open');
        $("#favoriteGroupName").val('');
        return false;
    });

    $(".searchLine input[name=search]").keydown(function(event) {
        if (event.which == 13) {
            search();
        }
    });
    $(".searchLine button[name=find]").mouseup(function() {
        search(1);
    });

    function search(startPage) {
        var keyword = $(".searchLine input[name=search]").val();
        keyword = $.trim(keyword);
        if('请输入关键字'==keyword){
        	keyword = '';
        }
//        if (keyword == "" || keyword == $(".searchLine input[name=search]").attr('placeholder')) {
//        	 $('.treeview .spot-list').empty();
//             $('.pagination-mini .pages').empty();
//             $('.treeview .spot-list').append('<div style="padding-left:10px; background-color:#79a4e1; color:#fff">共找到 '
//                        + 0 + ' 条记录</div>');
//            return;
//        }
        $.ajax({
            url : pt.ctx + '/web/module/search/search-ajaxPreviewSearch.action',
            type : 'POST',
            data : {
                keyword : keyword,
                indexType : 'camera',
                privilegeCodes : privilegeCodeForFavoriteTree,
                start : startPage
            },
            dataType : 'json',
            success : function(retObj) {
                $('.treeview .spot-list').empty();
                $('.pagination-mini .pages').empty();
                var total = retObj.total;
                var result = retObj.result;
                var pageNo = retObj.pageNo;
                var pageSize = retObj.pageSize;
                $('.treeview .spot-list').append('<div style="padding-left:10px; background-color:#79a4e1; color:#fff">共找到 '
                        + total + ' 条记录</div>');
                if (total == 0) {
                    return;
                }
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    var intelCode = "";
                    var intelChannelNo = "";
                    if(item.intelCode){
                    	intelCode = item.intelCode;
                    }
                    if(item.intelChannelNo){
                    	intelChannelNo = item.intelChannelNo;
                    }
                    var detailJson = $.parseJSON(item.detail);
                    var recordHtml = '<dl>';
                    recordHtml += '<dt><h6>';
                    var addCls = "";
                    if(item.isIntel){
                    	addCls = "-intel";
                    }
                    if(detailJson.videoType=='16'||detailJson.videoType=='鱼眼'){
                    	addCls = "-yuyan";
                    }
                    recordHtml += '<span class="ico ' + detailJson.iconCls + addCls +'"></span>';
                    recordHtml += item.name + '</h6>';
                    recordHtml += '<span class="more">';
                    if (item.isFavorite == false) {
                        recordHtml += '<a camera-id="' + detailJson.id
                                + '" camera-intelCode = "' + intelCode + '" camera-intelChannelNo = "' + intelChannelNo + '" class="act-favorite tipS" href="#" camera-label="'
                				+ detailJson.name + '" title="收藏"><span class="ico"></span></a>';
                    } else {
                        recordHtml += '<a camera-id="' + detailJson.id
                                + '" camera-intelCode = "' + intelCode + '" camera-intelChannelNo = "' + intelChannelNo + '" class="act-favorite active tipS" href="#"  title="取消收藏"><span class="ico"></span></a>';
                    }
                    if (item.hasPreviewPrivilege) {
                        var name = detailJson.name;
                        if(item.intelCode && item.intelChannelNo){
                        	 recordHtml += '<a class="act-play tipS" href="#" onclick="playCamera(' + detailJson.id + ',\'' + name
                                + '\',\''+intelCode + '\',\''+ intelChannelNo + '\',\''+detailJson.indexCode+'\');" title="播放"><span class="ico"></span></a>';
                        }
                        else{
                        	recordHtml += '<a class="act-play tipS" href="#" onclick="playCamera(' + detailJson.id + ',\'' + name
                                + '\',null,null,\''+detailJson.indexCode+'\');" title="播放"><span class="ico"></span></a>';
                        }
                    }
                    recordHtml += '</span>';
                    recordHtml += '</dt>';
                    recordHtml += '<dd>';
                    recordHtml += '所属组织：' + item.orgName + '<br/>所属设备：' + item.deviceName;
                    recordHtml += '</dd>';
                    recordHtml += '</dl>';
                    $('.treeview .spot-list').append(recordHtml);
                }
                $('.treeview .spot-list')[0].scrollTop =0;
//

            	var unit = parseInt((pageNo-1)/5)*5+1;
                $('.pagination-mini .pages').append('<li class="prev"><a href="#" '
                        + (unit<5 ? 'disabled="disabled"' : '') + ' targetPage="' + (pageNo<5?1:pageNo - 5) + '">&lt;</a></li>');
                var totalPage = total % pageSize == 0 ? total / pageSize : parseInt(total / pageSize) + 1;

                if (totalPage <= 5) {
                    for (var i = 1; i <= totalPage; i++) {
                        $('.pagination-mini .pages').append('<li><a href="#" targetPage="' + i + '" '
                                + (i == pageNo ? 'class="active"' : '') + '>' + i + '</a></li>');
                    }
                } else {
                    for (var i = unit; i < unit+5&&i<=totalPage; i++) {
                        $('.pagination-mini .pages').append('<li><a href="#" targetPage="' + i + '" '
                                + (i == pageNo ? 'class="active"' : '') + '>' + i + '</a></li>');
                    }
                }
                $('.pagination-mini .pages').append('<li class="next"><a href="#"'
                        + (unit+5 > totalPage ? 'disabled="disabled"' : '') + 'targetPage="' + ((pageNo + 5)>totalPage?totalPage:(pageNo + 5))
                        + '">&gt;</a></li>');
            }
        });
    }

    $('.pagination-mini .pages').delegate('a[disabled!="disabled"]', 'click', function() {
        var targetEl = $(this);
        if (targetEl.hasClass('active')) {
            return;
        }
        var pageNo = targetEl.attr('targetPage');
        search(pageNo);
    });
});

function initTreeIfNotExit(id){
		var tree = $("#" + id).tree();
		if(tree) return;
		if(id == "zTreec"){
			$("#zTreec").tree({
		        ajax : {
		            url : pt.ctx + "/web/module/favorite/getFavoriteGroupTree.action"
		        },
	            callback: {
	                initNode: function(nodes){
	                    this.selectNode(this.getNodes()[0]);
	                }
	            }
		    });
		}else if(id == "zTreed"){
			$("#zTreed").tree({
		        ajax : {
		            url : pt.ctx + "/web/module/favorite/getFavoriteGroupTree.action"
		        },
	            callback: {
	                initNode: function(nodes){
	                    this.selectNode(this.getNodes()[0]);
	                }
	            }
		    });
		}
	}

/** 以下为全局函数 */


// 添加监控点至收藏
function addCameraToFav(cameraId, cameraName, intelCode, intelChannelNo) {
    // Dialog of adding to favorite
    $('#favoriteDialog').dialog({
        autoOpen : false,
        modal : false,
        width : 450,
        buttons : {
            "addfolder" : {
                text : '添加新分组',
                'class' : 'floatL',
                click : function() {
					initTreeIfNotExit("zTreec");
                    $('#folderDialog').dialog('open');
                }
            },
            "ok" : {
                text : '确定',
                'class' : 'bPrimary',
                click : function() {
                    var favoriteGroupId = null;
                    var favoriteGroupName = "我的收藏";
                    var zTreed = $.fn.zTree.getZTreeObj("zTreed");
                    if (zTreed.getSelectedNodes().length > 0) {
                        var selNode = zTreed.getSelectedNodes()[0];

                        if (selNode.id != "root") {
                            favoriteGroupId = selNode.id;
                            favoriteGroupName = selNode.label;
                        }
                    }

                    $.ajax({
                        url : pt.ctx + "/web/module/favorite/addCameraToFavorite.action",
                        type : 'POST',
                        data : {
                            cameraId : cameraId,
                            favoriteGroupId : favoriteGroupId
                        },
                        dataType : 'json',
                        success : function(retObj) {
                            // 有错误，则提示错误
                        	if (retObj.fieldErrors || retObj.actionErrors) {
								for (var index = 0; index < retObj.actionErrors.length; index++) {
									// actionErrors的提示
									$.sticky(retObj.actionErrors[index], {
										type : "error"
									});
								}
								return;
							}
							if (retObj && retObj.msg == "noCamera") {
								jAlert("该监控点已被删除", '警告', 'attention');
								return;
							}
							if (retObj && retObj.msg == "noFavoriteGroup") {
								jAlert("您选中的分组已被删除，请刷新页面重试！", '警告', 'attention');
								return;
							}
							if (retObj && retObj.msg == "error") {
								jAlert("添加失败，请稍后重试！", '警告', 'attention');
								return;
							}
							var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
	                        var node = zTreeb.getNodeById("camera-" + cameraId);
                            if (node&&node.extra.hasPreviewPrivilege) {
                                return;
                            }
							// 添加成功后在收藏树中加上刚收藏的点
                            var newNode = {};
                            if(intelCode && intelChannelNo){
                            	newNode = {
                                	id : 'camera-' + cameraId,
                                	label : retObj.label,
                               		cls : retObj.cls + "-intel",
                                	extra : {
                                    	resourceType : '10000',
                                   		realId : cameraId,
                                    	hasPreviewPrivilege : true,
                                    	favId : retObj.id,
                                    	isIntel : true,
                                    	intelCode : intelCode,
                                    	intelChannelNo : intelChannelNo
                                	}
                            	}
                            }else{
                            	newNode = {
                                	id : 'camera-' + cameraId,
                                	label : retObj.label,
                               		cls : retObj.cls,
                                	extra : {
                                    	resourceType : '10000',
                                   		realId : cameraId,
                                    	hasPreviewPrivilege : true,
                                    	favId : retObj.id
                                	}
                            	}
                            }
                            if(retObj.videoType==16||retObj.videoType=='16'){
                            	newNode.cls=retObj.cls+'-yuyan';
                            }
                            var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
                            var parentNode = null;
                            if (favoriteGroupId != null) {
                                parentNode = zTreeb.getNodeById(favoriteGroupId);
                            } else {
                                parentNode = zTreeb.getNodeById('root');
                            }
                            zTreeb.addNodes(parentNode, newNode, false);
                            
                            afterCameraAddedToFav(cameraId);

                            // 成功后再关闭窗口
                            $('#favoriteDialog').dialog("close");
							
                            cameraName = cameraName || retObj.label;
                            $.sticky("监控点[" + cameraName + "]已成功加入收藏夹：" + favoriteGroupName, {
                                type : "ok"
                            });

                        }
                    });

                }
            },
            "cancel" : {
                text : '取消',
                click : function() {
                   //$(this).dialog("destroy");
                    this.close();
                }
            }
        }
    });
	initTreeIfNotExit("zTreed");
    $('#favoriteDialog').dialog('open');
    return false;
}

// 编辑分组
function editFavGroup(favoriteGroupId) {
    var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
    var treeNode = zTreeb.getNodeById(favoriteGroupId);
    zTreeb.editName(treeNode);
}

// 从收藏中删除指定的监控点
function removeCameraFromFav(cameraId) {
    $.ajax({
        url : pt.ctx + "/web/module/favorite/removeCameraFromFavorite.action",
        type : 'POST',
        data : {
            cameraId : cameraId
        },
        dataType : 'json',
        success : function(retObj) {
            // 删除收藏树上对应的点
            var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
            var allNodes = zTreeb.transformToArray(zTreeb.getNodes());

            for (var i = 0; i < allNodes.length; i++) {
                var node = allNodes[i];
                if (node.extra && node.extra.resourceType == '10000') {
                    if (node.extra.realId == cameraId) {
                        zTreeb.removeNode(node);
                        node.getParentNode() && (node.getParentNode().isParent = true);
                    }
                }
            }

            afterCameraRemovedFromFav(cameraId);

            $.sticky("取消收藏成功。", {
                type : "ok"
            });
        }
    });
}

// 监控点添加至收藏后的状态同步处理
function afterCameraAddedToFav(cameraId) {
    // 搜索结果对应节点状态变化
    if ($('a[camera-id=' + cameraId + ']')) {
        // 页面上收藏状态的变化
       $('a[camera-id=' + cameraId + ']').addClass('active').attr('title', '取消收藏');
    }

    // 预览树上对应节点状态的变化
    var treea = $("#zTreea").tree();
    if (treea) {
        var node = treea.getNodeById("camera-" + cameraId);
        if (node) {
            node.extra.fav = 1;
        }
    }
}

// 监控点从收藏夹中删除后的状态同步处理
function afterCameraRemovedFromFav(cameraId) {
    if ($('a[camera-id=' + cameraId + ']')) {
        // 页面上收藏状态的变化
        $('a[camera-id=' + cameraId + ']').removeClass('active').attr('title', '收藏');
    }

    // 预览树上对应节点状态的变化
    var treea = $("#zTreea").tree();
    if (treea) {
        var node = treea.getNodeById("camera-" + cameraId);
        if (node) {
            node.extra.fav = 0;
        }
    }
}

// 删除收藏树上的收藏
function deleteFavorite(favoriteId, id) {
    $.ajax({
        url : pt.ctx + "/web/module/favorite/deleteFavorite.action",
        type : 'POST',
        data : {
            favoriteId : favoriteId
        },
        dataType : 'json',
        success : function(retObj) {
            var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
            var treeNode = zTreeb.getNodeById(id);
            zTreeb.removeNode(treeNode);
            treeNode.getParentNode() && (treeNode.getParentNode().isParent = true);

            var cameraId = id.split("-")[1];

            afterCameraRemovedFromFav(cameraId);

            $.sticky("删除收藏成功", {
                type : "ok"
            });
        }
    });
    return false;
}

// 删除收藏树上的分组
function deleteFavoriteGroup(favoriteGroupId) {
    jConfirm('确定要删除此分组吗？', '删除分组', function(r) {
        if (r) {
            $.ajax({
                url : pt.ctx + "/web/module/favorite/deleteFavoriteGroup.action",
                type : 'POST',
                data : {
                    favoriteGroupId : favoriteGroupId
                },
                dataType : 'json',
                success : function(retObj) {
					var zTreeb = $.fn.zTree.getZTreeObj("zTreeb");
					var treeNode = zTreeb.getNodeById(favoriteGroupId);
					if(retObj && retObj.msg && retObj.msg == "noFavoriteGroup") {
	            		jAlert("该分组已被删除，请刷新页面后重试！", '警告', 'attention');
	            		zTreeb.removeNode(treeNode);
						return;
					}

                    // 把资源树及搜索结果中的监控点的收藏状态变成未收藏
                    var allSubNodes = zTreeb.transformToArray(treeNode.children);
                    for (var i = 0; i < allSubNodes.length; i++) {
                        var currentNode = allSubNodes[i];
                        if (currentNode.isParent == false) {
                            var cameraId = currentNode.id.split("-")[1];
                            afterCameraRemovedFromFav(cameraId);
                        }
                    }

                    zTreeb.removeNode(treeNode);
                    treeNode.getParentNode() && (treeNode.getParentNode().isParent = true);

                    var zTreec = $.fn.zTree.getZTreeObj("zTreec");
                    if(zTreec){
	                    var removeNodeC = zTreec.getNodeById(favoriteGroupId);
	                    zTreec.removeNode(removeNodeC);
	                    removeNodeC.getParentNode() && (removeNodeC.getParentNode().isParent = true);
					}
					var zTreed = $.fn.zTree.getZTreeObj("zTreed");
					if(zTreed){
	                    var removeNodeD = zTreed.getNodeById(favoriteGroupId);
	                    zTreed.removeNode(removeNodeD);
	                    removeNodeD.getParentNode() && (removeNodeD.getParentNode().isParent = true);
					}
					var zTreeX = $.fn.zTree.getZTreeObj("zTree-index");
					if(zTreeX){
	                	var removeNodeX = zTreeX.getNodeById(favoriteGroupId);
	                    zTreeX.removeNode(removeNodeX);
	                    removeNodeX.getParentNode() && (removeNodeX.getParentNode().isParent = true);
					}
                    $.sticky("删除分组成功", {
                        type : "ok"
                    });
                }
            });
        }
    });
}