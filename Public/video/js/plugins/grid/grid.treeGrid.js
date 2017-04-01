(function ($) {

    var  treeOptions = {
        treeGrid : false,
        expandColumn : '',
        leafIcon : 'ui-icon-radio-off',
        parentIcon : 'ui-icon-triangle-1-e',
        expendPIcon : 'ui-icon-triangle-1-s',
        treeGridModel : {
            params : ['id']
        }
    };

   $.extend($.grid._events || {},{
       'click|.grid-treeIcon' : 'addTreeRow'
    });

    $.extend($.grid.prototype,{
        addTreeRows : function(html,curTr){
            var elem = $(html.join('')),rows = this._pageData.rows;
            elem.insertAfter(curTr).show();
           // this._keyIndex[id] = rows.length;

        },
        createRows : function(rows, rowData, m,level){
            if (!$.isArray(rows)) {
                rows = [rows]
            }

            if(!level)
                level = 0;
            var length = rows.length, settings = this.settings, colModel = settings.colModel,
                i = 0, z, colval,additionLength = this.additionalCols.length, j;

            for (; i < length; i++, m++) {
                z = 0;
                j =0;
                idr = this.createId(rows[i]);
                this.viewTr(rowData, idr, 0,level);
                for (;z < additionLength;z++) {
                    colval = colModel[z];

                    this.additionalCols[z].callback.call(this,rowData, idr, m, colval);
                    j++;
                }

                for (; j < colModel.length; j++) {
                    if (this.isCreateCell(j)) {
                        this.viewCell(rowData, rows[i][colModel[j].name] || '', rows[i], colModel[j].formart, colModel[j],level);
                    }
                }
                this.viewTrEnd(rowData);
                if(rows[i].data && rows[i].data.length){
                    this.createChildRows(rows[i].data,rowData,level + 1);
                }
            }
        },
        createChildRows  : function(data,rowsHtml,level){
            rowsHtml.push('<tr style="display:none;">');
            var showCols = 0;
            $.each(this.settings.colModel,function(i,obj){
                if(!obj.hidden)
                    showCols++;
            });
            rowsHtml.push('<td colspan="',showCols ,'" style="border:none;">');
            rowsHtml.push('<table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;border-collapse:separate;"><tbody>');
            this.groupHeaderModel(rowsHtml);
            this.createRows(data,rowsHtml,0,level);
            rowsHtml.push('</tbody></table></td></tr>');

        },
        viewCell: function(rowdata, data, dataRow, fn, colModel,level) {
            var val = $.grid.dataFormart(data, dataRow, fn), style,id = this.id ,expandIcon = '' ;

            data = $.grid.stripHtml(data);
            if(colModel.name == this.settings.expandColumn){
                colModel.style = colModel.style ? colModel.style + ';text-align:left;' : ';text-align:left;';
                for(var i =0; i< level; i++){
                    expandIcon += '<span class="treeGrid-indent"></span>'
                }
                expandIcon += '<a href="javascript:void(0);" class="grid-treeIcon"><span class="ui-icon ' + ((dataRow.isParent) ? this.settings.parentIcon : this.settings.leafIcon) +'"></span></a>'
            }
            style = this.setCellAttr(data, colModel);
            rowdata.push('<td role="gridcell" '+style+' aria-describedby="gd_'+ id + '_' + colModel.name +'">'+ expandIcon + val+'</td>');
        },
        expandTreeNode : function(data,level,curTr){
            var html = [];
            this.createChildRows(data,html, level + 1);
            this.addTreeRows(html,curTr);
            this._pageData.rows.push(data);
            this.settings.data.push(data);
        }
    });

    $.extend($.grid || {},{
        addTreeRow : function(event,obj,wrap){
            var $curTr = this.closest('tr'),trId = $curTr.attr('id'),level,that = this,classNm = event.target.className,nextTr = $curTr.next(), level = nextTr.attr('data-level');
            if(classNm.indexOf(obj.settings.leafIcon) > -1) //子节点
                return;
            else if(classNm.indexOf(obj.settings.parentIcon) > -1){    //展开
                $(event.target).removeClass(obj.settings.parentIcon).addClass(obj.settings.expendPIcon);
                if(obj.settings.dataType == 'local'){
                   nextTr.show();
                }else if(obj.settings.dataType == 'ajax'){
                    $.ajax({
                       url : obj.settings.treeGridUrl,
                       dataType : 'json',
                       data : [trId],
                       success : function(data){
                          var lev = parseInt(level,10);
                          obj.expandTreeNode.apply(obj,[data,lev,$curTr]);
                       }
                    });
                }
            }else{  //合并
                $(event.target).removeClass(obj.settings.expendPIcon).addClass(obj.settings.parentIcon);
                if(obj.settings.dataType == 'local'){
                    nextTr.hide();
                }else if(obj.settings.dataType == 'ajax'){
                    nextTr.remove();
                }
            }
            obj.changeMarkAndView();
        }
    });

    $.grid.prototype.exSetting(treeOptions);
}) (jQuery);
