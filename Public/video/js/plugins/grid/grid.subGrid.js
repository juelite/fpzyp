/**
 * Created with JetBrains WebStorm.
 * User: wanqiongyao
 * Date: 15-6-2
 * Time: 下午7:50
 * To change this template use File | Settings | File Templates.
 */

;(function ($) {

    var  subGridOptions = {
        plusicon : 'ui-icon-plus',
        minusicon : 'ui-icon-minus',
        openicon: 'ui-icon-carat-1-sw',
        expandOnLoad : false,
        selectOnExpand : false,
        reloadOnExpend : true,
        subGridWidth : 20,
        ajaxSubGridOptions : {
        }
    };

   $.extend($.grid._events || {},{
        'click|.grid-subRow a' : 'addSubGrid'
    });

    $.extend($.grid.prototype,{
        addAdditional : function(){
            if(this.settings.subGrid){
               var obj = {};
                obj.name = 'bl';
                obj.el = this.addSubRow;
                obj.callback = this.viewSubRow;
                this.additionalCols.push(obj); 
            } 
        },
        addSubRow : function(name){
            var settings = this.settings;
            if(settings.subGrid){
                settings.colName.unshift('');
                settings.colModel.unshift({
                    name: name,
                    width: settings.subGridWidth,
                    sortable: false,
                    style: {textAlign: 'center'},
                    resizAble: false,
                    fixed: true
                });
            }
        },
        parseSubGridData : function(obj,trId){
            var index = this.getGridDataIndex(trId), rows = this._pageData.rows,tData = {};
            for(var i =0,len = obj.settings.subGridModel.params.length; i < len; i++){
                sid = obj.settings.subGridModel.params[i];
                tData[sid]  = rows[index][sid];
            }
            var success = obj.settings.ajaxSubGridOptions.success;
            $.ajax($.extend(true,{},{
                url : obj.settings.subGridUrl
            },this.settings.ajaxOptions,this.settings.ajaxSubGridOptions,{
                 data : tData,
                success : function(data, textStatus){
                    obj.filterSubGridData.call(obj,"subGrid_" + trId,data);
                    if(success)
                        success.call(obj,data);
                }
            }));
        },
        viewSubRow : function (rowdata, idr, i, colModel) {
            var id = this.id, style = this.setCellAttr('', colModel);

            rowdata.push('<td role="gridcell" class="grid-subRow"'+style+'>');
            rowdata.push('<a role="subrow" type="c id="subGrid_'+id+"_"+idr+'" class="ui-icon '+ this.settings.plusicon+'" name="subGrid_'+id+"_"+idr+'"></a>');
            rowdata.push("</td>");
        },
        viewSubFirstCell : function(rowdata, idr, i, colModel){
            var id = this.id, style = this.setCellAttr('', colModel);

            rowdata.push('<td role="gridcell" class="grid-subRow"'+style+'>');
            rowdata.push('<a role="subrow" type="c id="subGrid_'+id+"_"+idr+'" class="ui-icon '+ this.settings.openicon+'" name="subGrid_'+id+"_"+idr+'"></a>');
            rowdata.push("</td>");
        },
        viewSubGrid : function(subId){
            var settings = this.settings,table = ["<table class='ui-jqgrid-htable'><thead><tr>"];
            for(var i= 0,len = settings.subGridModel.name.length; i< len; i++){
                table.push('<th class="ui-state-default ui-th-column ui-th-ltr" style= "width:'+ settings.subGridModel.width[i]+'px;">' + settings.subGridModel.name[i] + '</th>');
            }
            table.push("</tr></thead><tbody></tbody></table>");
            this.wrap.find('#'+subId).append(table.join(''));
        },
        filterSubGridData : function(subId,data){
            var trs = [];
            for(var i= 0,len = data.length;i<len;i++){
                trs.push("<tr class='ui-widget-content jqgrow ui-row-ltr'>");
                for(var prop in data[i]){
                    trs.push("<td>" + data[i][prop] + "</td>")
                }
                trs.push("</tr>");
            }

            this.wrap.find("#" + subId + " tbody").append(trs.join(''));
        },
        subGridRowExpanded : function(obj,subGridId,trId){
             if(typeof obj.settings.subGridRowExpanded == 'function'){
                obj.settings.subGridRowExpanded(subGridId,trId);
            }else{
                obj.viewSubGrid.call(obj,subGridId);
                obj.parseSubGridData(obj,trId);
            }
        },
        subGridRowColapsed : function(obj,subGridId,trId){
             if(typeof obj.settings.subGridRowColapsed == 'function'){
                obj.settings.subGridRowColapsed(subGridId,trId);
            }
        }
    });

    $.extend($.grid || {},
        {
        addSubGrid : function(event,obj,wrap,tableId){
            var trId = this.closest('tr').attr('id'),subGridId = "subGrid_" + trId,subGrid = wrap.find('#' + subGridId),subTr = [],colModel,data
            additionalLength = obj.additionalCols.length,pColModel = obj.settings.colModel,pColModelL = 0;
            if(this.hasClass(obj.settings.plusicon)){//展开去加载
                if(obj.settings.subGridBeforeExpand){
                    obj.settings.subGridBeforeExpand.apply(this,[event,obj]);
                }
               if(subGrid.length){//已有隐藏的，直接显示
               
                subGrid.closest('tr').show();
            }else{
                colModel = obj.settings.colModel;
                subTr.push('<tr role="row" class="ui-widget-content jqgrow ui-row-ltr ui-subgrid">');

                for (var z=0 ;z < additionalLength;z++) {
                    if(obj.additionalCols[z].name == 'bl'){
                        obj.viewSubFirstCell(subTr,trId,(additionalLength-z),colModel);
                    }else
                        obj.additionalCols[z].callback.apply(obj,[subTr,trId,(additionalLength-z),colModel]);
                }

                for(var j=0,len = pColModel.length;j<len;j++){
                    if(!pColModel[j].hidden)
                        pColModelL++;
                }
                subTr.push('<td class = "subgrid-pTd" colspan="'+ (pColModelL-additionalLength)+'">');
                subTr.push('<div id="'+subGridId+'"></div></td>');
                subTr.push('</tr>');
                $('#'+trId).after(subTr.join(''));
                obj.subGridRowExpanded(obj,subGridId,trId);
            } 
             this.removeClass(obj.settings.plusicon).addClass(obj.settings.minusicon);
            }else if(this.hasClass(obj.settings.minusicon)){
                if(obj.settings.reloadOnExpend){
                    subGrid.closest('tr').remove();
                }else{
                    subGrid.closest('tr').hide();
                }
                 this.removeClass(obj.settings.minusicon).addClass(obj.settings.plusicon);
                 obj.subGridRowColapsed(obj,subGridId,trId);
            }
            
        }
    });

    $.grid.prototype.exSetting(subGridOptions);
}) (jQuery);
